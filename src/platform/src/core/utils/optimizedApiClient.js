/**
 * Optimized API client with intelligent caching, retry logic, and performance enhancements
 */
import { apiRequestManager } from './performanceOptimizer';

class OptimizedAPIClient {
  constructor(baseURL = '', options = {}) {
    this.baseURL = baseURL;
    this.defaultOptions = {
      timeout: 30000,
      retries: 3,
      retryDelay: 1000,
      cacheEnabled: true,
      cacheDuration: 5 * 60 * 1000, // 5 minutes
      ...options,
    };

    // Request interceptors
    this.requestInterceptors = [];
    this.responseInterceptors = [];

    // Performance monitoring
    this.performanceMetrics = new Map();

    // AbortController for request cancellation
    this.activeRequests = new Map();

    // Setup automatic cleanup
    this.setupCleanup();
  }

  /**
   * Add request interceptor
   * @param {Function} interceptor - Request interceptor function
   */
  addRequestInterceptor(interceptor) {
    this.requestInterceptors.push(interceptor);
  }

  /**
   * Add response interceptor
   * @param {Function} interceptor - Response interceptor function
   */
  addResponseInterceptor(interceptor) {
    this.responseInterceptors.push(interceptor);
  }

  /**
   * Create cache key for request
   * @param {string} url - Request URL
   * @param {Object} options - Request options
   * @returns {string} Cache key
   */
  createCacheKey(url, options = {}) {
    const { method = 'GET', body, headers } = options;
    return `${method}:${url}:${JSON.stringify({ body, headers })}`;
  }

  /**
   * Apply request interceptors
   * @param {string} url - Request URL
   * @param {Object} options - Request options
   * @returns {Object} Modified options
   */
  async applyRequestInterceptors(url, options) {
    let modifiedOptions = { ...options };

    for (const interceptor of this.requestInterceptors) {
      try {
        modifiedOptions = await interceptor(url, modifiedOptions);
      } catch {
        // Silently handle interceptor errors
      }
    }

    return modifiedOptions;
  }

  /**
   * Apply response interceptors
   * @param {Response} response - Fetch response
   * @returns {Response} Modified response
   */
  async applyResponseInterceptors(response) {
    let modifiedResponse = response;

    for (const interceptor of this.responseInterceptors) {
      try {
        modifiedResponse = await interceptor(modifiedResponse);
      } catch {
        // Silently handle interceptor errors
      }
    }

    return modifiedResponse;
  }

  /**
   * Execute request with retry logic
   * @param {string} url - Request URL
   * @param {Object} options - Request options
   * @returns {Promise} Request promise
   */
  async executeRequest(url, options) {
    const { retries, retryDelay } = this.defaultOptions;
    let lastError;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const requestId = `${url}:${Date.now()}`;

        // Store active request for potential cancellation
        this.activeRequests.set(requestId, controller);

        const requestOptions = {
          ...options,
          signal: controller.signal,
        };

        const startTime = performance.now();
        const response = await fetch(url, requestOptions);
        const endTime = performance.now();

        // Store performance metrics
        this.performanceMetrics.set(url, {
          duration: endTime - startTime,
          timestamp: Date.now(),
          status: response.status,
        });

        // Clean up active request
        this.activeRequests.delete(requestId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await this.applyResponseInterceptors(response);
      } catch (error) {
        lastError = error;

        // Don't retry on abort or client errors
        if (
          error.name === 'AbortError' ||
          (error.response && error.response.status < 500)
        ) {
          throw error;
        }

        // Wait before retry (exponential backoff)
        if (attempt < retries) {
          await new Promise((resolve) =>
            setTimeout(resolve, retryDelay * Math.pow(2, attempt)),
          );
        }
      }
    }

    throw lastError;
  }

  /**
   * Make HTTP request with optimizations
   * @param {string} url - Request URL
   * @param {Object} options - Request options
   * @returns {Promise} Request promise
   */
  async request(url, options = {}) {
    const fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url}`;
    const cacheKey = this.createCacheKey(fullUrl, options);

    // Apply request interceptors
    const modifiedOptions = await this.applyRequestInterceptors(fullUrl, {
      ...this.defaultOptions,
      ...options,
    });

    // Use cached request manager for GET requests
    if (
      (!modifiedOptions.method || modifiedOptions.method === 'GET') &&
      this.defaultOptions.cacheEnabled
    ) {
      return apiRequestManager.request(
        cacheKey,
        () => this.executeRequest(fullUrl, modifiedOptions),
        this.defaultOptions.cacheDuration,
      );
    }

    // Execute request directly for non-GET requests
    return this.executeRequest(fullUrl, modifiedOptions);
  }

  /**
   * GET request
   * @param {string} url - Request URL
   * @param {Object} options - Request options
   * @returns {Promise} Request promise
   */
  async get(url, options = {}) {
    return this.request(url, { ...options, method: 'GET' });
  }

  /**
   * POST request
   * @param {string} url - Request URL
   * @param {any} data - Request data
   * @param {Object} options - Request options
   * @returns {Promise} Request promise
   */
  async post(url, data, options = {}) {
    return this.request(url, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
  }

  /**
   * PUT request
   * @param {string} url - Request URL
   * @param {any} data - Request data
   * @param {Object} options - Request options
   * @returns {Promise} Request promise
   */
  async put(url, data, options = {}) {
    return this.request(url, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
  }

  /**
   * PATCH request
   * @param {string} url - Request URL
   * @param {any} data - Request data
   * @param {Object} options - Request options
   * @returns {Promise} Request promise
   */
  async patch(url, data, options = {}) {
    return this.request(url, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
  }

  /**
   * DELETE request
   * @param {string} url - Request URL
   * @param {Object} options - Request options
   * @returns {Promise} Request promise
   */
  async delete(url, options = {}) {
    return this.request(url, { ...options, method: 'DELETE' });
  }

  /**
   * Cancel all active requests
   */
  cancelAllRequests() {
    for (const [requestId, controller] of this.activeRequests.entries()) {
      controller.abort();
      this.activeRequests.delete(requestId);
    }
  }

  /**
   * Cancel specific request by URL pattern
   * @param {string} urlPattern - URL pattern to match
   */
  cancelRequestsByPattern(urlPattern) {
    for (const [requestId, controller] of this.activeRequests.entries()) {
      if (requestId.includes(urlPattern)) {
        controller.abort();
        this.activeRequests.delete(requestId);
      }
    }
  }

  /**
   * Get performance metrics
   * @param {string} url - Optional URL to get specific metrics
   * @returns {Object} Performance metrics
   */
  getPerformanceMetrics(url = null) {
    if (url) {
      return this.performanceMetrics.get(url);
    }
    return Object.fromEntries(this.performanceMetrics);
  }

  /**
   * Clear cache
   * @param {string} pattern - Optional pattern to clear specific cache entries
   */
  clearCache(pattern = null) {
    if (pattern) {
      apiRequestManager.clearCache(pattern);
    } else {
      apiRequestManager.clearCache();
    }
  }

  /**
   * Setup automatic cleanup
   */
  setupCleanup() {
    // Cancel all requests on page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.cancelAllRequests();
      });

      // Clean up old performance metrics periodically
      setInterval(
        () => {
          const cutoff = Date.now() - 30 * 60 * 1000; // 30 minutes
          for (const [url, metrics] of this.performanceMetrics.entries()) {
            if (metrics.timestamp < cutoff) {
              this.performanceMetrics.delete(url);
            }
          }
        },
        10 * 60 * 1000,
      ); // Every 10 minutes
    }
  }
}

// Create optimized instances for different use cases
export const fastAPIClient = new OptimizedAPIClient('', {
  timeout: 10000,
  retries: 2,
  cacheDuration: 2 * 60 * 1000, // 2 minutes for fast-changing data
});

export const standardAPIClient = new OptimizedAPIClient('', {
  timeout: 30000,
  retries: 3,
  cacheDuration: 5 * 60 * 1000, // 5 minutes for standard data
});

export const slowAPIClient = new OptimizedAPIClient('', {
  timeout: 60000,
  retries: 5,
  cacheDuration: 15 * 60 * 1000, // 15 minutes for slow-changing data
});

// Add common interceptors
const addAuthInterceptor = (client) => {
  client.addRequestInterceptor(async (url, options) => {
    // Add authentication token if available
    if (typeof window !== 'undefined') {
      const token =
        localStorage.getItem('authToken') ||
        sessionStorage.getItem('authToken');
      if (token) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${token}`,
        };
      }
    }
    return options;
  });
};

const addErrorInterceptor = (client) => {
  client.addResponseInterceptor(async (response) => {
    if (response.status === 401) {
      // Handle unauthorized access
      if (typeof window !== 'undefined') {
        // Clear auth tokens
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('authToken');

        // Redirect to login if needed
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return response;
  });
};

// Add interceptors to all clients
[fastAPIClient, standardAPIClient, slowAPIClient].forEach((client) => {
  addAuthInterceptor(client);
  addErrorInterceptor(client);
});

export { OptimizedAPIClient };
export default standardAPIClient;
