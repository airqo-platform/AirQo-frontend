import axios from 'axios';
import logger from '../../lib/logger';
import { NEXT_PUBLIC_API_BASE_URL } from '../../lib/envConstants';

// Function to get JWT Token
const getJwtToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

// API base URL and token from environment variables
const API_BASE_URL = NEXT_PUBLIC_API_BASE_URL;
const API_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN;

/**
 * Create pre-configured axios instance with error handling
 */
const createApiClient = (useJwt = true) => {
  // Create axios instance
  const instance = axios.create({
    baseURL: API_BASE_URL,
  });

  // Add request interceptor
  instance.interceptors.request.use(
    (config) => {
      if (useJwt) {
        // Set JWT authentication
        config.headers['Authorization'] = getJwtToken();
      } else {
        // Use API token instead
        delete config.headers['Authorization'];
        config.params = {
          ...config.params,
          token: API_TOKEN?.replace(/[\u200B-\u200D\uFEFF]/g, '').trim(),
        };
      }

      // Log request in development
      if (process.env.NODE_ENV !== 'production') {
        logger.debug('API Request', {
          url: config.url,
          method: config.method,
        });
      }

      return config;
    },
    (error) => {
      logger.error('Request config error', error);
      return Promise.reject(error);
    },
  );

  // Add response interceptor with error logging
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      // Log detailed error information
      const errorInfo = {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      };

      logger.error('API request failed', error, errorInfo);
      return Promise.reject(error);
    },
  );

  return instance;
};

// Create default instances
export const api = createApiClient(true); // With JWT
export const publicApi = createApiClient(false); // Without JWT

export default createApiClient;
