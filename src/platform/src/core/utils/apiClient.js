import { secureApiProxy, AUTH_TYPES } from './secureApiProxyClient';

/**
 * Compatibility layer for old apiClient imports
 * Wraps secureApiProxyClient functionality
 */

// Public API client (no auth required)
export const publicApi = {
  get: (url, config = {}) =>
    secureApiProxy(url, { method: 'GET', ...config }, AUTH_TYPES.NONE),
  post: (url, data, config = {}) =>
    secureApiProxy(url, { method: 'POST', data, ...config }, AUTH_TYPES.NONE),
  put: (url, data, config = {}) =>
    secureApiProxy(url, { method: 'PUT', data, ...config }, AUTH_TYPES.NONE),
  delete: (url, config = {}) =>
    secureApiProxy(url, { method: 'DELETE', ...config }, AUTH_TYPES.NONE),
  patch: (url, data, config = {}) =>
    secureApiProxy(url, { method: 'PATCH', data, ...config }, AUTH_TYPES.NONE),
};

// Authenticated API client
export const api = {
  get: (url, config = {}) =>
    secureApiProxy(url, { method: 'GET', ...config }, AUTH_TYPES.JWT),
  post: (url, data, config = {}) =>
    secureApiProxy(url, { method: 'POST', data, ...config }, AUTH_TYPES.JWT),
  put: (url, data, config = {}) =>
    secureApiProxy(url, { method: 'PUT', data, ...config }, AUTH_TYPES.JWT),
  delete: (url, config = {}) =>
    secureApiProxy(url, { method: 'DELETE', ...config }, AUTH_TYPES.JWT),
  patch: (url, data, config = {}) =>
    secureApiProxy(url, { method: 'PATCH', data, ...config }, AUTH_TYPES.JWT),
};

// Default export - creates an authenticated instance
const createAxiosInstance = () => api;

export default createAxiosInstance;
