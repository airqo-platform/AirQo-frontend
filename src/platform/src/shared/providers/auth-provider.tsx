'use client';

import { SessionProvider, useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSelector } from 'react-redux';
import { LoadingOverlay } from '@/shared/components/ui/loading-overlay';
import { UserDataFetcher } from './UserDataFetcher';
import { selectActiveGroup } from '@/shared/store/selectors';

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
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const activeGroup = useSelector(selectActiveGroup);

  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

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
