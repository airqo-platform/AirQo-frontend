import axios from 'axios';
import { getSession } from 'next-auth/react';
import logger from '../../lib/logger';
import { getApiToken } from '@/lib/envConstants';

// High-performance token cache with minimal overhead
class TokenCache {
  constructor() {
    this.cache = null;
    this.expiry = 0;
    this.ttl = 5 * 60 * 1000; // 5 minutes
    this.initialized = false;
    this.cleanupTimer = null;
  }

  init() {
    if (this.initialized || typeof window === 'undefined') return;
    this.initialized = true;

    // Single cleanup listener
    window.addEventListener('beforeunload', this.clear.bind(this), {
      once: true,
    });
  }

  get() {
    const now = Date.now();
    if (!this.cache || now > this.expiry) {
      this.cache = null;
      this.expiry = 0;
      return null;
    }
    return this.cache;
  }

  set(token) {
    if (!token) return;

    this.cache = token;
    this.expiry = Date.now() + this.ttl;

    // Clear any existing timer
    if (this.cleanupTimer) {
      clearTimeout(this.cleanupTimer);
    }

    // Set single cleanup timer
    this.cleanupTimer = setTimeout(() => this.clear(), this.ttl);
  }

  clear() {
    this.cache = null;
    this.expiry = 0;
    if (this.cleanupTimer) {
      clearTimeout(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }
}

// Singleton token cache
const tokenCache = new TokenCache();

// Optimized JWT token retrieval with error handling
const getJwtToken = async () => {
  if (typeof window === 'undefined') return null;

  tokenCache.init();

  const cachedToken = tokenCache.get();
  if (cachedToken) return cachedToken;

  try {
    const session = await getSession();
    const token = session?.accessToken || session?.user?.accessToken;

    if (token) {
      tokenCache.set(token);
    }

    return token;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      logger.warn('Failed to get NextAuth session:', error.message);
    }
    return null;
  }
};

/**
 * Auth types for API requests
 */
export const AUTH_TYPES = {
  AUTO: 'auto',
  NONE: 'none',
  JWT: 'jwt',
  API_TOKEN: 'token',
};

// Pre-compile regex for better performance
const JWT_PREFIX_REGEX = /^JWT\s+/;
const DOUBLE_JWT_REGEX = /^JWT\s+JWT\s+/;

// Cached API token and origin
let cachedApiToken = null;
let cachedOrigin = null;

/**
 * Optimized secure API client factory
 */
const createSecureApiClient = () => {
  // Pre-cache values for better performance
  if (typeof window !== 'undefined' && !cachedOrigin) {
    cachedOrigin = window.location.origin;
  }

  if (!cachedApiToken) {
    cachedApiToken = getApiToken();
  }

  const instance = axios.create({
    baseURL: '/api',
    withCredentials: true,
    timeout: 45000, // Increased timeout for heavy endpoints like map readings
    // Performance optimizations
    maxRedirects: 2,
    validateStatus: (status) => status < 500, // Accept 4xx as valid responses
    // Compression and connection reuse
    headers: {
      'Accept-Encoding': 'gzip, deflate, br',
      Connection: 'keep-alive',
    },
  });

  // Optimized auth header handler
  const addAuthHeader = (config, authType) => {
    if (!config.headers) config.headers = {};
    if (authType) config.headers['X-Auth-Type'] = authType;
    return config;
  };

  // Override methods with minimal overhead
  const createMethodOverride = (originalMethod) => {
    return function (url, ...args) {
      // Handle different argument patterns efficiently
      let options = {};
      let data = null;

      if (args.length === 1) {
        // GET/DELETE pattern: (url, options)
        options = args[0] || {};
      } else if (args.length === 2) {
        // POST/PUT/PATCH pattern: (url, data, options)
        data = args[0];
        options = args[1] || {};
      }

      const { authType, signal, ...restOptions } = options;
      const finalOptions = addAuthHeader(restOptions, authType);

      // Add abort signal support
      if (signal) {
        finalOptions.signal = signal;
      }

      return data !== null
        ? originalMethod.call(this, url, data, finalOptions)
        : originalMethod.call(this, url, finalOptions);
    };
  };

  // Override all methods
  ['get', 'post', 'put', 'patch', 'delete'].forEach((method) => {
    const original = instance[method];
    instance[method] = createMethodOverride(original);
    // Maintain backward compatibility
    instance[`${method}WithAuth`] = instance[method];
  });

  // Optimized request interceptor
  instance.interceptors.request.use(
    async (config) => {
      const authType = config.headers?.['X-Auth-Type'] || AUTH_TYPES.AUTO;

      switch (authType) {
        case AUTH_TYPES.NONE:
          break;

        case AUTH_TYPES.API_TOKEN:
          if (cachedApiToken) {
            const separator = config.url.includes('?') ? '&' : '?';
            config.url = `${config.url}${separator}token=${cachedApiToken}`;
          }
          break;

        case AUTH_TYPES.JWT:
        case AUTH_TYPES.AUTO:
        default:
          const jwtToken = await getJwtToken();
          if (jwtToken) {
            let cleanToken = jwtToken;

            // Optimized token cleaning
            if (DOUBLE_JWT_REGEX.test(jwtToken)) {
              cleanToken = jwtToken.replace(DOUBLE_JWT_REGEX, 'JWT ');
            } else if (!JWT_PREFIX_REGEX.test(jwtToken)) {
              cleanToken = `JWT ${jwtToken}`;
            }

            config.headers.Authorization = cleanToken;
          }
          break;
      }

      return config;
    },
    (error) => {
      if (process.env.NODE_ENV === 'development') {
        logger.error('Request config error:', error.message);
      }
      return Promise.reject(error);
    },
  );

  // Optimized response interceptor
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error.response?.status;

      // Handle abort errors gracefully
      if (error.name === 'AbortError' || error.code === 'ECONNABORTED') {
        if (process.env.NODE_ENV === 'development') {
          logger.warn('Request cancelled or timed out:', {
            url: error.config?.url,
            method: error.config?.method,
            code: error.code,
          });
        }
        return Promise.reject(error);
      }

      // Handle connection errors
      if (
        error.code === 'ECONNRESET' ||
        error.code === 'ENOTFOUND' ||
        error.code === 'ENETUNREACH'
      ) {
        if (process.env.NODE_ENV === 'development') {
          logger.error('Connection error:', {
            url: error.config?.url,
            method: error.config?.method,
            code: error.code,
            message: error.message,
          });
        }
        return Promise.reject(error);
      }

      if (status === 401) {
        tokenCache.clear();

        if (process.env.NODE_ENV === 'development') {
          logger.warn('Authentication failed:', {
            url: error.config?.url,
            method: error.config?.method,
          });
        }

        // Optimized redirect logic
        if (typeof window !== 'undefined') {
          const currentPath = window.location.pathname;
          const isAuthPath =
            currentPath.includes('/login') || currentPath.includes('/auth');
          const isSystemRequest =
            error.config?.url?.includes('/auth/') ||
            error.config?.url?.includes('session');

          if (!isAuthPath && !isSystemRequest) {
            try {
              window.sessionStorage?.setItem('redirectAfterLogin', currentPath);
            } catch {
              // Ignore sessionStorage errors
            }
          }
        }
      } else if (status === 429) {
        if (process.env.NODE_ENV === 'development') {
          logger.warn('Rate limit exceeded:', error.config?.url);
        }
      } else if (!status || status >= 500) {
        logger.error('API request failed:', {
          url: error.config?.url,
          method: error.config?.method,
          status,
          message: error.message,
          code: error.code,
        });
      }

      return Promise.reject(error);
    },
  );

  return instance;
};

// Export singleton instance for better performance
export const secureApiProxy = createSecureApiClient();

export default createSecureApiClient;
