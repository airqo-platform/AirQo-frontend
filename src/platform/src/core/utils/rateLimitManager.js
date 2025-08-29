/**
 * Rate Limiting Helper for API Calls
 * Prevents excessive API calls that lead to rate limiting
 */

class RateLimitManager {
  constructor() {
    this.requestTimestamps = new Map();
    this.requestCounts = new Map();
    this.WINDOW_SIZE = 15 * 60 * 1000; // 15 minutes
    this.MAX_REQUESTS = 100; // Max requests per window
  }

  /**
   * Check if a request should be allowed
   * @param {string} key - Unique key for the request type (e.g., 'org-theme-fetch')
   * @returns {boolean} - Whether the request is allowed
   */
  canMakeRequest(key) {
    const now = Date.now();
    const ts = (this.requestTimestamps.get(key) || []).filter(
      (t) => now - t < this.WINDOW_SIZE,
    );
    this.requestTimestamps.set(key, ts);
    return ts.length < this.MAX_REQUESTS;
  }

  /**
   * Record a request
   * @param {string} key - Unique key for the request type
   */
  recordRequest(key) {
    const now = Date.now();
    const timestamps = this.requestTimestamps.get(key) || [];
    timestamps.push(now);
    this.requestTimestamps.set(key, timestamps);

    // Update request count
    const count = this.requestCounts.get(key) || 0;
    this.requestCounts.set(key, count + 1);
  }

  /**
   * Get remaining requests in current window
   * @param {string} key - Unique key for the request type
   * @returns {number} - Number of remaining requests
   */
  getRemainingRequests(key) {
    const now = Date.now();
    const ts = (this.requestTimestamps.get(key) || []).filter(
      (t) => now - t < this.WINDOW_SIZE,
    );
    return Math.max(0, this.MAX_REQUESTS - ts.length);
  }

  /**
   * Get time until window resets
   * @param {string} key - Unique key for the request type
   * @returns {number} - Time in milliseconds until reset
   */
  getTimeUntilReset(key) {
    const now = Date.now();
    const ts = (this.requestTimestamps.get(key) || []).filter(
      (t) => now - t < this.WINDOW_SIZE,
    );
    if (ts.length === 0) return 0;
    // timestamps appended in order -> first is oldest after pruning
    const oldestTimestamp = ts[0];
    const resetTime = oldestTimestamp + this.WINDOW_SIZE;
    return Math.max(0, resetTime - now);
  }

  /**
   * Clear rate limit data for a key
   * @param {string} key - Unique key for the request type
   */
  clearRateLimit(key) {
    this.requestTimestamps.delete(key);
    this.requestCounts.delete(key);
  }

  /**
   * Get statistics for debugging
   * @param {string} key - Unique key for the request type
   * @returns {object} - Statistics object
   */
  getStats(key) {
    const now = Date.now();
    const timestamps = this.requestTimestamps.get(key) || [];
    const validTimestamps = timestamps.filter(
      (timestamp) => now - timestamp < this.WINDOW_SIZE,
    );

    return {
      totalRequests: this.requestCounts.get(key) || 0,
      requestsInWindow: validTimestamps.length,
      remainingRequests: this.getRemainingRequests(key),
      timeUntilReset: this.getTimeUntilReset(key),
      canMakeRequest: this.canMakeRequest(key),
    };
  }
}

// Export singleton instance
export const rateLimitManager = new RateLimitManager();

/**
 * Decorator function to add rate limiting to API calls
 * @param {Function} apiFunction - The API function to wrap
 * @param {string} key - Unique key for rate limiting
 * @returns {Function} - Wrapped function with rate limiting
 */
// keyOrKeyFn: string | ((...args:any[]) => string)
export function withRateLimit(apiFunction, keyOrKeyFn) {
  return async (...args) => {
    const key =
      typeof keyOrKeyFn === 'function' ? keyOrKeyFn(...args) : keyOrKeyFn;
    if (!rateLimitManager.canMakeRequest(key)) {
      const stats = rateLimitManager.getStats(key);
      const error = new Error(
        `Rate limit exceeded for ${key}. Try again in ${Math.ceil(stats.timeUntilReset / 1000)} seconds.`,
      );
      error.isRateLimit = true;
      error.retryAfter = Math.ceil(stats.timeUntilReset / 1000);
      throw error;
    }

    try {
      rateLimitManager.recordRequest(key);
      return await apiFunction(...args);
    } catch (error) {
      // If we get a 429 from server, exhaust remaining allowance
      if (error.response?.status === 429) {
        const remaining = rateLimitManager.getRemainingRequests(key);
        for (let i = 0; i < remaining; i++) {
          rateLimitManager.recordRequest(key);
        }
      }
      throw error;
    }
  };
}

export default rateLimitManager;
