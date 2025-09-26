'use client';

import { useEffect, useCallback, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { performComprehensiveLogout } from '@/lib/logoutUtils';
import logger from '@/lib/logger';

/**
 * Simplified SessionWatchProvider - Monitors session state and handles logout
 *
 * This component:
 * - Monitors session state from NextAuth
 * - Handles logout cleanup when session is invalidated
 * - Prevents authentication loops
 */
function SessionWatchProvider({ children }) {
  const { data: session, status } = useSession();
  const dispatch = useDispatch();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [lastSessionCheck, setLastSessionCheck] = useState(null);

  // Ensure client-side only execution
  useEffect(() => {
    setIsClient(true);
  }, []);
  // Simplified session end handler
  const handleSessionEnd = useCallback(async () => {
    if (!isClient) return;

    logger.info('Handling session end - performing cleanup');

    try {
      // Perform comprehensive cleanup
      await performComprehensiveLogout(dispatch);

      // Only redirect if not already on login page
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login')) {
        // Check if we're in an organization context
        const orgSlugMatch = currentPath.match(/^\/org\/([^/]+)/);
        if (orgSlugMatch && orgSlugMatch[1]) {
          const orgSlug = orgSlugMatch[1];
          logger.info(
            `Redirecting to organization login: /org/${orgSlug}/login`,
          );
          router.push(`/org/${orgSlug}/login?expired=true`);
        } else {
          logger.info('Redirecting to user login');
          router.push('/user/login?expired=true');
        }
      }
    } catch (error) {
      logger.error('Error during session cleanup:', error);
      // Fallback: force navigation to appropriate login
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login')) {
        const orgSlugMatch = currentPath.match(/^\/org\/([^/]+)/);
        if (orgSlugMatch && orgSlugMatch[1]) {
          window.location.href = `/org/${orgSlugMatch[1]}/login?expired=true`;
        } else {
          window.location.href = '/user/login?expired=true';
        }
      }
    }
  }, [dispatch, router, isClient]);

  // Simplified session monitoring - only act on clear state changes
  useEffect(() => {
    if (!isClient) return;

    // Do not update session fingerprint while NextAuth is in transient 'loading' state.
    // NextAuth emits authenticated -> loading -> unauthenticated during sign-out which would
    // otherwise overwrite the authenticated fingerprint and prevent cleanup handlers from running.
    if (status === 'loading') return;

    // Note: For hasAccessToken to be meaningful, NextAuth must copy the
    // provider token into the session object (e.g. in callbacks.session):
    // session.accessToken = token.accessToken
    // Without this, !!session?.accessToken will always be false.
    const currentSessionState = {
      status,
      userId: session?.user?.id || null,
      hasAccessToken: !!session?.accessToken,
    };

    const sessionStateKey = `${status}-${currentSessionState.userId}-${currentSessionState.hasAccessToken}`;

    // Avoid duplicate processing
    if (lastSessionCheck === sessionStateKey) {
      return;
    }

    // Only handle explicit session termination or errors
    if (
      status === 'unauthenticated' &&
      lastSessionCheck !== null &&
      lastSessionCheck.startsWith('authenticated-')
    ) {
      logger.info('Session became unauthenticated - performing cleanup');
      handleSessionEnd();
    }

    // Update fingerprint after handling unauthenticated transition so we don't clobber the previous state
    setLastSessionCheck(sessionStateKey);
  }, [
    status,
    session?.user?.id,
    session?.accessToken,
    isClient,
    lastSessionCheck,
    handleSessionEnd,
  ]);

  // Don't render anything, this is just a service component
  return children;
}

export default SessionWatchProvider;
