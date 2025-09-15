import axios from 'axios';
import logger from '@/lib/logger';
import { clearSessionData } from '../utils/sessionManager';

// Function to get JWT Token
const getJwtToken = () => {
  return localStorage.getItem('token');
};

// Access Token
const API_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN;
const API_URL = process.env.NEXT_PUBLIC_API_URL;

const createAxiosInstance = (isJWT = true) => {
  const axiosInstance = axios.create();

  // Add a request interceptor
  axiosInstance.interceptors.request.use(
    (config) => {
      if (isJWT) {
        // Set the JWT authentication header
        config.headers['Authorization'] = getJwtToken();
        config.params = { ...config.params };
      } else {
        // Remove the JWT header and use a query parameter
        delete config.headers['Authorization'];
        config.params = {
          ...config.params,
          token: API_TOKEN?.replace(/[\u200B-\u200D\uFEFF]/g, '').trim(),
        };
      }
      // config.withCredentials = true;
      config.baseURL = API_URL;
      return config;
    },
    (error) => {
      // Log request errors
      logger.error('Request Error', {
        error,
        url: error.config?.url,
        method: error.config?.method,
      });
      return Promise.reject(error);
    },
  );

  // Add a response interceptor to handle errors globally
  axiosInstance.interceptors.response.use(
    (response) => {
      // On successful response, check for the new token in 'x-access-token' header
      const newToken = response.headers['x-access-token'];
      if (newToken && typeof newToken === 'string') {
        logger.info('Successfully refreshed and storing new auth token.');
        // Replace the token in localStorage
        localStorage.setItem('token', newToken);
      }
      return response;
    },
    (error) => {
      // Log API errors to Slack for better tracking
      logger.error('API Response Error', {
        message: error.message,
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        data: error.response?.data,
      });

      // Handle 401 Unauthorized - session expired
      if (error.response?.status === 401) {
        logger.error('Session expired. Logging out.');
        clearSessionData();

        // Redirect to login page. This ensures a full page reload, clearing any in-memory state.
        if (typeof window !== 'undefined') {
          window.location.href = '/user/login?session_expired=true';
        }
        return Promise.reject(error); // Important to reject after handling
      }

      if (error.response?.status === 403) {
        // Dispatch forbidden state to Redux store
        const forbiddenEvent = new CustomEvent('forbidden-access', {
          detail: {
            message: "You don't have permission to access this resource",
            timestamp: Date.now(),
            url: error.config?.url || 'unknown',
          },
        });
        window.dispatchEvent(forbiddenEvent);
      }
      return Promise.reject(error);
    },
  );

  return axiosInstance;
};

export default createAxiosInstance;
