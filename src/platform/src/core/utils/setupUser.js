import jwt_decode from 'jwt-decode';
import { getUserDetails, recentUserPreferencesAPI } from '@/core/apis/Account';
import {
  setUserInfo,
  setSuccess,
  setError,
} from '@/lib/store/services/account/LoginSlice';
import logger from '@/lib/logger';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

/**
 * Retry a function with delay on specific error conditions
 * @param {Function} fn - Function to retry
 * @param {number} retries - Number of retries
 * @returns {Promise} - Result of the function
 */
const retryWithDelay = async (fn, retries = MAX_RETRIES) => {
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

/**
 * Setup user after successful authentication
 * Fetches full user details, preferences and sets up the session
 * @param {string} accessToken - JWT access token
 * @param {Function} dispatch - Redux dispatch function
 * @returns {Promise<{user: Object, activeGroup: Object}>} - User and active group
 */
export const setupUserAfterLogin = async (accessToken, dispatch) => {
  try {
    // Store token for API calls
    localStorage.setItem('token', accessToken);

    // Decode token to get user ID
    const decoded = jwt_decode(accessToken);

    // 1. Fetch full user object with groups
    const userRes = await retryWithDelay(() => getUserDetails(decoded._id));
    const user = userRes.users[0];

    if (!user.groups?.length) {
      throw new Error(
        'Server error. Contact support to add you to the AirQo Organisation',
      );
    }

    // 2. Fetch the most recent preference to get active group
    let activeGroup = user.groups[0]; // default
    try {
      const prefRes = await retryWithDelay(() =>
        recentUserPreferencesAPI(user._id),
      );
      if (prefRes.success && prefRes.preference) {
        const { group_id } = prefRes.preference;
        const matched = user.groups.find((g) => g._id === group_id);
        if (matched) activeGroup = matched;
      }
    } catch (prefError) {
      logger.warn(
        `Failed to fetch user preferences: ${prefError.message || 'Unknown error'}`,
      );
      // Continue with default group
    }

    // 3. Store enhanced user data in Redux and localStorage
    localStorage.setItem('loggedUser', JSON.stringify(user));
    localStorage.setItem('activeGroup', JSON.stringify(activeGroup));

    // 4. Update Redux store with complete user info
    dispatch(setUserInfo(user));
    dispatch(setSuccess(true));

    return { user, activeGroup };
  } catch (error) {
    // Clear any partial data if setup fails
    localStorage.removeItem('token');
    localStorage.removeItem('loggedUser');
    localStorage.removeItem('activeGroup');

    dispatch(setSuccess(false));
    dispatch(setError(error.message || 'Error setting up user session'));

    throw error;
  }
};

export default setupUserAfterLogin;
