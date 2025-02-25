import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';
import LogoutUser from '@/core/utils/LogoutUser';
import Cookies from 'js-cookie';
import jwt_decode from 'jwt-decode';
import {
  setUserInfo,
  setSuccess,
} from '@/lib/store/services/account/LoginSlice';
import { getIndividualUserPreferences } from '@/lib/store/services/account/UserDefaultsSlice';
import { getUserDetails } from '@/core/apis/Account';
import Spinner from '../../common/components/Spinner';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

export default function withAuth(Component) {
  return function WithAuthComponent(props) {
    const dispatch = useDispatch();
    const router = useRouter();
    const userCredentials = useSelector((state) => state.login);
    const [isRedirecting, setIsRedirecting] = React.useState(
      router.query.success === 'google',
    );

    const retryWithDelay = async (fn, retries = MAX_RETRIES) => {
      try {
        return await fn();
      } catch (error) {
        if (retries > 0 && error.response?.status === 429) {
          await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
          return retryWithDelay(fn, retries - 1);
        }
        throw error;
      }
    };

    const setupUserSession = async (user) => {
      if (!user.groups[0]?.grp_title) {
        throw new Error(
          'Server error. Contact support to add you to the AirQo Organisation',
        );
      }

      localStorage.setItem('loggedUser', JSON.stringify(user));

      const preferencesResponse = await retryWithDelay(() =>
        dispatch(getIndividualUserPreferences({ identifier: user._id })),
      );
      if (preferencesResponse.payload.success) {
        const preferences = preferencesResponse.payload.preferences;
        const activeGroup = preferences[0]?.group_id
          ? user.groups.find((group) => group._id === preferences[0].group_id)
          : user.groups.find((group) => group.grp_title === 'airqo');
        localStorage.setItem('activeGroup', JSON.stringify(activeGroup));
      }

      dispatch(setUserInfo(user));
      dispatch(setSuccess(true));
    };

    useEffect(() => {
      if (typeof window !== 'undefined') {
        // Handle Google redirect first
        if (router.query.success === 'google') {
          const token = Cookies.get('access_token');
          if (token) {
            localStorage.setItem('token', token);
            const decoded = jwt_decode(token);
            retryWithDelay(() => getUserDetails(decoded._id, token))
              .then((response) => setupUserSession(response.users[0]))
              .catch((error) => {
                console.error('Google auth error:', error);
                setIsRedirecting(false);
                router.push('/account/login');
              });
          } else {
            setIsRedirecting(false);
            router.push('/account/login');
          }
          return; // Exit early to prevent further checks until redirect is resolved
        }

        const storedUserGroup = localStorage.getItem('activeGroup');
        if (!userCredentials.success) {
          router.push('/account/login');
        }

        if (!storedUserGroup) {
          LogoutUser(dispatch, router);
        }
      }
    }, [userCredentials, dispatch, router, retryWithDelay, isRedirecting]);

    // Block rendering until redirect is handled
    if (isRedirecting) {
      return <Spinner width={20} height={20} />;
    }

    // Render the component if the user is authenticated
    return userCredentials.success ? <Component {...props} /> : null;
  };
}

export const withPermission = (Component, requiredPermission) => {
  return function WithPermission(props) {
    const router = useRouter();

    useEffect(() => {
      if (typeof window !== 'undefined') {
        const storedUserGroup = localStorage.getItem('activeGroup');
        const parsedUserGroup = storedUserGroup
          ? JSON.parse(storedUserGroup)
          : {};
        const currentRole = parsedUserGroup?.role;

        const hasPermission = currentRole?.role_permissions?.some(
          (permission) => permission.permission === requiredPermission,
        );

        if (!hasPermission) {
          router.push('/permission-denied');
        }
      }
    }, [requiredPermission, router]);

    return <Component {...props} />;
  };
};

export const checkAccess = (requiredPermission) => {
  if (requiredPermission && typeof window !== 'undefined') {
    const storedGroupObj = localStorage.getItem('activeGroup');
    const currentRole = storedGroupObj ? JSON.parse(storedGroupObj).role : null;

    const permissions = currentRole?.role_permissions?.map(
      (item) => item.permission,
    );

    return permissions?.includes(requiredPermission) ?? false;
  }
  return false;
};
