/**
 * Environment constants and utilities for API configuration
 * Centralizes environment variable access with proper validation
 */
import { stripTrailingSlash } from './utils';

/**
 * Gets the default API URL fallback based on the current environment
 * @returns {string} The default API URL
 */
export const getDefaultApiUrl = (): string => {
  const env = getEnvironment().toLowerCase();
  if (env === 'production') return 'https://vertex.airqo.net/api/v2';
  if (env === 'staging') return 'https://staging-vertex.airqo.net/api/v2';
  return 'http://localhost:3000';
};

/**
 * Gets the API base URL from environment variables
 * @returns {string} The API base URL
 */
export const getApiBaseUrl = (): string => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || getDefaultApiUrl();
  return stripTrailingSlash(apiUrl);
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
 * Gets the Cookie Policy URL
 * @returns {string} The cookie policy URL
 */
export const COOKIE_POLICY_URL = process.env.NEXT_PUBLIC_COOKIE_POLICY_URL || 'https://airqo.net/legal/cookies';

/**
 * Gets the Cloudinary cloud name
 * @returns {string} The Cloudinary cloud name
 * @throws {Error} If NEXT_PUBLIC_CLOUDINARY_NAME is not defined
 */
export const getCloudinaryName = (): string => {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_NAME;
  
  if (!cloudName) {
    throw new Error('NEXT_PUBLIC_CLOUDINARY_NAME environment variable is not defined');
  }
  
  return cloudName;
};

/**
 * Gets the Cloudinary upload preset
 * @returns {string} The Cloudinary upload preset
 * @throws {Error} If NEXT_PUBLIC_CLOUDINARY_PRESET is not defined
 */
export const getCloudinaryPreset = (): string => {
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_PRESET;
  
  if (!uploadPreset) {
    throw new Error('NEXT_PUBLIC_CLOUDINARY_PRESET environment variable is not defined');
  }
  
  return uploadPreset;
};

/**
 * Gets the Cloudinary API key (server-side only)
 * @returns {string} The Cloudinary API key
 * @throws {Error} If CLOUDINARY_API_KEY is not defined
 */
export const getCloudinaryApiKey = (): string => {
  const apiKey = process.env.CLOUDINARY_API_KEY;
  
  if (!apiKey) {
    throw new Error('CLOUDINARY_API_KEY environment variable is not defined');
  }
  
  return apiKey;
};

/**
 * Gets the Cloudinary API secret (server-side only)
 * @returns {string} The Cloudinary API secret
 * @throws {Error} If CLOUDINARY_API_SECRET is not defined
 */
export const getCloudinaryApiSecret = (): string => {
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  
  if (!apiSecret) {
    throw new Error('CLOUDINARY_API_SECRET environment variable is not defined');
  }
  
  return apiSecret;
};

/**
 * Gets the HCaptcha site key from environment variables
 * @returns {string} The HCaptcha site key
 */
export const getHCaptchaSiteKey = (): string => {
  return process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || '';
};

/**
 * Gets the current environment from environment variables
 * @returns {string} The environment name
 */
export const getEnvironment = (): string => {
  return process.env.NEXT_PUBLIC_ENV || 'development';
};

/**
 * Whether hCaptcha should be enabled for this deployment.
 *
 * Requirement: available on staging and production as long as the hCaptcha site key is set.
 */
export const isHCaptchaEnabled = (): boolean => {
  const env = getEnvironment().toLowerCase();
  const hasSiteKey = Boolean(getHCaptchaSiteKey());
  return (env === 'development' || env === 'staging' || env === 'production') && hasSiteKey;
};

/**
 * Gets environment configuration
 * @returns {object} Environment configuration object
 */
export const getEnvConfig = () => {
  return {
    hCaptchaSiteKey: getHCaptchaSiteKey(),
    environment: getEnvironment(),
    hCaptchaEnabled: isHCaptchaEnabled(),
    apiUrl: process.env.NEXT_PUBLIC_API_URL,
    apiToken: process.env.NEXT_PUBLIC_API_TOKEN,
    analyticsUrl: process.env.NEXT_PUBLIC_ANALYTICS_URL,
    cookiePolicyUrl: COOKIE_POLICY_URL,
    mapboxToken: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN,
    mockPermissionsEnabled: process.env.NEXT_PUBLIC_MOCK_PERMISSIONS_ENABLED === 'true',
    cloudinaryName: process.env.NEXT_PUBLIC_CLOUDINARY_NAME,
    cloudinaryPreset: process.env.NEXT_PUBLIC_CLOUDINARY_PRESET,
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
    'NEXT_PUBLIC_CLOUDINARY_NAME',
    'NEXT_PUBLIC_CLOUDINARY_PRESET',
  ];
  
  if (typeof window === 'undefined') {
    required.push('CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET');
  }
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing);
    return false;
  }
  
  return true;
};
