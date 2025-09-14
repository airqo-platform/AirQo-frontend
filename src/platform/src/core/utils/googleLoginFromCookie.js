import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';
import {
  setUserInfo,
  setSuccess,
  setError,
} from '@/lib/store/services/account/LoginSlice';
import { setActiveGroup } from '@/lib/store/services/groups';
import { getUserDetails, recentUserPreferencesAPI } from '@/core/apis/Account';
import logger from '../../lib/logger';

// Constants
const COOKIE_NAME = 'access_token';
const DEFAULT_ERROR_MESSAGE = 'Google login failed. Please try again.';
const NO_GROUPS_ERROR =
  'Server error. Contact support to add you to the AirQo Organisation';

// Token validation utility
const validateAndDecodeToken = (token) => {
  if (!token) {
    throw new Error('No access_token found');
  }

  try {
    const decoded = jwtDecode(token);

    if (!decoded._id) {
      throw new Error('Invalid token: missing user ID');
    }

    return decoded;
  } catch (error) {
    logger.error('Token decode error:', error);
    throw new Error('Invalid or expired token');
  }
};

// User data fetcher with validation
const fetchUserWithGroups = async (userId) => {
  try {
    const userResponse = await getUserDetails(userId);
    const user = userResponse?.users?.[0];

    if (!user) {
      throw new Error('User not found');
    }

    if (!user.groups?.length) {
      throw new Error(NO_GROUPS_ERROR);
    }

    return user;
  } catch (error) {
    logger.error('Failed to fetch user details:', {
      userId,
      error: error.message,
    });
    throw error;
  }
};

// Active group resolver with fallback
const resolveActiveGroup = async (user) => {
  const defaultGroup = user.groups[0];

  try {
    const prefResponse = await recentUserPreferencesAPI(user._id);

    if (prefResponse?.success && prefResponse?.preference?.group_id) {
      const { group_id } = prefResponse.preference;
      const matchedGroup = user.groups.find((group) => group._id === group_id);

      if (matchedGroup) {
        logger.info('Using user preferred group:', { groupId: group_id });
        return matchedGroup;
      }
    }
  } catch (error) {
    logger.warn('Failed to fetch user preferences, using default group:', {
      userId: user._id,
      error: error.message,
    });
  }

  logger.info('Using default group for user:', { userId: user._id });
  return defaultGroup;
};

// Error handler with standardized messaging
const handleLoginError = (dispatch, error) => {
  dispatch(setSuccess(false));

  const errorMessage =
    error?.response?.data?.message || error?.message || DEFAULT_ERROR_MESSAGE;

  dispatch(setError(errorMessage));
  logger.error('Google login error:', { error: errorMessage });

  return errorMessage;
};

// Cleanup function
const cleanupAuthCookie = () => {
  try {
    Cookies.remove(COOKIE_NAME);
    logger.debug('Auth cookie cleaned up');
  } catch (error) {
    logger.warn('Failed to remove auth cookie:', error);
  }
};

// Main handler function
export const handleGoogleLoginFromCookie = async (dispatch, router) => {
  try {
    logger.info('Starting Google login from cookie');

    // Step 1: Validate and decode token
    const token = Cookies.get(COOKIE_NAME);
    const decodedToken = validateAndDecodeToken(token);

    // Step 2: Fetch user with validation
    const user = await fetchUserWithGroups(decodedToken._id);

    // Step 3: Resolve active group with preferences
    const activeGroup = await resolveActiveGroup(user);

    // Step 4: Update Redux state
    dispatch(setUserInfo(user));
    dispatch(setActiveGroup(activeGroup));
    dispatch(setSuccess(true));

    // Step 5: Cleanup and redirect
    cleanupAuthCookie();

    logger.info('Google login successful:', {
      userId: user._id,
      activeGroupId: activeGroup._id,
    });

    router.push('/');
  } catch (error) {
    handleLoginError(dispatch, error);
  }
};
