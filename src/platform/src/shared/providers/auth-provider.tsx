'use client';

import { SessionProvider, useSession, getSession } from 'next-auth/react';
import { useEffect, useRef, useCallback, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import { LoadingOverlay } from '@/shared/components/ui/loading-overlay';
import { UserDataFetcher } from './UserDataFetcher';
import { selectActiveGroup, selectLoggingOut } from '@/shared/store/selectors';
import { useLogout } from '@/shared/hooks/useLogout';
import { toast } from '@/shared/components/ui/toast';
import logger from '@/shared/lib/logger';
import { SWRProvider } from '@/shared/providers/swr-provider';
import { QueryProvider } from '@/shared/providers/query-provider';
import { runClientCacheMaintenance } from '@/shared/lib/clientCache';
import { normalizeCallbackUrl } from '@/shared/lib/auth-redirect';
import {
  clearBackendOAuthSignedOutFlag,
  buildSessionFromProfile,
  type BackendOAuthSession,
  shouldSkipBackendOAuthBootstrap,
  verifyBackendOAuthSession,
} from '@/shared/lib/oauth-session';

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

// Define public routes that don't require authentication
const publicRoutes = [
  '/user/login',
  '/user/creation/individual/register',
  '/user/creation/individual/verify-email',
  '/user/creation/individual/interest', // covers /user/creation/individual/interest/[id]/[token]
  '/user/forgotPwd',
  '/user/forgotPwd/reset',
  '/user/delete/confirm', // covers /user/delete/confirm/[token]
  '/user/oauth',
  '/org-invite', // Public invitation acceptance page
];

const isPublicAuthRoute = (pathname: string): boolean =>
  publicRoutes.some(route => pathname.startsWith(route)) ||
  /^\/org\/[^/]+\/(login|register)$/.test(pathname);

const UNAUTHORIZED_WINDOW_MS = 30000;
const UNAUTHORIZED_THRESHOLD = 3;
const ACCOUNT_DELETION_TTL_MS = 5 * 60 * 1000;
const ACCOUNT_DELETION_USER_IDENTIFIER_KEY = 'account_deleted_user_identifier';

const getSessionCacheScope = (session: unknown): string | null => {
  const user = (session as { user?: { _id?: string; email?: string } })?.user;
  const userId = typeof user?._id === 'string' ? user._id.trim() : '';
  if (userId) {
    return `id:${userId}`;
  }

  const email =
    typeof user?.email === 'string' ? user.email.trim().toLowerCase() : '';
  if (email) {
    return `email:${email}`;
  }

  return null;
};

function AuthScopedCacheProviders({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const cacheScope = getSessionCacheScope(session);
  const enablePersistence = status === 'authenticated' && !!cacheScope;
  const providerKey = `${status}:${cacheScope ?? 'anon'}`;

  return (
    <SWRProvider
      key={`swr:${providerKey}`}
      scopeKey={cacheScope}
      enablePersistence={enablePersistence}
    >
      <QueryProvider
        key={`query:${providerKey}`}
        scopeKey={cacheScope}
        enablePersistence={enablePersistence}
      >
        {children}
      </QueryProvider>
    </SWRProvider>
  );
}

function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeGroup = useSelector(selectActiveGroup);
  const isLoggingOut = useSelector(selectLoggingOut);
  const isHandlingUnauthorizedRef = useRef(false);
  const hasHandledUnauthorizedRef = useRef(false);
  const hasStartedLogoutRef = useRef(false);
  const unauthorizedStatsRef = useRef({ count: 0, lastAt: 0 });

  const isPublicRoute = isPublicAuthRoute(pathname);
  const callbackUrl = normalizeCallbackUrl(searchParams.get('callbackUrl'));
  const currentProtectedPath = searchParams.toString()
    ? `${pathname}?${searchParams.toString()}`
    : pathname;
  const protectedRouteLoginUrl = `/user/login?callbackUrl=${encodeURIComponent(currentProtectedPath)}`;
  const logout = useLogout(protectedRouteLoginUrl);

  const clearAccountDeletionFlags = useCallback(() => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem('account_deleted');
      localStorage.removeItem('account_deleted_timestamp');
      localStorage.removeItem(ACCOUNT_DELETION_USER_IDENTIFIER_KEY);
    } catch (error) {
      console.warn('Error clearing account deletion flags:', error);
    }
  }, []);

  const getCurrentSessionUserIdentifier = useCallback((): string | null => {
    const currentUser = session?.user as
      | { _id?: string; email?: string }
      | undefined;
    const userId =
      typeof currentUser?._id === 'string' ? currentUser._id.trim() : '';
    if (userId) {
      return `id:${userId}`;
    }

    const email =
      typeof currentUser?.email === 'string'
        ? currentUser.email.trim().toLowerCase()
        : '';
    if (email) {
      return `email:${email}`;
    }

    return null;
  }, [session?.user]);

  const resetUnauthorizedTracking = useCallback(() => {
    unauthorizedStatsRef.current = { count: 0, lastAt: 0 };
    hasHandledUnauthorizedRef.current = false;
    isHandlingUnauthorizedRef.current = false;
    hasStartedLogoutRef.current = false;
  }, []);

  const executeLogout = useCallback(
    async (toastConfig?: {
      title: string;
      description: string;
      duration?: number;
    }) => {
      if (hasStartedLogoutRef.current || isLoggingOut) {
        return;
      }

      hasStartedLogoutRef.current = true;
      hasHandledUnauthorizedRef.current = true;

      if (toastConfig) {
        toast.error(
          toastConfig.title,
          toastConfig.description,
          toastConfig.duration
        );
      }

      await logout();
    },
    [isLoggingOut, logout]
  );

  const checkAccountDeletionFlag = useCallback((): boolean => {
    if (typeof window === 'undefined') return false;

    const accountDeleted = localStorage.getItem('account_deleted');
    const deletionTimestamp = localStorage.getItem('account_deleted_timestamp');
    const deletionUserIdentifier = localStorage.getItem(
      ACCOUNT_DELETION_USER_IDENTIFIER_KEY
    );
    const parsedTimestamp = deletionTimestamp
      ? Number.parseInt(deletionTimestamp, 10)
      : NaN;
    const hasValidTimestamp = Number.isFinite(parsedTimestamp);
    const now = Date.now();

    if (accountDeleted === 'true') {
      if (!hasValidTimestamp) {
        clearAccountDeletionFlags();
        return false;
      }

      if (now - parsedTimestamp > ACCOUNT_DELETION_TTL_MS) {
        clearAccountDeletionFlags();
        return false;
      }

      const currentUserIdentifier = getCurrentSessionUserIdentifier();
      if (
        !deletionUserIdentifier ||
        !currentUserIdentifier ||
        deletionUserIdentifier !== currentUserIdentifier
      ) {
        logger.warn(
          'Ignoring stale account deletion flag due to missing or mismatched user identifier'
        );
        clearAccountDeletionFlags();
        return false;
      }

      logger.info('Account deletion detected, logging out...');
      executeLogout({
        title: 'Account Deleted',
        description: 'Your account has been deleted. You have been logged out.',
        duration: 5000,
      });
      return true;
    }

    if (hasValidTimestamp && now - parsedTimestamp > ACCOUNT_DELETION_TTL_MS) {
      clearAccountDeletionFlags();
    }

    return false;
  }, [
    clearAccountDeletionFlags,
    executeLogout,
    getCurrentSessionUserIdentifier,
  ]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'account_deleted' && event.newValue === 'true') {
        checkAccountDeletionFlag();
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [checkAccountDeletionFlag]);

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
        logger.info(
          '401 on readings API - not logging out, likely permission issue for specific sites'
        );
        return;
      }

      // Don't handle unauthorized on public routes (login, register, etc.)
      if (isPublicRoute) return;

      // Don't handle if we're already logging out
      if (isLoggingOut) return;

      // Prevent storms caused by concurrent 401 responses.
      if (
        hasHandledUnauthorizedRef.current ||
        isHandlingUnauthorizedRef.current
      )
        return;
      isHandlingUnauthorizedRef.current = true;

      try {
        if (checkAccountDeletionFlag()) {
          return;
        }

        // Check if session is expired before logging out.
        await update();

        const freshSession = await getSession();
        if (freshSession && freshSession.user) {
          logger.warn(
            '401 received but session is valid - likely permissions issue or account deleted'
          );

          const now = Date.now();
          const lastAt = unauthorizedStatsRef.current.lastAt;
          const withinWindow = now - lastAt < UNAUTHORIZED_WINDOW_MS;
          unauthorizedStatsRef.current.count = withinWindow
            ? unauthorizedStatsRef.current.count + 1
            : 1;
          unauthorizedStatsRef.current.lastAt = now;

          if (unauthorizedStatsRef.current.count >= UNAUTHORIZED_THRESHOLD) {
            logger.warn(
              'Multiple 401s with valid session - possible account deletion, logging out...'
            );
            executeLogout({
              title: 'Access Denied',
              description: 'Your access has been revoked. Please log in again.',
              duration: 5000,
            });
          }
          return;
        }

        // Session is expired.
        logger.info('Session expired, logging out...');
        executeLogout({
          title: 'Session Expired',
          description: 'Your session has expired. Please log in again.',
          duration: 5000,
        });
      } catch (error) {
        console.error('Error handling unauthorized event:', error);
        executeLogout();
      } finally {
        isHandlingUnauthorizedRef.current = false;
      }
    },
    [
      checkAccountDeletionFlag,
      executeLogout,
      isLoggingOut,
      isPublicRoute,
      update,
    ]
  );

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('auth:unauthorized', handleUnauthorized);
      return () =>
        window.removeEventListener('auth:unauthorized', handleUnauthorized);
    }
  }, [handleUnauthorized]);

  // If authenticated and on a public page (except org-invite), redirect based on active group
  // Note: /org-invite should be accessible to both authenticated and unauthenticated users
  useEffect(() => {
    if (status === 'authenticated' && isPublicRoute && activeGroup) {
      // Allow /org-invite to be accessed by authenticated users
      if (pathname.startsWith('/org-invite')) return;

      if (callbackUrl) {
        router.replace(callbackUrl);
        return;
      }

      if (activeGroup.title.toLowerCase() === 'airqo') {
        router.replace('/user/home');
      } else {
        router.replace(`/org/${activeGroup.organizationSlug}/dashboard`);
      }
    }
  }, [status, isPublicRoute, activeGroup, router, pathname, callbackUrl]);

  useEffect(() => {
    if (status === 'authenticated') {
      resetUnauthorizedTracking();
    }
  }, [resetUnauthorizedTracking, status]);

  // Logout when status becomes unauthenticated on protected routes
  // But skip if we're already logging out or if logout has already started.
  useEffect(() => {
    if (
      status === 'unauthenticated' &&
      !isPublicRoute &&
      !isLoggingOut &&
      !hasStartedLogoutRef.current
    ) {
      logger.info('Status unauthenticated on protected route, logging out');
      hasStartedLogoutRef.current = true;
      logout();
    }
  }, [status, isPublicRoute, logout, isLoggingOut, protectedRouteLoginUrl]);

  // While session is being fetched, show a loading overlay
  // Exception: For public routes, don't show loading overlay (let them render immediately)
  if (status === 'loading' && !isPublicRoute) {
    return <LoadingOverlay />;
  }

  // For public routes, allow rendering even if unauthenticated
  if (isPublicRoute) {
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
  const pathname = usePathname();
  const isPublicRoute = isPublicAuthRoute(pathname);
  const isOAuthCallbackRoute = pathname.startsWith('/user/oauth');
  const shouldRenderImmediately = isPublicRoute && !isOAuthCallbackRoute;
  const [bootstrapSession, setBootstrapSession] = useState<
    BackendOAuthSession | null | undefined
  >(shouldRenderImmediately ? null : undefined);

  useEffect(() => {
    runClientCacheMaintenance();
  }, []);

  useEffect(() => {
    let isMounted = true;
    const currentPathname =
      typeof window !== 'undefined' ? window.location.pathname : '';
    const isCurrentOAuthCallbackRoute =
      currentPathname.startsWith('/user/oauth');
    const isCurrentPublicRoute =
      isPublicAuthRoute(currentPathname) && !isCurrentOAuthCallbackRoute;

    const bootstrap = async () => {
      try {
        if (isCurrentPublicRoute) {
          const nextAuthSession = await getSession();
          if (!isMounted) return;

          if (shouldSkipBackendOAuthBootstrap()) {
            setBootstrapSession(null);
            return;
          }

          if (nextAuthSession?.user) {
            clearBackendOAuthSignedOutFlag();
            setBootstrapSession(nextAuthSession as BackendOAuthSession);
            return;
          }

          setBootstrapSession(null);
          return;
        }

        const nextAuthSession = await getSession();
        if (!isMounted) return;

        if (shouldSkipBackendOAuthBootstrap() && !isCurrentOAuthCallbackRoute) {
          setBootstrapSession(null);
          return;
        }

        if (nextAuthSession?.user) {
          if (
            shouldSkipBackendOAuthBootstrap() &&
            !isCurrentOAuthCallbackRoute
          ) {
            setBootstrapSession(null);
            return;
          }

          clearBackendOAuthSignedOutFlag();
          setBootstrapSession(nextAuthSession as BackendOAuthSession);
          return;
        }

        if (shouldSkipBackendOAuthBootstrap() && !isCurrentOAuthCallbackRoute) {
          setBootstrapSession(null);
          return;
        }

        const backendProfile = await verifyBackendOAuthSession();
        if (!isMounted) return;

        if (shouldSkipBackendOAuthBootstrap() && !isCurrentOAuthCallbackRoute) {
          setBootstrapSession(null);
          return;
        }

        if (backendProfile) {
          clearBackendOAuthSignedOutFlag();
          setBootstrapSession(buildSessionFromProfile(backendProfile));
          return;
        }

        setBootstrapSession(null);
      } catch (error) {
        if (!isMounted) return;

        logger.warn('Failed to bootstrap auth session', error);
        setBootstrapSession(null);
      }
    };

    void bootstrap();

    return () => {
      isMounted = false;
    };
  }, []);

  if (bootstrapSession === undefined) {
    return <LoadingOverlay />;
  }

  return (
    <SessionProvider
      session={bootstrapSession}
      refetchOnWindowFocus={false}
      refetchInterval={0}
    >
      <AuthScopedCacheProviders>
        <AuthWrapper>{children}</AuthWrapper>
      </AuthScopedCacheProviders>
    </SessionProvider>
  );
}
