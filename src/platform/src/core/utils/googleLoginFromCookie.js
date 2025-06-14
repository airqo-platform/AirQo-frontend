import jwt_decode from 'jwt-decode';
import Cookies from 'js-cookie';
import {
  setUserInfo,
  setSuccess,
  setError,
} from '@/lib/store/services/account/LoginSlice';
import { setActiveGroup } from '@/lib/store/services/groups';
import { getUserDetails, recentUserPreferencesAPI } from '@/core/apis/Account';
import logger from '../../lib/logger';

export const handleGoogleLoginFromCookie = async (dispatch, router) => {
  try {
    const token = Cookies.get('access_token');
    if (!token) throw new Error('No access_token found');

    // Note: Token is now managed by NextAuth session, not localStorage
    const decoded = jwt_decode(token);

    // Fetch user
    const userRes = await getUserDetails(decoded._id);
    const user = userRes.users[0];
    if (!user.groups?.length) {
      throw new Error(
        'Server error. Contact support to add you to the AirQo Organisation',
      );
    }

    // Fetch recent preferences
    let activeGroup = user.groups[0]; // default
    try {
      const prefRes = await recentUserPreferencesAPI(user._id);
      if (prefRes.success && prefRes.preference) {
        const { group_id } = prefRes.preference;
        const matched = user.groups.find((g) => g._id === group_id);
        if (matched) activeGroup = matched;
      }
    } catch {
      // fallback to default
      logger.warn(
        `Failed to fetch recent user preferences, using default group for user ${user._id}`,
      );
    }

    // Store in Redux instead of localStorage
    dispatch(setUserInfo(user));
    dispatch(setActiveGroup(activeGroup));
    dispatch(setSuccess(true));
    Cookies.remove('access_token');
    router.push('/');
  } catch (err) {
    dispatch(setSuccess(false));
    const errorMessage =
      err.response?.data?.message ||
      err.message ||
      'Google login failed. Please try again.';
    dispatch(setError(errorMessage));
    logger.error(errorMessage);
  }
};
