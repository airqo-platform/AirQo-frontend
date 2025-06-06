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
      // User is authenticated via NextAuth
      const isOrgRoute =
        pathname.includes('/org/') || pathname.includes('/organization');

      // Handle organization users differently based on route context
      if (isOrgRoute && session?.user?.organization) {
        // User is on org route and has org in session - this is valid
        const needsUpdate =
          !reduxLoginState.userInfo ||
          reduxLoginState.userInfo._id !== session.user.id ||
          reduxLoginState.userInfo.organization !== session.user.organization ||
          !reduxLoginState.success;

        if (needsUpdate) {
          // Set minimal organization user data in Redux
          dispatch(
            setUserInfo({
              _id: session.user.id,
              email: session.user.email,
              name: session.user.name,
              picture: session.user.image,
              organization: session.user.organization,
            }),
          );

          if (!reduxLoginState.success) {
            dispatch(setSuccess(true));
          }
        }

        // Handle group state separately to avoid circular dependencies
        if (!activeGroup || activeGroup._id !== session.user.organization) {
          dispatch(
            setActiveGroup({
              _id: session.user.organization,
              organization: session.user.organization,
              long_organization:
                session.user.long_organization || session.user.organization,
            }),
          );
        }
        // Exit early for org users to prevent individual user logic
        return;
      }

      // Handle case where user is on org route but doesn't have org in session
      if (isOrgRoute && !session?.user?.organization) {
        // User is trying to access org route without proper org session
        // Extract org slug and redirect to org login
        const orgSlugMatch = pathname.match(/^\/org\/([^/]+)/);
        if (orgSlugMatch) {
          const orgSlug = orgSlugMatch[1];
          if (
            !pathname.includes('/login') &&
            !pathname.includes('/register') &&
            !pathname.includes('/forgotPwd')
          ) {
            router.push(`/org/${orgSlug}/login`);
          }
        }
        return;
      }

      // For individual users, proceed with the existing logic
      // Optimize: Check if we already have complete user data in Redux to avoid unnecessary API calls
      const hasCompleteUserData =
        reduxLoginState.userInfo?._id &&
        activeGroup &&
        reduxLoginState.userInfo.groups?.length > 0;

      if (!hasCompleteUserData) {
        // Need to fetch additional user data and set active group (only once)
        const fetchUserDetails = async () => {
          try {
            if (session?.user?.id) {
              // Note: Token is now managed by NextAuth session, no localStorage storage needed

              // Check if we already have user data in Redux to avoid unnecessary API calls
              if (reduxLoginState.userInfo?._id === session.user.id) {
                // Use Redux data, no need for API call
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

              // Note: User data is now stored in Redux and session only
              // No localStorage usage for user/active group data
            }
          } catch (error) {
            logger.error('Error fetching user details:', error);
          }
        };

        fetchUserDetails();
      } else {
        // We have Redux data, no localStorage sync needed
        // Data is maintained in Redux and NextAuth session
      }
    } else if (status === 'unauthenticated') {
      // User is not authenticated
      // Clear Redux state
      dispatch(resetStore());
      dispatch(clearActiveGroup());

      // Note: No localStorage cleanup needed as we don't store user data there

      // Check if user is on a protected route
      const protectedRoutes = [
        '/user/Home',
        '/user/map',
        '/user/analytics',
        '/user/settings',
        '/user/collocation',
      ];

      // Check if the path includes organization paths
      const isOrgProtectedRoute =
        pathname.includes('/org/') &&
        !pathname.includes('/login') &&
        !pathname.includes('/register') &&
        !pathname.includes('/forgotPwd');

      const isProtectedRoute = protectedRoutes.some(
        (route) => pathname.startsWith(route) || pathname === route,
      );

      if (isProtectedRoute) {
        // Redirect to login
        router.push('/user/login');
      } else if (isOrgProtectedRoute) {
        // Handle organization routes
        // Extract org slug from the pathname
        const orgSlug = pathname.split('/org/')[1]?.split('/')[0];
        if (orgSlug) {
          router.push(`/org/${orgSlug}/login`);
        } else {
          router.push('/');
        }
      }
    }
  }, [
    status,
    session,
    dispatch,
    router,
    pathname,
    reduxLoginState.userInfo?._id,
    reduxLoginState.userInfo?.groups,
    activeGroup,
  ]);

  return null;
};

export default AuthSync;
