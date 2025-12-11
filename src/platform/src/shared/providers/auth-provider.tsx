'use client';

import { SessionProvider, useSession, getSession } from 'next-auth/react';
import { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSelector } from 'react-redux';
import { LoadingOverlay } from '@/shared/components/ui/loading-overlay';
import { UserDataFetcher } from './UserDataFetcher';
import { selectActiveGroup, selectLoggingOut } from '@/shared/store/selectors';
import { useLogout } from '@/shared/hooks/useLogout';
import { toast } from '@/shared/components/ui/toast';

// Component to guard and redirect based on active group for all pages
function ActiveGroupGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const activeGroup = useSelector(selectActiveGroup);

  useEffect(() => {
    if (!activeGroup) return;

    const isUserPath = pathname.startsWith('/user/');
    const isOrgPath = pathname.startsWith('/org/');

    if (activeGroup.title.toLowerCase() === 'airqo') {
      // Airqo users should only access user paths
      if (isOrgPath) {
        router.push('/user/home');
      }
    } else {
      // Non-airqo users should only access their org paths
      if (isUserPath) {
        router.push(`/org/${activeGroup.organizationSlug}/dashboard`);
      } else if (isOrgPath) {
        const pathParts = pathname.split('/');
        if (
          pathParts.length >= 3 &&
          pathParts[2] !== activeGroup.organizationSlug
        ) {
          router.push(`/org/${activeGroup.organizationSlug}/dashboard`);
        }
      }
    }
  }, [activeGroup, pathname, router]);

  return <>{children}</>;
}

// Define auth routes that authenticated users should be redirected away from
const authRoutes = [
  '/user/login',
  '/user/creation/individual/register',
  '/user/creation/individual/verify-email',
  '/user/creation/individual/interest', // covers /user/creation/individual/interest/[id]/[token]
  '/user/forgotPwd',
  '/user/forgotPwd/reset',
];

function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const activeGroup = useSelector(selectActiveGroup);
  const isLoggingOut = useSelector(selectLoggingOut);
  const logout = useLogout();
  const [hasLoggedOutForExpiration, setHasLoggedOutForExpiration] =
    useState(false);
  const [hasHandledUnauthorized, setHasHandledUnauthorized] = useState(false);

  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  // Listen for unauthorized events from API client
  const handleUnauthorized = useCallback(
    async (event: Event) => {
      const customEvent = event as CustomEvent;
      const { url } = (customEvent.detail as { url?: string }) || {};

      // If it's the readings API or map readings API, don't logout - just log and return
      // This can happen when user doesn't have access to specific sites but is still logged in
      if (
        url?.startsWith('/devices/readings/recent') ||
        url?.startsWith('/devices/readings/map')
      ) {
        console.log(
          '401 on readings API - not logging out, likely permission issue for specific sites'
        );
        return;
      }

      // Don't handle unauthorized on auth routes (login, register, etc.)
      if (isAuthRoute) return;

      // Prevent multiple unauthorized handling
      if (hasHandledUnauthorized) return;

      // Don't handle if we're already logging out
      if (isLoggingOut) return;

      // Check if account was deleted (set by account deletion confirmation page)
      if (typeof window !== 'undefined') {
        const accountDeleted = localStorage.getItem('account_deleted');
        const deletionTimestamp = localStorage.getItem(
          'account_deleted_timestamp'
        );

        if (accountDeleted === 'true') {
          // Account was deleted, clear flags and logout immediately
          console.log('Account deletion detected, logging out...');
          setHasHandledUnauthorized(true);
          try {
            localStorage.removeItem('account_deleted');
            localStorage.removeItem('account_deleted_timestamp');
          } catch (error) {
            console.warn('Error clearing account deletion flags:', error);
          }
          toast.error(
            'Account Deleted',
            'Your account has been deleted. You have been logged out.',
            5000
          );
          logout();
          return;
        }

        // Check if deletion flag is recent (within last 5 minutes) to avoid stale flags
        if (deletionTimestamp) {
          const timestamp = parseInt(deletionTimestamp, 10);
          const now = Date.now();
          const fiveMinutes = 5 * 60 * 1000;

          if (now - timestamp > fiveMinutes) {
            // Clear stale deletion flags
            try {
              localStorage.removeItem('account_deleted');
              localStorage.removeItem('account_deleted_timestamp');
            } catch (error) {
              console.warn(
                'Error clearing stale account deletion flags:',
                error
              );
            }
          }
        }
      }

      // Check if session is expired before logging out
      try {
        await update();

        // Get fresh session data
        const freshSession = await getSession();
        if (freshSession && freshSession.user) {
          console.log(
            '401 received but session is valid - likely permissions issue or account deleted'
          );
          // If we get here and have made multiple 401 calls recently, it might be account deletion
          // Add a counter to detect potential account deletion scenario
          const unauthorizedCount = parseInt(
            localStorage.getItem('unauthorized_count') || '0',
            10
          );
          const lastUnauthorized = parseInt(
            localStorage.getItem('last_unauthorized') || '0',
            10
          );
          const now = Date.now();

          if (now - lastUnauthorized < 30000 && unauthorizedCount >= 2) {
            // 30 seconds, 3+ calls
            console.log(
              'Multiple 401s with valid session - possible account deletion, logging out...'
            );
            setHasHandledUnauthorized(true);
            toast.error(
              'Access Denied',
              'Your access has been revoked. Please log in again.',
              5000
            );
            logout();
            return;
          }

          // Update counters
          localStorage.setItem(
            'unauthorized_count',
            (unauthorizedCount + 1).toString()
          );
          localStorage.setItem('last_unauthorized', now.toString());

          return;
        }

        // Session is expired, logout
        console.log('Session expired, logging out...');
        setHasHandledUnauthorized(true);
        toast.error(
          'Session Expired',
          'Your session has expired. Please log in again.',
          5000
        );
        logout();
      } catch (error) {
        console.error('Error handling unauthorized event:', error);
        setHasHandledUnauthorized(true);
        logout();
      }
    },
    [logout, update, isAuthRoute, hasHandledUnauthorized, isLoggingOut]
  );

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('auth:unauthorized', handleUnauthorized);
      return () =>
        window.removeEventListener('auth:unauthorized', handleUnauthorized);
    }
  }, [handleUnauthorized]);

  // If authenticated and on an auth page, redirect based on active group
  useEffect(() => {
    if (status === 'authenticated' && isAuthRoute && activeGroup) {
      if (activeGroup.title.toLowerCase() === 'airqo') {
        router.push('/user/home');
      } else {
        router.push(`/org/${activeGroup.organizationSlug}/dashboard`);
      }
    }
  }, [status, isAuthRoute, activeGroup, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      setHasLoggedOutForExpiration(false);
      setHasHandledUnauthorized(false);
    }
  }, [status]);

  // Logout when status becomes unauthenticated on protected routes
  // But skip if we're already logging out or have handled unauthorized
  useEffect(() => {
    if (
      status === 'unauthenticated' &&
      !isAuthRoute &&
      !hasLoggedOutForExpiration &&
      !isLoggingOut &&
      !hasHandledUnauthorized
    ) {
      console.log('Status unauthenticated on protected route, logging out');
      setHasLoggedOutForExpiration(true);
      logout();
    }
  }, [
    status,
    isAuthRoute,
    logout,
    hasLoggedOutForExpiration,
    isLoggingOut,
    hasHandledUnauthorized,
  ]);

  // While session is being fetched, show a loading overlay
  if (status === 'loading') {
    return <LoadingOverlay />;
  }

  // For auth routes, allow rendering even if unauthenticated
  if (isAuthRoute) {
    return <>{children}</>;
  }

  // For protected routes, require authentication
  if (!session) {
    return <LoadingOverlay />;
  }

  return (
    <UserDataFetcher>
      <ActiveGroupGuard>{children}</ActiveGroupGuard>
    </UserDataFetcher>
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchOnWindowFocus={false} refetchInterval={0}>
      <AuthWrapper>{children}</AuthWrapper>
    </SessionProvider>
  );
}
