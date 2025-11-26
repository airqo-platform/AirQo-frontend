/**
 * Performance optimization utilities for the AirQo platform
 * Includes debouncing, throttling, memory leak prevention, and API optimization
 */

// Cache for storing memoized results to avoid recomputation
const memoCache = new Map();
const MAX_CACHE_SIZE = 100;

/**
 * Debounce function to prevent excessive API calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  let lastArgs;

  const debouncedFn = function (...args) {
    lastArgs = args;
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(this, lastArgs);
      lastArgs = null;
    }, wait);
  };

  // Add cleanup method
  debouncedFn.cancel = () => {
    clearTimeout(timeout);
    lastArgs = null;
  };

  return debouncedFn;
};

/**
 * Throttle function to limit function execution frequency
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export const throttle = (func, limit) => {
  let inThrottle;
  let lastResult;

  const throttledFn = function (...args) {
    if (!inThrottle) {
      lastResult = func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
    return lastResult;
  };

  // Add cleanup method
  throttledFn.cancel = () => {
    inThrottle = false;
  };

  return throttledFn;
};

/**
 * Memoization with cache size limit to prevent memory leaks
 * @param {Function} func - Function to memoize
 * @param {Function} keyGenerator - Function to generate cache key
 * @returns {Function} Memoized function
 */
export const memoize = (
  func,
  keyGenerator = (...args) => JSON.stringify(args),
) => {
  const cache = new Map();

  const memoizedFn = function (...args) {
    const key = keyGenerator(...args);

    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = func.apply(this, args);

    // Prevent cache from growing too large
    if (cache.size >= MAX_CACHE_SIZE) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }

    cache.set(key, result);
    return result;
  };

  // Add cache management methods
  memoizedFn.clearCache = () => cache.clear();
  memoizedFn.cacheSize = () => cache.size;

  return memoizedFn;
};

/**
 * Request idle callback with fallback for better performance
 * @param {Function} callback - Callback to execute
 * @param {Object} options - Options for the callback
 * @returns {number} Request ID
 */
export const requestIdleCallback = (callback, options = {}) => {
  if (typeof window !== 'undefined' && window.requestIdleCallback) {
    return window.requestIdleCallback(callback, options);
  }
  // Fallback for browsers without requestIdleCallback
  return setTimeout(callback, 1);
};

/**
 * Cancel idle callback
 * @param {number} id - Request ID to cancel
 */
export const cancelIdleCallback = (id) => {
  if (typeof window !== 'undefined' && window.cancelIdleCallback) {
    window.cancelIdleCallback(id);
  } else {
    clearTimeout(id);
  }
};

/**
 * Cleanup utility to prevent memory leaks
 * @param {Array} cleanupFunctions - Array of cleanup functions
 * @returns {Function} Cleanup function
 */
export const createCleanup = (cleanupFunctions = []) => {
  const cleanup = () => {
    cleanupFunctions.forEach((fn) => {
      try {
        if (typeof fn === 'function') {
          fn();
        }
      } catch {
        // Silently handle cleanup errors
      }
    });
    cleanupFunctions.length = 0; // Clear the array
  };

  cleanup.add = (fn) => {
    if (typeof fn === 'function') {
      cleanupFunctions.push(fn);
    }
  };

  return cleanup;
};

/**
 * Optimized API request manager to prevent duplicate calls
 */
class APIRequestManager {
  constructor() {
    this.pendingRequests = new Map();
    this.cache = new Map();
    this.cacheExpiry = new Map();
    this.defaultCacheDuration = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Execute a request with deduplication and caching
   * @param {string} key - Unique key for the request
   * @param {Function} requestFn - Function that returns a promise
   * @param {number} cacheDuration - Cache duration in milliseconds
   * @returns {Promise} Request promise
   */
  async request(key, requestFn, cacheDuration = this.defaultCacheDuration) {
    // Check cache first
    if (this.isValidCache(key)) {
      return this.cache.get(key);
    }

    // Check if request is already pending
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key);
    }

    // Execute new request
    const requestPromise = requestFn()
      .then((result) => {
        // Cache the result
        this.cache.set(key, result);
        this.cacheExpiry.set(key, Date.now() + cacheDuration);

        // Remove from pending
        this.pendingRequests.delete(key);

        return result;
      })
      .catch((error) => {
        // Remove from pending on error
        this.pendingRequests.delete(key);
        throw error;
      });

    // Store pending request
    this.pendingRequests.set(key, requestPromise);

    return requestPromise;
  }

  /**
   * Check if cache entry is valid
   * @param {string} key - Cache key
   * @returns {boolean} Is cache valid
   */
  isValidCache(key) {
    if (!this.cache.has(key)) return false;

    const expiry = this.cacheExpiry.get(key);
    if (!expiry || Date.now() > expiry) {
      this.cache.delete(key);
      this.cacheExpiry.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Clear cache for a specific key or all keys
   * @param {string} key - Optional key to clear
   */
  clearCache(key = null) {
    if (key) {
      this.cache.delete(key);
      this.cacheExpiry.delete(key);
    } else {
      this.cache.clear();
      this.cacheExpiry.clear();
    }
  }

  /**
   * Cancel a pending request
   * @param {string} key - Request key to cancel
   */
  cancelRequest(key) {
    this.pendingRequests.delete(key);
  }

  /**
   * Clean up expired cache entries
   */
  cleanupExpiredCache() {
    const now = Date.now();
    for (const [key, expiry] of this.cacheExpiry.entries()) {
      if (now > expiry) {
        this.cache.delete(key);
        this.cacheExpiry.delete(key);
      }
    }
  }
}

// Export singleton instance
export const apiRequestManager = new APIRequestManager();

// Set up automatic cache cleanup
if (typeof window !== 'undefined') {
  setInterval(
    () => {
      apiRequestManager.cleanupExpiredCache();
    },
    10 * 60 * 1000,
  ); // Clean up every 10 minutes
}

/**
 * React hook for component cleanup
 * @returns {Function} Cleanup function
 */
export const useCleanup = () => {
  const cleanup = createCleanup();

  // Auto-cleanup on unmount
  if (typeof window !== 'undefined') {
    // Use React's useEffect cleanup pattern
    return cleanup;
  }

  return cleanup;
};

/**
 * Optimize component rendering with intelligent shouldUpdate logic
 * @param {Object} prevProps - Previous props
 * @param {Object} nextProps - Next props
 * @param {Array} compareKeys - Keys to compare
 * @returns {boolean} Should component update
 */
export const shouldComponentUpdate = (
  prevProps,
  nextProps,
  compareKeys = null,
) => {
  if (!compareKeys) {
    // Deep comparison if no specific keys provided
    return JSON.stringify(prevProps) !== JSON.stringify(nextProps);
  }

  for (const key of compareKeys) {
    if (prevProps[key] !== nextProps[key]) {
      return true;
    }
  }

  return false;
};

/**
 * Batch multiple state updates to improve performance
 * @param {Function} updateFn - Function containing state updates
 */
export const batchUpdates = (updateFn) => {
  // In React 18+, automatic batching handles this
  // For older versions, use ReactDOM.unstable_batchedUpdates if available
  if (typeof window !== 'undefined' && window.React?.version >= '18') {
    updateFn();
  } else if (
    typeof window !== 'undefined' &&
    window.ReactDOM?.unstable_batchedUpdates
  ) {
    window.ReactDOM.unstable_batchedUpdates(updateFn);
  } else {
    updateFn();
  }
};

/**
 * Create optimized event handler to prevent memory leaks
 * @param {Function} handler - Event handler function
 * @param {Array} dependencies - Dependencies array
 * @returns {Function} Optimized handler
 */
export const createOptimizedHandler = (handler, dependencies = []) => {
  const memoizedHandler = memoize(handler, () => JSON.stringify(dependencies));
  return memoizedHandler;
};

// Global cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    memoCache.clear();
    apiRequestManager.clearCache();
  });
}

const performanceUtils = {
  debounce,
  throttle,
  memoize,
  requestIdleCallback,
  cancelIdleCallback,
  createCleanup,
  apiRequestManager,
  useCleanup,
  shouldComponentUpdate,
  batchUpdates,
  createOptimizedHandler,
};

export default performanceUtils;
