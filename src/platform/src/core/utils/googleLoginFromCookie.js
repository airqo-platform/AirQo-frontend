import jwt_decode from 'jwt-decode';
import Cookies from 'js-cookie';
import {
  setUserInfo,
  setSuccess,
  setError,
} from '@/lib/store/services/account/LoginSlice';
import { getUserDetails, recentUserPreferencesAPI } from '@/core/apis/Account';
import router from 'next/router';
import logger from '../../lib/logger';

export const handleGoogleLoginFromCookie = async (dispatch) => {
  try {
    const token = Cookies.get('access_token');
    if (!token) throw new Error('No access_token found');

    localStorage.setItem('token', token);
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

    localStorage.setItem('loggedUser', JSON.stringify(user));
    localStorage.setItem('activeGroup', JSON.stringify(activeGroup));

    dispatch(setUserInfo(user));
    dispatch(setSuccess(true));
    Cookies.remove('access_token');
    router.push('/Home');
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
