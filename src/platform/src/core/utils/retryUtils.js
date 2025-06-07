const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

/**
 * Retry a function with delay on specific error conditions
 * @param {Function} fn - Function to retry
 * @param {number} retries - Number of retries
 * @returns {Promise} - Result of the function
 */
export const retryWithDelay = async (fn, retries = MAX_RETRIES) => {
  try {
    return await fn();
  } catch (err) {
    if (retries > 0 && err.response?.status === 429) {
      await new Promise((res) => setTimeout(res, RETRY_DELAY));
      return retryWithDelay(fn, retries - 1);
    }
    throw err;
  }
};

export default retryWithDelay;
