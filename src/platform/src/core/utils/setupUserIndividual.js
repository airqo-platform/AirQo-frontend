import { getUserDetails } from '@/core/apis/Account';
import {
  setUserInfo,
  setSuccess,
  setError,
} from '@/lib/store/services/account/LoginSlice';
import { setActiveGroup } from '@/lib/store/services/activeGroup/ActiveGroupSlice';
import logger from '@/lib/logger';
import { retryWithDelay } from './retryUtils';

/**
 * Setup individual user after successful authentication
 * Sets AirQo as the default group without fetching preferences
 * Uses NextAuth session data and Redux store instead of localStorage
 * @param {Object} session - NextAuth session object
 * @param {Function} dispatch - Redux dispatch function
 * @returns {Promise<{user: Object, activeGroup: Object}>} - User and active group
 */
export const setupIndividualUserAfterLogin = async (session, dispatch) => {
  try {
    if (!session?.user?.id) {
      throw new Error('Invalid session: missing user ID');
    }

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

    // 2. Set AirQo as default active group (no preferences fetching)
    // Find AirQo group or use first group as fallback
    let activeGroup =
      user.groups.find(
        (group) =>
          group.grp_title?.toLowerCase().includes('airqo') ||
          group._id === user.groups[0]._id,
      ) || user.groups[0];

    // Ensure we always have AirQo as the active group for individual users
    if (!activeGroup.grp_title?.toLowerCase().includes('airqo')) {
      activeGroup = user.groups[0]; // Use first group if no AirQo found
    }

    // 3. Update Redux store with complete user info and AirQo as active group
    dispatch(setUserInfo(user));
    dispatch(setActiveGroup(activeGroup));
    dispatch(setSuccess(true));

    logger.info('Individual user setup completed with AirQo as default group');

    return { user, activeGroup };
  } catch (error) {
    // Clear Redux state if setup fails
    dispatch(setSuccess(false));
    dispatch(setError(error.message || 'Error setting up user session'));
    logger.error('Individual user setup failed:', error);
    throw error;
  }
};
export default setupIndividualUserAfterLogin;
