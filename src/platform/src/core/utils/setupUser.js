import { getUserDetails, recentUserPreferencesAPI } from '@/core/apis/Account';
import {
  setUserInfo,
  setSuccess,
  setError,
} from '@/lib/store/services/account/LoginSlice';
import { setActiveGroup } from '@/lib/store/services/activeGroup/ActiveGroupSlice';
import logger from '@/lib/logger';
import { retryWithDelay } from './retryUtils';

/**
 * Setup user after successful authentication using NextAuth session
 * Uses session-based approach without localStorage dependency
 * Fetches full user details, preferences and sets up the session
 * @param {Object} session - NextAuth session object
 * @param {Function} dispatch - Redux dispatch function
 * @returns {Promise<{user: Object, activeGroup: Object}>} - User and active group
 */
export const setupUserAfterLogin = async (session, dispatch) => {
  try {
    if (!session?.user?.id) {
      throw new Error('Invalid session: missing user ID');
    }

    logger.info(`Setting up user session for ${session.user.id}`);

    // Set basic user data immediately from session for faster UI updates
    const basicUserData = {
      _id: session.user.id,
      firstName:
        session.user.firstName ||
        session.user.name?.split(' ')[0] ||
        session.user.name,
      lastName:
        session.user.lastName ||
        session.user.name?.split(' ').slice(1).join(' '),
      name: session.user.name,
      email: session.user.email,
      userName: session.user.userName || session.user.email,
      organization: session.user.organization,
      long_organization: session.user.long_organization,
      profilePicture: session.user.profilePicture || session.user.image,
      country: session.user.country,
      phoneNumber: session.user.phoneNumber,
      createdAt: session.user.createdAt,
      updatedAt: session.user.updatedAt,
    };

    // Immediately update Redux store with session data for faster UI response
    dispatch(setUserInfo(basicUserData));

    // 1. Fetch full user object with groups
    const userRes = await retryWithDelay(() => getUserDetails(session.user.id));
    const user = userRes.users[0];

    if (!user) {
      throw new Error('User not found');
    }

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

    // 3. Update Redux store with complete user info and active group
    dispatch(setUserInfo(user));
    dispatch(setActiveGroup(activeGroup));
    dispatch(setSuccess(true));

    logger.info(
      `User setup completed for ${user.email} with active group: ${activeGroup.grp_title}`,
    );

    return { user, activeGroup };
  } catch (error) {
    // Clear Redux state if setup fails
    dispatch(setSuccess(false));
    dispatch(setError(error.message || 'Error setting up user session'));
    logger.error('User setup failed:', error);
    throw error;
  }
};

export default setupUserAfterLogin;
