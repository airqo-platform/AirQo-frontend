'use client';

import { useEffect, useRef, useState } from 'react';
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
 * AuthSync component with strict session separation and redirect loop prevention
 * Ensures organization and user sessions cannot cross-contaminate
 */
const AuthSync = () => {
  const { data: session, status } = useSession();
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const reduxLoginState = useSelector((state) => state.login);
  const activeGroup = useSelector((state) => state.activeGroup.activeGroup);

  // Prevent infinite loops and duplicate processing
  const isProcessingRef = useRef(false);
  const lastProcessedSessionRef = useRef(null);
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    // Skip processing during loading
    if (status === 'loading') {
      return;
    }

    // Prevent duplicate processing of the same session
    const sessionKey = `${status}-${session?.user?.id}-${session?.sessionType}`;
    if (
      sessionKey === lastProcessedSessionRef.current ||
      isProcessingRef.current
    ) {
      return;
    }
    lastProcessedSessionRef.current = sessionKey;
    isProcessingRef.current = true;

    const processAuthState = async () => {
      try {
        if (status === 'authenticated' && session?.user) {
          // STRICT SESSION TYPE CHECKING - prevent cross-contamination
          const sessionType = session.sessionType || session.user.sessionType;

          // Route type detection
          const isOrgRoute = pathname.includes('/org/');
          const isUserRoute =
            pathname.includes('/user/') || pathname.includes('(individual)');

          // Debug logging
          logger.info('AuthSync - Session validation:', {
            sessionType,
            isOrgRoute,
            isUserRoute,
            pathname,
            userId: session.user.id,
            orgSlug: session.orgSlug || session.user.orgSlug,
          });

          // STRICT ENFORCEMENT: Organization sessions cannot access user routes
          if (sessionType === 'organization' && isUserRoute) {
            logger.warn(
              'Organization session attempting to access user route - redirecting',
            );
            const orgSlug = session.orgSlug || session.user.orgSlug || 'airqo';
            router.replace(`/org/${orgSlug}/dashboard`);
            return;
          }

          // STRICT ENFORCEMENT: User sessions cannot access org routes
          if (sessionType === 'user' && isOrgRoute) {
            logger.warn(
              'User session attempting to access org route - redirecting',
            );
            router.replace('/user/Home');
            return;
          }

          // Handle organization session
          if (sessionType === 'organization') {
            await handleOrganizationSession();
          }
          // Handle user session
          else if (sessionType === 'user') {
            await handleUserSession();
          } // Invalid or missing session type
          else {
            logger.error('Invalid or missing session type:', {
              sessionType,
              sessionData: session,
            });

            // Redirect to appropriate login based on current route
            if (isOrgRoute) {
              const orgSlugMatch = pathname.match(/^\/org\/([^/]+)/);
              const orgSlug = orgSlugMatch ? orgSlugMatch[1] : 'airqo';
              router.replace(`/org/${orgSlug}/login`);
            } else {
              router.replace('/user/login');
            }
          }
        } else if (status === 'unauthenticated') {
          handleUnauthenticatedState();
        }
      } catch (error) {
        logger.error('AuthSync error:', error);
      } finally {
        isProcessingRef.current = false;
        setHasInitialized(true);
      }
    };

    const handleOrganizationSession = async () => {
      // Only sync minimal data - don't redirect from AuthSync for org users
      if (
        !reduxLoginState.userInfo ||
        reduxLoginState.userInfo._id !== session.user.id
      ) {
        dispatch(
          setUserInfo({
            _id: session.user.id,
            email: session.user.email,
            name: session.user.name || session.user.firstName,
            firstName: session.user.firstName,
            lastName: session.user.lastName,
            organization: session.user.organization,
            long_organization: session.user.long_organization,
            picture: session.user.profilePicture || session.user.image,
          }),
        );
      }

      if (!activeGroup || activeGroup._id !== session.user.organization) {
        dispatch(
          setActiveGroup({
            _id: session.user.organization,
            organization: session.user.organization,
            long_organization:
              session.user.long_organization || session.user.organization,
            grp_title:
              session.user.long_organization || session.user.organization,
            orgSlug: session.orgSlug || session.user.orgSlug,
          }),
        );
      }

      if (!reduxLoginState.success) {
        dispatch(setSuccess(true));
      }
    };

    const handleUserSession = async () => {
      // Check if we need to fetch user data
      const needsUserData =
        !reduxLoginState.userInfo ||
        reduxLoginState.userInfo._id !== session.user.id ||
        !reduxLoginState.userInfo.groups?.length;

      if (needsUserData && session?.user?.id) {
        try {
          // Set basic session data immediately
          dispatch(
            setUserInfo({
              _id: session.user.id,
              email: session.user.email,
              name: session.user.name || session.user.firstName,
              firstName: session.user.firstName,
              lastName: session.user.lastName,
              organization: session.user.organization,
              long_organization: session.user.long_organization,
              picture: session.user.profilePicture || session.user.image,
            }),
          );

          // Fetch complete user data in background
          const userRes = await getUserDetails(session.user.id);
          const user = userRes.users?.[0];

          if (user?.groups?.length) {
            // Find active group from preferences
            let activeGroupData = user.groups[0]; // default
            try {
              const prefRes = await recentUserPreferencesAPI(user._id);
              if (prefRes.success && prefRes.preference?.group_id) {
                const matched = user.groups.find(
                  (g) => g._id === prefRes.preference.group_id,
                );
                if (matched) activeGroupData = matched;
              }
            } catch (prefError) {
              logger.warn('Failed to fetch preferences:', prefError.message);
            }

            // Update Redux with complete data
            dispatch(setUserInfo(user));
            dispatch(setActiveGroup(activeGroupData));
          }

          dispatch(setSuccess(true));
        } catch (error) {
          logger.error('Failed to fetch user details:', error);
          // Don't fail the session, just use basic data
          dispatch(setSuccess(true));
        }
      } else if (!reduxLoginState.success) {
        dispatch(setSuccess(true));
      }
    };

    const handleUnauthenticatedState = () => {
      // Clear Redux state
      dispatch(resetStore());
      dispatch(clearActiveGroup());

      // Only redirect if on protected routes
      const protectedUserRoutes = [
        '/user/Home',
        '/user/map',
        '/user/analytics',
        '/user/settings',
        '/user/collocation',
      ];
      const isProtectedUserRoute = protectedUserRoutes.some((route) =>
        pathname.startsWith(route),
      );
      const isProtectedOrgRoute =
        pathname.includes('/org/') &&
        !pathname.includes('/login') &&
        !pathname.includes('/register') &&
        !pathname.includes('/forgotPwd');

      if (isProtectedUserRoute) {
        router.replace('/user/login');
      } else if (isProtectedOrgRoute) {
        const orgSlug = pathname.split('/org/')[1]?.split('/')[0] || 'airqo';
        router.replace(`/org/${orgSlug}/login`);
      }
    };

    processAuthState();
  }, [
    status,
    session?.user?.id,
    session?.sessionType,
    session?.user?.sessionType,
    pathname,
    dispatch,
    router,
    reduxLoginState.success,
    activeGroup?._id,
    hasInitialized,
  ]);
  return null;
};

export default AuthSync;
