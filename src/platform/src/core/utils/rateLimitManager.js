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
    const timestamps = this.requestTimestamps.get(key) || [];

    // Clean old timestamps outside the window
    const validTimestamps = timestamps.filter(
      (timestamp) => now - timestamp < this.WINDOW_SIZE,
    );

    // Update the timestamps
    this.requestTimestamps.set(key, validTimestamps);

    // Check if we're within the limit
    return validTimestamps.length < this.MAX_REQUESTS;
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
    const timestamps = this.requestTimestamps.get(key) || [];
    const validTimestamps = timestamps.filter(
      (timestamp) => now - timestamp < this.WINDOW_SIZE,
    );

    return Math.max(0, this.MAX_REQUESTS - validTimestamps.length);
  }

  /**
   * Get time until window resets
   * @param {string} key - Unique key for the request type
   * @returns {number} - Time in milliseconds until reset
   */
  getTimeUntilReset(key) {
    const timestamps = this.requestTimestamps.get(key) || [];
    if (timestamps.length === 0) return 0;

    const oldestTimestamp = Math.min(...timestamps);
    const resetTime = oldestTimestamp + this.WINDOW_SIZE;

    return Math.max(0, resetTime - Date.now());
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
export function withRateLimit(apiFunction, key) {
  return async (...args) => {
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
      // If we get a 429 from server, record it
      if (error.response?.status === 429) {
        // Temporarily block further requests
        for (let i = 0; i < 10; i++) {
          rateLimitManager.recordRequest(key);
        }
      }
      throw error;
    }
  };
}

export default rateLimitManager;
