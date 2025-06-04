import axios from 'axios';
import { getSession } from 'next-auth/react';
import logger from '../../lib/logger';
import { NEXT_PUBLIC_API_TOKEN } from '../../lib/envConstants';

// Token cache to avoid repeated session checks
let tokenCache = null;
let tokenCacheExpiry = 0;
const TOKEN_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Function to get JWT Token from NextAuth session with caching
const getJwtToken = async () => {
  if (typeof window === 'undefined') return null;

  // Check cache first
  const now = Date.now();
  if (tokenCache && now < tokenCacheExpiry) {
    return tokenCache;
  }

  try {
    // Get token from NextAuth session
    const session = await getSession();
    let token = null;

    if (session?.accessToken) {
      token = session.accessToken;
    } else if (session?.user?.accessToken) {
      token = session.user.accessToken;
    }

    // Cache the token
    if (token) {
      tokenCache = token;
      tokenCacheExpiry = now + TOKEN_CACHE_TTL;
    }

    return token;
  } catch (error) {
    // Only log in development to reduce noise
    if (process.env.NODE_ENV === 'development') {
      logger.warn('Failed to get NextAuth session', error);
    }
  }

  return null;
};

// Function to get API Token from environment variables
const getApiToken = () => {
  return NEXT_PUBLIC_API_TOKEN || null;
};

/**
 * Auth types for API requests
 */
export const AUTH_TYPES = {
  AUTO: 'auto', // Automatically determine auth type based on endpoint path
  NONE: 'none', // No authentication needed (open endpoint)
  JWT: 'jwt', // JWT token authentication
  API_TOKEN: 'token', // API token authentication
};

/**
 * Creates an axios instance that uses the proxy API routes
 * This ensures tokens are never exposed on the client side
 */
const createSecureApiClient = () => {
  // Create axios instance targeting our proxy endpoints
  const instance = axios.create({
    baseURL: '/api',
    withCredentials: true,
  });
  // Override standard methods to handle authentication
  const originalGet = instance.get;
  const originalPost = instance.post;
  const originalPut = instance.put;
  const originalPatch = instance.patch;
  const originalDelete = instance.delete;

  // Helper function to handle auth options
  const handleAuthOptions = (options = {}) => {
    const { authType, ...restOptions } = options;
    if (authType) {
      if (!restOptions.headers) restOptions.headers = {};
      restOptions.headers['X-Auth-Type'] = authType;
    }
    return restOptions;
  };

  // Override standard Axios methods
  instance.get = (url, options = {}) => {
    return originalGet.call(instance, url, handleAuthOptions(options));
  };

  instance.post = (url, data, options = {}) => {
    return originalPost.call(instance, url, data, handleAuthOptions(options));
  };

  instance.put = (url, data, options = {}) => {
    return originalPut.call(instance, url, data, handleAuthOptions(options));
  };

  instance.patch = (url, data, options = {}) => {
    return originalPatch.call(instance, url, data, handleAuthOptions(options));
  };

  instance.delete = (url, options = {}) => {
    return originalDelete.call(instance, url, handleAuthOptions(options));
  };

  // Keep the original WithAuth methods for backward compatibility
  instance.getWithAuth = instance.get;
  instance.postWithAuth = instance.post;
  instance.putWithAuth = instance.put;
  instance.patchWithAuth = instance.patch;
  instance.deleteWithAuth = instance.delete;

  // Add request interceptor for standard requests
  instance.interceptors.request.use(
    async (config) => {
      const authType = config.headers?.['X-Auth-Type'] || AUTH_TYPES.AUTO;

      // Handle different authentication types
      switch (authType) {
        case AUTH_TYPES.NONE: {
          // No authentication needed
          break;
        }
        case AUTH_TYPES.API_TOKEN: {
          // Use API token from environment variables
          const apiToken = getApiToken();
          if (apiToken) {
            config.headers['Authorization'] = `Bearer ${apiToken}`;
          }
          break;
        }
        case AUTH_TYPES.JWT:
        case AUTH_TYPES.AUTO:
        default: {
          // Use JWT token from session
          const jwtToken = await getJwtToken();
          if (jwtToken) {
            config.headers['Authorization'] = jwtToken;
          }
          break;
        }
      }

      // Minimal logging in development only for auth issues
      if (
        process.env.NODE_ENV === 'development' &&
        !config.headers['Authorization']
      ) {
        logger.debug('Secure API Request without auth', {
          url: config.url,
          method: config.method,
          authType: authType,
        });
      }

      return config;
    },
    (error) => {
      logger.error('Secure API request config error', error);
      return Promise.reject(error);
    },
  );
  // Add response interceptor with minimal error logging
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      // Only log errors for 5xx status codes or network errors to reduce noise
      if (!error.response || error.response.status >= 500) {
        const errorInfo = {
          url: error.config?.url,
          method: error.config?.method,
          status: error.response?.status,
          message: error.message,
        };
        logger.error('Secure API request failed', errorInfo);
      }
      return Promise.reject(error);
    },
  );

  return instance;
};

export const secureApiProxy = createSecureApiClient();

export default createSecureApiClient;
