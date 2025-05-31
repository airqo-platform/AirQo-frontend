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
      // Sync the session data to Redux
      dispatch(setUserInfo(session.user));
      dispatch(setSuccess(true));

      // Also store in localStorage for persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem('userInfo', JSON.stringify(session.user));
        localStorage.setItem('isAuthenticated', 'true');
      }
    } else if (status === 'unauthenticated') {
      // User is not authenticated
      // Clear Redux state
      dispatch(resetStore());

      // Clear localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('userInfo');
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('activeGroup');
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
        // Use logger instead of console
        import('@/lib/logger').then((logger) => {
          logger.default.warn(
            'Authentication state mismatch detected, clearing Redux state',
          );
        });
        dispatch(resetStore());
      }
    }
  }, [reduxLoginState, status, dispatch]);

  // This component doesn't render anything, it just handles state synchronization
  return null;
};

export default AuthSync;
