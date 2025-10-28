'use client';

import { SessionProvider, useSession, getSession } from 'next-auth/react';
import { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSelector } from 'react-redux';
import { LoadingOverlay } from '@/shared/components/ui/loading-overlay';
import { UserDataFetcher } from './UserDataFetcher';
import { selectActiveGroup } from '@/shared/store/selectors';
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
  '/user/creation/individual/interest',
  '/user/forgotPwd',
  '/user/forgotPwd/reset',
];

function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const activeGroup = useSelector(selectActiveGroup);
  const logout = useLogout();
  const [hasLoggedOutForExpiration, setHasLoggedOutForExpiration] =
    useState(false);

  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  // Listen for unauthorized events from API client
  const handleUnauthorized = useCallback(async () => {
    // Check if session is expired before logging out
    try {
      await update();

      // Get fresh session data
      const freshSession = await getSession();
      if (freshSession && freshSession.user) {
        console.log(
          '401 received but session is valid - likely permissions issue'
        );
        return;
      }

      // Session is expired, logout
      console.log('Session expired, logging out...');
      toast.error(
        'Session Expired',
        'Your session has expired. Please log in again.',
        5000
      );
      logout();
    } catch (error) {
      console.error('Error handling unauthorized event:', error);
      logout();
    }
  }, [logout, update]);

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
    }
  }, [status]);

  // Logout when status becomes unauthenticated on protected routes
  useEffect(() => {
    if (
      status === 'unauthenticated' &&
      !isAuthRoute &&
      !hasLoggedOutForExpiration
    ) {
      console.log('Status unauthenticated on protected route, logging out');
      setHasLoggedOutForExpiration(true);
      logout();
    }
  }, [status, isAuthRoute, logout, hasLoggedOutForExpiration]);

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
