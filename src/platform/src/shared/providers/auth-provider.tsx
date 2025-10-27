'use client';

import { SessionProvider, useSession } from 'next-auth/react';
import { useEffect } from 'react';
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
        // Check if accessing the correct org
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

  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  // Listen for unauthorized events from API client
  useEffect(() => {
    const handleUnauthorized = async () => {
      // Check if session is expired before logging out
      try {
        await update();

        // If session is still valid after update, it's likely a permissions issue
        if (status === 'authenticated' && session) {
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
        // If update fails, assume session is invalid and logout
        logout();
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('auth:unauthorized', handleUnauthorized);
      return () =>
        window.removeEventListener('auth:unauthorized', handleUnauthorized);
    }
  }, [logout, update, status, session]);

  // Periodic session validation - check every 5 minutes
  useEffect(() => {
    if (status !== 'authenticated') return;

    const interval = setInterval(
      async () => {
        try {
          // Force a session update to check if token is still valid
          await update();
        } catch (error) {
          console.error('Session validation failed:', error);
        }
      },
      5 * 60 * 1000
    ); // 5 minutes

    return () => clearInterval(interval);
  }, [status, update]);

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

  // While session is being fetched, show a loading overlay
  if (status === 'loading') {
    return <LoadingOverlay />;
  }

  // For auth routes, allow rendering even if unauthenticated
  if (isAuthRoute) {
    return <>{children}</>;
  }

  // For protected routes, require authentication
  if (!session) return null;

  return (
    <UserDataFetcher>
      <ActiveGroupGuard>{children}</ActiveGroupGuard>
    </UserDataFetcher>
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchOnWindowFocus={false}>
      <AuthWrapper>{children}</AuthWrapper>
    </SessionProvider>
  );
}
