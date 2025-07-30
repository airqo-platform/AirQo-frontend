/**
 * Lightweight API client for open authentication endpoints
 * These endpoints don't require tokens or authentication
 * Designed for fast, clean requests without proxy overhead
 */

import axios from 'axios';
import { getApiBaseUrl } from '@/lib/envConstants';
import logger from '../../lib/logger';

/**
 * Create a lightweight axios instance for open API endpoints
 */
const createOpenApiClient = () => {
  const baseURL = getApiBaseUrl();

  if (!baseURL) {
    logger.error('API_BASE_URL not configured for open API client');
    throw new Error('API base URL is required for open API client');
  }

  const client = axios.create({
    baseURL,
    timeout: 60000,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  // Request interceptor for logging in development
  client.interceptors.request.use(
    (config) => {
      if (process.env.NODE_ENV === 'development') {
        logger.info(
          `Open API Request: ${config.method?.toUpperCase()} ${config.url}`,
        );
      }
      return config;
    },
    (error) => {
      logger.error('Open API Request Error:', error);
      return Promise.reject(error);
    },
  );

  // Response interceptor for error handling and logging
  client.interceptors.response.use(
    (response) => {
      if (process.env.NODE_ENV === 'development') {
        logger.info(
          `Open API Response: ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`,
        );
      }
      return response;
    },
    (error) => {
      // Enhanced error handling
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Network error occurred';

      const statusCode = error.response?.status;
      const endpoint = error.config?.url;

      logger.error(`Open API Error [${statusCode}] ${endpoint}:`, errorMessage);

      // Create a more informative error object
      const enhancedError = new Error(errorMessage);
      enhancedError.status = statusCode;
      enhancedError.endpoint = endpoint;
      enhancedError.originalError = error;

      return Promise.reject(enhancedError);
    },
  );

  return client;
};

// Create and export the client instance
export const openApiClient = createOpenApiClient();

/**
 * Utility methods for common HTTP operations
 */
export const openApiMethods = {
  /**
   * POST request for open endpoints
   * @param {string} url - The endpoint URL
   * @param {Object} data - Request payload
   * @param {Object} config - Additional axios config
   * @returns {Promise} - Promise resolving to response data
   */
  post: async (url, data = {}, config = {}) => {
    try {
      const response = await openApiClient.post(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * GET request for open endpoints
   * @param {string} url - The endpoint URL
   * @param {Object} config - Additional axios config
   * @returns {Promise} - Promise resolving to response data
   */
  get: async (url, config = {}) => {
    try {
      const response = await openApiClient.get(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * PUT request for open endpoints
   * @param {string} url - The endpoint URL
   * @param {Object} data - Request payload
   * @param {Object} config - Additional axios config
   * @returns {Promise} - Promise resolving to response data
   */
  put: async (url, data = {}, config = {}) => {
    try {
      const response = await openApiClient.put(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default openApiClient;
