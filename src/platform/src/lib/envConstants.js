/**
 * Environment variable configuration and validation
 * Central place for all environment variable handling
 */

import logger from './logger';

// Core environment variables - direct exports
export const LEGACY_PLATFORM_ENV = process.env.NEXT_PUBLIC_ORIGINAL_PLATFORM;
export const NEXT_PUBLIC_AUTHORISATION = process.env.NEXT_PUBLIC_AUTHORISATION;
export const NEXT_PUBLIC_BASE_DEVICE_MONITORING_URL =
  process.env.NEXT_PUBLIC_BASE_DEVICE_MONITORING_URL;
export const NEXT_PUBLIC_API_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN;
export const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
export const NEXT_PUBLIC_RECAPTCHA_SITE_KEY =
  process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
export const NEXT_PUBLIC_GRIDS = process.env.NEXT_PUBLIC_GRIDS;
export const NEXT_PUBLIC_DEFAULT_CHART_SITES =
  process.env.NEXT_PUBLIC_DEFAULT_CHART_SITES;

// Server-side environment variables
export const API_BASE_URL = process.env.API_BASE_URL;
export const API_TOKEN = process.env.API_TOKEN;
export const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;
export const NEXTAUTH_URL = process.env.NEXTAUTH_URL;

// URL validation helper
const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
};

// Environment variable validation
const validateEnvironmentVariables = () => {
  const errors = [];
  const warnings = [];

  // Critical environment variables
  const requiredEnvVars = {
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  };

  // Important environment variables
  const importantEnvVars = {
    API_BASE_URL: process.env.API_BASE_URL,
    API_TOKEN: process.env.API_TOKEN,
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_API_TOKEN: process.env.NEXT_PUBLIC_API_TOKEN,
  };

  // Check required variables
  Object.entries(requiredEnvVars).forEach(([key, value]) => {
    if (!value || value.trim() === '') {
      errors.push(`Missing required environment variable: ${key}`);
    }
  });

  // Check important variables
  Object.entries(importantEnvVars).forEach(([key, value]) => {
    if (!value || value.trim() === '') {
      warnings.push(`Missing important environment variable: ${key}`);
    }
  });

  // Validate URL formats
  const urlVars = ['NEXTAUTH_URL', 'API_BASE_URL', 'NEXT_PUBLIC_API_BASE_URL'];
  urlVars.forEach((varName) => {
    const value = process.env[varName];
    if (value && !isValidUrl(value)) {
      errors.push(`Invalid URL format for ${varName}: ${value}`);
    }
  });

  return { errors, warnings };
};

// Safe environment variable getters with defaults
export const getApiBaseUrl = () => {
  const url = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!url) {
    logger.warn('No API base URL configured. Using default.');
    return 'http://localhost:3001'; // Fallback URL
  }
  return url.replace(/\/+$/, ''); // Remove trailing slashes
};

export const getApiToken = () => {
  return process.env.API_TOKEN || process.env.NEXT_PUBLIC_API_TOKEN || null;
};

export const getNextAuthUrl = () => {
  return process.env.NEXTAUTH_URL || 'http://localhost:3000';
};

export const getNextAuthSecret = () => {
  return process.env.NEXTAUTH_SECRET;
};

export const getSiteUrl = () => {
  return process.env.NEXT_PUBLIC_SITE_URL || 'https://analytics.airqo.net';
};

// Initialize environment validation
const initializeEnvironment = () => {
  const { errors, warnings } = validateEnvironmentVariables();

  // Log errors and warnings
  if (errors.length > 0) {
    logger.error('Environment configuration errors:', errors);
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        `Critical environment variables missing: ${errors.join(', ')}`,
      );
    }
  }

  if (warnings.length > 0) {
    logger.warn('Environment configuration warnings:', warnings);
  }

  // Set defaults for development
  if (process.env.NODE_ENV === 'development') {
    if (!process.env.API_BASE_URL && !process.env.NEXT_PUBLIC_API_BASE_URL) {
      logger.info('Setting default API base URL for development');
    }
  }
};

// Run initialization
if (typeof window === 'undefined') {
  // Server-side initialization
  initializeEnvironment();
}

// Named exports for compatibility
export { validateEnvironmentVariables as validateEnvironment };
export { getApiBaseUrl as getEnvVar };
export { isValidUrl };

// Default export
export default {
  getApiBaseUrl,
  getApiToken,
  getNextAuthUrl,
  getNextAuthSecret,
  getSiteUrl,
  validateEnvironmentVariables,
  isValidUrl,
  // Direct environment variables
  LEGACY_PLATFORM_ENV,
  NEXT_PUBLIC_AUTHORISATION,
  NEXT_PUBLIC_BASE_DEVICE_MONITORING_URL,
  NEXT_PUBLIC_API_TOKEN,
  NEXT_PUBLIC_API_BASE_URL,
  NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
  NEXT_PUBLIC_GRIDS,
  NEXT_PUBLIC_DEFAULT_CHART_SITES,
  API_BASE_URL,
  API_TOKEN,
  NEXTAUTH_SECRET,
  NEXTAUTH_URL,
};
