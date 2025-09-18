'use client';

import { useEffect, useCallback, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { startSessionWatch, stopSessionWatch } from '@/lib/sessionWatcher';
import { performComprehensiveLogout } from '@/lib/logoutUtils';
import logger from '@/lib/logger';

/**
 * SessionWatchProvider - Integrates session watcher with authentication
 *
 * This component:
 * - Monitors JWT token expiry
 * - Handles logout 1 minute before token expires
 * - Clears all caches and storage on logout
 * - Redirects to login with expired parameter
 */
function SessionWatchProvider({ children }) {
  const { data: session, status } = useSession();
  const dispatch = useDispatch();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  // Ensure client-side only execution
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Comprehensive logout function that clears everything
  const handleSessionExpiry = useCallback(async () => {
    if (!isClient) return; // Prevent SSR execution

    logger.info('Session expired, performing comprehensive logout');

    try {
      // 1. Perform comprehensive cleanup
      await performComprehensiveLogout(dispatch);

      // 2. Sign out from NextAuth (disable redirect to prevent loops)
      await signOut({ redirect: false });

      // 3. Redirect to login with expired parameter
      router.push('/user/login?expired=true');
    } catch (error) {
      logger.error('Error during session expiry cleanup:', error);
      // Fallback: force navigation to login
      router.push('/user/login?expired=true');
    }
  }, [dispatch, router, isClient]);

  // Start/stop session watcher based on authentication status
  useEffect(() => {
    if (!isClient) return; // Prevent SSR execution

    if (status === 'authenticated' && session?.accessToken) {
      // Start session watcher with the JWT token
      startSessionWatch(session.accessToken, handleSessionExpiry);
      logger.debug('Session watcher started for authenticated user');
    } else if (status === 'unauthenticated') {
      // Stop session watcher for unauthenticated users
      stopSessionWatch();
      logger.debug('Session watcher stopped for unauthenticated user');
    }

    // Cleanup on unmount
    return () => {
      stopSessionWatch();
    };
  }, [status, session?.accessToken, handleSessionExpiry, isClient]);

  // Don't render anything, this is just a service component
  return children;
}

export default SessionWatchProvider;
