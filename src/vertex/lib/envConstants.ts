/**
 * Environment constants and utilities for API configuration
 * Centralizes environment variable access with proper validation
 */

/**
 * Gets the API base URL from environment variables
 * @returns {string} The API base URL
 * @throws {Error} If API_URL is not defined
 */
export const getApiBaseUrl = (): string => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  if (!apiUrl) {
    throw new Error('NEXT_PUBLIC_API_URL environment variable is not defined');
  }
  
  return apiUrl;
};

/**
 * Gets the API token from environment variables (server-side only)
 * @returns {string} The API token
 * @throws {Error} If API_TOKEN is not defined
 */
export const getApiToken = (): string => {
  const apiToken = process.env.NEXT_PUBLIC_API_TOKEN;
  
  if (!apiToken) {
    throw new Error('NEXT_PUBLIC_API_TOKEN environment variable is not defined');
  }
  
  return apiToken;
};

/**
 * Gets environment configuration
 * @returns {object} Environment configuration object
 */
export const getEnvConfig = () => {
  return {
    apiUrl: process.env.NEXT_PUBLIC_API_URL,
    apiToken: process.env.NEXT_PUBLIC_API_TOKEN,
    environment: process.env.NEXT_PUBLIC_ENV || 'development',
    analyticsUrl: process.env.NEXT_PUBLIC_ANALYTICS_URL,
    mapboxToken: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN,
    mockPermissionsEnabled: process.env.NEXT_PUBLIC_MOCK_PERMISSIONS_ENABLED === 'true',
  };
};

/**
 * Validates that required environment variables are set
 * @returns {boolean} True if all required variables are set
 */
export const validateEnvironment = (): boolean => {
  const required = [
    'NEXT_PUBLIC_API_URL',
    'NEXT_PUBLIC_API_TOKEN',
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing);
    return false;
  }
  
  return true;
};
