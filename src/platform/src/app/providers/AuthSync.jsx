'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter, usePathname } from 'next/navigation';
import {
  setUserInfo,
  setSuccess,
  resetStore,
} from '@/lib/store/services/account/LoginSlice';
import { getUserDetails, recentUserPreferencesAPI } from '@/core/apis/Account';
import logger from '@/lib/logger';

/**
 * AuthSync component synchronizes authentication state between NextAuth and Redux
 * This prevents conflicts between different auth systems and ensures consistent state
 */
const AuthSync = () => {
  const { data: session, status } = useSession();
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const reduxLoginState = useSelector((state) => state.login);

  useEffect(() => {
    if (status === 'loading') {
      // Still loading, don't do anything yet
      return;
    }

    if (status === 'authenticated' && session?.user) {
      // User is authenticated via NextAuth

      // Check if we already have user data in localStorage
      const storedUser = localStorage.getItem('loggedUser');
      const activeGroup = localStorage.getItem('activeGroup');

      if (!storedUser || !activeGroup) {
        // Need to fetch additional user data and set active group
        const fetchUserDetails = async () => {
          try {
            if (session?.user?.id) {
              // Store token for API calls if available
              if (session.accessToken) {
                localStorage.setItem('token', session.accessToken);
              }

              // Fetch full user object with groups
              const userRes = await getUserDetails(session.user.id);
              const user = userRes.users[0];

              if (!user.groups?.length) {
                logger.warn('User has no groups assigned');
                return;
              }

              // Fetch the most recent preference to get active group
              let activeGroup = user.groups[0]; // default
              try {
                const prefRes = await recentUserPreferencesAPI(user._id);
                if (prefRes.success && prefRes.preference) {
                  const { group_id } = prefRes.preference;
                  const matched = user.groups.find((g) => g._id === group_id);
                  if (matched) activeGroup = matched;
                }
              } catch (error) {
                logger.warn(
                  `Failed to fetch user preferences: ${error.message}`,
                );
                // Continue with default group
              }

              // Store enhanced user data in localStorage and Redux
              localStorage.setItem('loggedUser', JSON.stringify(user));
              localStorage.setItem('activeGroup', JSON.stringify(activeGroup));

              dispatch(setUserInfo(user));
              dispatch(setSuccess(true));
            }
          } catch (error) {
            logger.error('Error fetching user details:', error);
          }
        };

        fetchUserDetails();
      } else {
        // We have the data, just sync Redux state
        try {
          const parsedUser = JSON.parse(storedUser);
          dispatch(setUserInfo(parsedUser));
          dispatch(setSuccess(true));
        } catch (error) {
          logger.error('Error parsing stored user data:', error);
        }
      }
    } else if (status === 'unauthenticated') {
      // User is not authenticated
      // Clear Redux state
      dispatch(resetStore());

      // Clear localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('loggedUser');
        localStorage.removeItem('activeGroup');
        localStorage.removeItem('userInfo');
        localStorage.removeItem('isAuthenticated');
      }

      // Check if user is on a protected route
      const protectedRoutes = [
        '/Home',
        '/map',
        '/analytics',
        '/settings',
        '/collocation',
      ];
      const isProtectedRoute = protectedRoutes.some(
        (route) => pathname.startsWith(route) || pathname === route,
      );

      if (isProtectedRoute) {
        // Redirect to login
        router.push('/account/login');
      }
    }
  }, [session, status, dispatch, router, pathname]);

  // Also listen for Redux state changes to sync back to NextAuth if needed
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // If Redux has user info but NextAuth doesn't, there might be a sync issue
      if (
        reduxLoginState.success &&
        reduxLoginState.userInfo &&
        status === 'unauthenticated'
      ) {
        // This could indicate a session expiry or desync
        logger.warn(
          'Authentication state mismatch detected, clearing Redux state',
        );
        dispatch(resetStore());
      }
    }
  }, [reduxLoginState, status, dispatch]);

  // This component doesn't render anything, it just handles state synchronization
  return null;
};

export default AuthSync;
