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
import {
  setActiveGroup,
  clearActiveGroup,
} from '@/lib/store/services/activeGroup/ActiveGroupSlice';
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
  const activeGroup = useSelector((state) => state.activeGroup.activeGroup);

  useEffect(() => {
    if (status === 'loading') {
      // Still loading, don't do anything yet
      return;
    }

    if (status === 'authenticated' && session?.user) {
      // User is authenticated via NextAuth      // Optimize: Check if we already have complete user data in Redux to avoid unnecessary API calls
      const hasCompleteUserData =
        reduxLoginState.userInfo?._id &&
        activeGroup &&
        reduxLoginState.userInfo.groups?.length > 0;

      if (!hasCompleteUserData) {
        // Need to fetch additional user data and set active group (only once)
        const fetchUserDetails = async () => {
          try {
            if (session?.user?.id) {
              // Store token for API calls if available
              if (session.accessToken || session.user.accessToken) {
                const token = session.accessToken || session.user.accessToken;
                localStorage.setItem('token', token);
              }

              // Check if we have cached user data first
              const cachedUser = localStorage.getItem('loggedUser');
              const cachedActiveGroup = localStorage.getItem('activeGroup');

              if (
                cachedUser &&
                cachedActiveGroup &&
                reduxLoginState.userInfo?._id === session.user.id
              ) {
                // Use cached data to avoid API call
                const user = JSON.parse(cachedUser);
                const group = JSON.parse(cachedActiveGroup);

                dispatch(setUserInfo(user));
                dispatch(setActiveGroup(group));
                dispatch(setSuccess(true));
                return;
              }

              // Fetch full user object with groups (only if not cached)
              const userRes = await getUserDetails(session.user.id);
              const user = userRes.users[0];

              if (!user.groups?.length) {
                logger.warn('User has no groups assigned');
                return;
              }

              // Fetch the most recent preference to get active group (with caching)
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

              // Update Redux state
              dispatch(setUserInfo(user));
              dispatch(setActiveGroup(activeGroup));
              dispatch(setSuccess(true));

              // Update localStorage with complete user data
              localStorage.setItem('loggedUser', JSON.stringify(user));
              localStorage.setItem('activeGroup', JSON.stringify(activeGroup));
            }
          } catch (error) {
            logger.error('Error fetching user details:', error);
          }
        };

        fetchUserDetails();
      } else {
        // We have Redux data, ensure localStorage is in sync
        if (reduxLoginState.userInfo && typeof window !== 'undefined') {
          localStorage.setItem(
            'loggedUser',
            JSON.stringify(reduxLoginState.userInfo),
          );
        }
        if (activeGroup && typeof window !== 'undefined') {
          localStorage.setItem('activeGroup', JSON.stringify(activeGroup));
        }
      }
    } else if (status === 'unauthenticated') {
      // User is not authenticated
      // Clear Redux state
      dispatch(resetStore());
      dispatch(clearActiveGroup());

      // Clear localStorage data
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('loggedUser');
        localStorage.removeItem('activeGroup');
      }

      // Check if user is on a protected route
      const protectedRoutes = [
        '/user/Home',
        '/user/map',
        '/user/analytics',
        '/user/settings',
        '/user/collocation',
      ];
      const isProtectedRoute = protectedRoutes.some(
        (route) => pathname.startsWith(route) || pathname === route,
      );

      if (isProtectedRoute) {
        // Redirect to login
        router.push('/user/login');
      }
    }
  }, [
    session,
    status,
    dispatch,
    router,
    pathname,
    reduxLoginState.userInfo,
    activeGroup,
  ]);

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
        dispatch(clearActiveGroup());
      }
    }
  }, [reduxLoginState, status, dispatch]);

  // This component doesn't render anything, it just handles state synchronization
  return null;
};

export default AuthSync;
