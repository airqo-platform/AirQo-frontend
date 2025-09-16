import axios from 'axios';
import logger from '@/lib/logger';
import { clearSessionData } from '../utils/sessionManager';
import { getSession } from 'next-auth/react';
import { ExtendedSession } from '../utils/secureApiProxyClient';

const API_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN;
const API_URL = process.env.NEXT_PUBLIC_API_URL;

const createAxiosInstance = (isJWT = true) => {
  const axiosInstance = axios.create();

  axiosInstance.interceptors.request.use(
    async (config) => {
      if (isJWT) {
        const session = await getSession();
        const token = (session as ExtendedSession)?.accessToken || (session as ExtendedSession)?.user?.accessToken;
        if (token) {
          config.headers['Authorization'] = token;
        }
        config.params = { ...config.params };
      } else {
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

  axiosInstance.interceptors.response.use(
    (response) => {
      const newToken = response.headers['x-access-token'];
      if (newToken && typeof newToken === 'string') {        
        logger.warn(
          'Received a refreshed auth token, but client-side update is not implemented. The new token will be ignored.'
        );
      }
      return response;
    },
    (error) => {
      logger.error('API Response Error', {
        message: error.message,
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        data: error.response?.data,
      });

      if (error.response?.status === 401) {
        logger.error('Session expired. Logging out.');
        clearSessionData();

        if (typeof window !== 'undefined') {
          window.location.href = '/user/login?session_expired=true';
        }
        return Promise.reject(error);
      }

      if (error.response?.status === 403) {
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
