import axios from 'axios';
import { getSession } from 'next-auth/react';
import logger from '../../lib/logger';
import { getApiToken } from '@/lib/envConstants';

// Token cache to avoid repeated session checks
let tokenCache = null;
let tokenCacheExpiry = 0;
const TOKEN_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Cleanup function to clear cache
const clearTokenCache = () => {
  tokenCache = null;
  tokenCacheExpiry = 0;
};

// Setup cache cleanup on page unload to prevent memory leaks
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', clearTokenCache);
  // Also clear cache periodically to prevent stale data
  setInterval(() => {
    const now = Date.now();
    if (tokenCacheExpiry && now > tokenCacheExpiry) {
      clearTokenCache();
    }
  }, TOKEN_CACHE_TTL);
}

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
          // Use API token from environment variables as URL parameter
          const apiToken = getApiToken();
          if (apiToken) {
            try {
              // Validate inputs before URL construction
              const baseURL = config.baseURL || '/api';
              const configUrl = config.url || '';

              // Ensure we have valid inputs
              if (!configUrl) {
                logger.warn('Secure API: No URL provided for request');
                break;
              }

              // Construct URL with proper validation
              const windowOrigin =
                typeof window !== 'undefined' ? window.location.origin : '';
              const fullBaseURL = windowOrigin + baseURL;

              // Validate the base URL before using it
              if (windowOrigin && !windowOrigin.startsWith('http')) {
                logger.error(
                  'Secure API: Invalid window origin for URL construction:',
                  windowOrigin,
                );
                break;
              }

              const url = new URL(configUrl, fullBaseURL);
              url.searchParams.set('token', apiToken);
              config.url = url.pathname + url.search;
            } catch (urlError) {
              logger.error('Secure API request failed', {
                message: "Failed to construct 'URL': Invalid base URL",
                url: config.url,
                baseURL: config.baseURL,
                error: urlError.message,
              });
              // Fallback: append token as query parameter manually
              const separator = config.url.includes('?') ? '&' : '?';
              config.url = `${config.url}${separator}token=${encodeURIComponent(apiToken)}`;
            }
          }
          break;
        }
        case AUTH_TYPES.JWT:
        case AUTH_TYPES.AUTO:
        default: {
          // Use JWT token from session in Authorization header
          const jwtToken = await getJwtToken();
          if (jwtToken) {
            // Clean up any double JWT prefixes that might cause 401 errors
            let cleanToken = jwtToken;

            // Handle double JWT prefix issue
            if (jwtToken.startsWith('JWT JWT ')) {
              cleanToken = jwtToken.replace('JWT JWT ', 'JWT ');
            }
            // Ensure token has JWT prefix if it doesn't already (no Bearer support)
            else if (!jwtToken.startsWith('JWT ')) {
              cleanToken = `JWT ${jwtToken}`;
            }

            config.headers['Authorization'] = cleanToken;
          }
          break;
        }
      }

      // Minimal logging in development only for auth issues
      if (
        process.env.NODE_ENV === 'development' &&
        !config.headers['Authorization'] &&
        authType !== AUTH_TYPES.API_TOKEN &&
        authType !== AUTH_TYPES.NONE
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
  // Add response interceptor with enhanced error handling
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      // Enhanced 401 error handling for authentication issues
      if (error.response?.status === 401) {
        // Clear token cache on authentication failure
        clearTokenCache();

        // Only log 401 errors in development or for debugging
        if (process.env.NODE_ENV === 'development') {
          logger.warn('Authentication failed', {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            message: error.response?.data?.message || error.message,
          });
        }

        // Check if this is a browser environment before attempting redirect
        if (typeof window !== 'undefined') {
          // Only show user-facing auth errors, not system ones
          const isUserFacingRequest =
            !error.config?.url?.includes('/auth/') &&
            !error.config?.url?.includes('session');

          if (isUserFacingRequest) {
            // Consider redirecting to login or showing auth modal
            // This prevents cascading auth failures
            const currentPath = window.location.pathname;
            if (
              !currentPath.includes('/login') &&
              !currentPath.includes('/auth')
            ) {
              // Store the current path for redirect after login
              window.sessionStorage?.setItem('redirectAfterLogin', currentPath);
            }
          }
        }
      }
      // Handle rate limiting (429) and server errors (5xx) appropriately
      else if (error.response?.status === 429) {
        logger.warn('Rate limit exceeded', {
          url: error.config?.url,
          method: error.config?.method,
          status: error.response?.status,
        });
      }
      // Only log errors for 5xx status codes or network errors to reduce noise
      else if (!error.response || error.response.status >= 500) {
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
