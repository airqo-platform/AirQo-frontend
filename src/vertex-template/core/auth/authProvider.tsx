"use client";

import { useEffect, useMemo, useRef, useCallback, useState } from 'react';
import { useSession, SessionProvider, getSession, signIn } from 'next-auth/react';
import type { Session } from 'next-auth';
import { useRouter, usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAppSelector, useAppDispatch } from '@/core/redux/hooks';
import {
  logout as logoutAction,
  initializeUserData,
} from '@/core/redux/slices/userSlice';
import { users } from '@/core/apis/users';
import { getApiErrorMessage } from '@/core/utils/getApiErrorMessage';
import ReusableToast from '@/components/shared/toast/ReusableToast';
import SessionLoadingState from '@/components/layout/loading/session-loading';
import {
  getLastActiveGroupId,
  getLastActiveModule,
  setLastActiveGroupId,
} from '@/core/utils/userPreferences';
import type {
  Network,
  Group,
  UserDetailsResponse,
  UserDetails,
} from '@/app/types/users';
import { useLogout } from '@/core/hooks/useLogout';
import logger from '@/lib/logger';
import { consumeOAuthTokenHandoffFromUrl } from './oauth-session';
import { adapter } from '@/core/adapters';
import { isAuthDisabled, createMockSession } from './auth-mode';

// --- Helper Functions ---

function filterGroupsAndNetworks(
  userInfo: UserDetails
): { groups: Group[]; networks: Network[] } {
  // Return all groups and networks regardless of staff status
  // AirQo should be visible to all users as the default organization
  return {
    groups: userInfo.groups || [],
    networks: userInfo.networks || [],
  };
}

function determineInitialUserSetup(
  userInfo: UserDetails,
  filteredGroups: Group[],
  filteredNetworks: Network[],
  userContext: 'personal' | 'external-org' | null,

  activeGroup: Group | null,
  lastActiveGroupId: string | null,
): {
  defaultNetwork?: Network;
  defaultGroup?: Group;
  initialUserContext: 'personal' | 'external-org';
} {
  const isManualPersonalMode = userContext === 'personal' && !activeGroup;

  if (isManualPersonalMode) {
    const airqoGroup = filteredGroups.find((g) => g.grp_title.toLowerCase() === 'airqo');
    if (airqoGroup) {
      // Logic for manual personal mode
    } else {
      return { initialUserContext: 'personal' };
    }
  }

  let defaultGroup: Group | undefined;
  let defaultNetwork: Network | undefined;

  // 1. Try to restore from activeGroup (Redux state)
  if (activeGroup) {
    if (filteredGroups.some((g) => g._id === activeGroup._id)) {
      defaultGroup = activeGroup;
    }
  }

  // 2. Try to restore from lastActiveGroupId (Persistent User Preference)
  if (!defaultGroup && lastActiveGroupId) {
    const lastGroup = filteredGroups.find((g) => g._id === lastActiveGroupId);
    if (lastGroup) {
      defaultGroup = lastGroup;
    }
  }

  // 3. Fallback to AirQo or first available group
  if (!defaultGroup && !activeGroup) {
    defaultGroup = filteredGroups.find((g) => g.grp_title.toLowerCase() === 'airqo') || filteredGroups[0];
  } else if (!defaultGroup) {
    defaultGroup = filteredGroups[0];
  }

  if (defaultGroup && filteredNetworks.length > 0) {
    const groupTitle = defaultGroup.grp_title.toLowerCase();
    defaultNetwork = filteredNetworks.find((n) => n.net_name.toLowerCase() === groupTitle) || filteredNetworks[0];
  }

  let initialUserContext: 'personal' | 'external-org' = 'personal';
  if (defaultGroup) {
    if (defaultGroup.grp_title.toLowerCase() === 'airqo') {
      initialUserContext = 'personal';
    } else {
      initialUserContext = 'external-org';
    }
  }

  return { defaultGroup, defaultNetwork, initialUserContext };
}

// --- Custom Hooks ---

/**
 * Hook to detect online/offline status
 */
function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      logger.info('[OnlineStatus] Connection restored');
    };
    const handleOffline = () => {
      setIsOnline(false);
      logger.info('[OnlineStatus] Connection lost');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

/**
 * Hook to fetch user details with React Query v5 offline-first pattern
 */
function useUserDetails(userId: string | null) {
  const isDevelopment = process.env.NODE_ENV === 'development';

  return useQuery<UserDetailsResponse, Error>({
    queryKey: ['userDetails', userId],
    queryFn: () => users.getUserDetails(userId!),
    enabled: !!userId,
    networkMode: 'offlineFirst',
    retry: isDevelopment ? 0 : 1,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
}

// --- Components ---

const authRoutes = ['/login', '/auth-error'];
const publicRoutes = [...authRoutes, '/download'];
const matchesRoute = (pathname: string, route: string) =>
  pathname === route || pathname.startsWith(`${route}/`);

/**
 * Redirects authenticated users away from auth routes
 */
function ActiveGroupGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { status } = useSession();
  const { activeGroup, isInitialized } = useAppSelector((state) => state.user);

  const isAuthRoute = authRoutes.some((route) => matchesRoute(pathname, route));

  useEffect(() => {
    if (status === 'authenticated' && isAuthRoute && activeGroup && isInitialized) {
      logger.debug('[ActiveGroupGuard] Redirecting authenticated user to /home');
      router.push('/home');
    }
  }, [status, isAuthRoute, activeGroup, isInitialized, router]);

  return <>{children}</>;
}

/**
 * Fetches user data with true offline-first behavior
 */
function UserDataFetcher({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const dispatch = useAppDispatch();
  const isOnline = useOnlineStatus();
  const {
    activeGroup,
    isInitialized,
    userContext,
    userDetails: cachedUser,
  } = useAppSelector((state) => state.user);
  const logout = useLogout();
  const isLoggingOut = useAppSelector((state) => state.user.isLoggingOut);

  const userId = useMemo(() => {
    if (isLoggingOut) return null;
    return session?.user && 'id' in session.user
      ? (session.user as { id: string }).id
      : null;
  }, [session?.user, isLoggingOut]);

  // React Query handles offline-first behavior automatically
  const { data, error, isLoading, isError, fetchStatus } = useUserDetails(userId);

  const prevUserIdRef = useRef(userId);
  const prevDataRef = useRef(data);
  const hasShownOfflineToastRef = useRef(false);
  const hasLoggedOutForNoGroupRef = useRef(false);

  // Clear user data when userId changes
  useEffect(() => {
    const prevUserId = prevUserIdRef.current;
    prevUserIdRef.current = userId;

    if (userId !== prevUserId && prevUserId !== null) {
      logger.info('[UserDataFetcher] User ID changed, clearing state');
      dispatch(logoutAction());
      hasLoggedOutForNoGroupRef.current = false;
      hasShownOfflineToastRef.current = false;
    }
  }, [userId, dispatch]);

  // Show offline notification when appropriate
  useEffect(() => {
    if (!isOnline && !hasShownOfflineToastRef.current) {
      // Only show if we have cached data or are actively trying to fetch
      if (cachedUser || fetchStatus === 'fetching') {
        logger.info('[UserDataFetcher] Offline mode - using cached data');
        hasShownOfflineToastRef.current = true;

        if (cachedUser) {
          //do nothing 
        }
      }
    }

    // Reset toast flag when back online
    if (isOnline && hasShownOfflineToastRef.current) {
      hasShownOfflineToastRef.current = false;
      ReusableToast({
        message: 'Connection restored.',
        type: 'SUCCESS',
      });
    }
  }, [isOnline, cachedUser, fetchStatus]);

  // Handle errors (only real errors, not offline state)
  useEffect(() => {
    if (!isError || !error) return;

    logger.error('[UserDataFetcher] Error fetching user details', {
      error: getApiErrorMessage(error),
      isOnline,
      fetchStatus,
    });

    // Only show error if online and not just a network issue
    if (isOnline && fetchStatus === 'idle') {
      if (cachedUser) {
        // ignore
      } else {
        ReusableToast({
          message: `Could not load user details: ${getApiErrorMessage(error)}`,
          type: 'ERROR',
        });
      }
    }
  }, [isError, error, isOnline, cachedUser, fetchStatus]);

  // Handle successful data fetching
  useEffect(() => {
    const prevData = prevDataRef.current;
    prevDataRef.current = data;

    if (data === prevData) return;

    if (!data?.users || data.users.length === 0) {
      if (!isLoggingOut) {
        logger.info('[UserDataFetcher] Data received but no users found');
      }
      return;
    }

    const userInfo = data.users[0] as UserDetails;
    if (!userInfo) return;

    logger.info('[UserDataFetcher] Updating user data in Redux');

    const { groups: filteredGroups, networks: filteredNetworks } =
      filterGroupsAndNetworks(userInfo);
    const { defaultGroup, defaultNetwork, initialUserContext } =
      determineInitialUserSetup(
        userInfo,
        filteredGroups,
        filteredNetworks,
        userContext,
        activeGroup,
        getLastActiveGroupId(userInfo._id)
      );

    dispatch(initializeUserData({
      userDetails: userInfo,
      groups: filteredGroups,
      availableNetworks: filteredNetworks,
      activeGroup: defaultGroup || null,
      activeNetwork: defaultNetwork,
      userContext: initialUserContext,
    }));
  }, [data, dispatch, isInitialized, userContext, activeGroup]);

  // Persist the active group whenever it changes
  useEffect(() => {
    if (activeGroup?._id && cachedUser?._id) {
      setLastActiveGroupId(cachedUser._id, activeGroup._id);
    }
  }, [activeGroup, cachedUser]);

  // Check if user has no groups and should be logged out
  useEffect(() => {
    if (
      cachedUser &&
      !activeGroup &&
      !isLoading &&
      !hasLoggedOutForNoGroupRef.current &&
      isInitialized &&
      userContext !== 'personal' &&
      userContext !== null &&
      !isLoggingOut
    ) {
      const userGroups = cachedUser.groups || [];
      if (userGroups.length === 0) {
        logger.debug(
          '[UserDataFetcher] User has no groups and is not in personal mode, logging out',
          { userContext }
        );
        hasLoggedOutForNoGroupRef.current = true;
        logout();
      }
    }
  }, [activeGroup, cachedUser, logout, isLoading, isInitialized, userContext, isLoggingOut]);

  return <>{children}</>;
}

/**
 * Handles authentication routing and session management
 */
function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const isLoggingOut = useAppSelector((state) => state.user.isLoggingOut);
  const logout = useLogout();
  const [hasHandledUnauthorized, setHasHandledUnauthorized] = useState(false);

  const isAuthRoute = authRoutes.some((route) => matchesRoute(pathname, route));
  const isPublicRoute = publicRoutes.some((route) =>
    matchesRoute(pathname, route)
  );

  // Handle unauthorized/expired token events
  const handleUnauthorized = useCallback(async () => {
    if (isPublicRoute) return;
    if (hasHandledUnauthorized) return;
    if (isLoggingOut) return;

    logger.debug('[AuthWrapper] Handling unauthorized event');

    // Check for account deletion flag
    if (typeof window !== 'undefined') {
      const accountDeleted = localStorage.getItem('account_deleted');
      const deletionTimestamp = localStorage.getItem('account_deleted_timestamp');

      if (accountDeleted === 'true') {
        setHasHandledUnauthorized(true);
        try {
          localStorage.removeItem('account_deleted');
          localStorage.removeItem('account_deleted_timestamp');
        } catch {
          // Ignore storage errors
        }

        ReusableToast({
          message: 'Your account has been deleted. You have been logged out.',
          type: 'ERROR',
        });
        logout();
        return;
      }

      // Clean up old deletion timestamps
      if (deletionTimestamp) {
        const timestamp = parseInt(deletionTimestamp, 10);
        if (Date.now() - timestamp > 5 * 60 * 1000) {
          localStorage.removeItem('account_deleted');
          localStorage.removeItem('account_deleted_timestamp');
        }
      }
    }

    try {
      // Try to refresh session
      await update();
      const freshSession = await getSession();

      if (freshSession && freshSession.user) {
        // Session is valid - track 401s to detect account issues
        const unauthorizedCount = parseInt(
          localStorage.getItem('unauthorized_count') || '0',
          10
        );
        const lastUnauthorized = parseInt(
          localStorage.getItem('last_unauthorized') || '0',
          10
        );
        const now = Date.now();

        // Multiple 401s in short time = likely account deletion
        if (now - lastUnauthorized < 30000 && unauthorizedCount >= 2) {
          logger.info(
            '[AuthWrapper] Multiple 401s with valid session - possible account deletion'
          );
          setHasHandledUnauthorized(true);
          ReusableToast({
            message: 'Your session has expired. Please log in again.', // more user-friendly message
            type: 'ERROR',
          });
          logout();
          return;
        }

        localStorage.setItem('unauthorized_count', (unauthorizedCount + 1).toString());
        localStorage.setItem('last_unauthorized', now.toString());
        return;
      }

      // Session refresh failed - token expired
      logger.info('[AuthWrapper] Session expired, logging out');
      setHasHandledUnauthorized(true);
      ReusableToast({
        message: 'Your session has expired. Please log in again.',
        type: 'ERROR',
      });
      logout();
    } catch (error) {
      logger.error('[AuthWrapper] Error handling unauthorized event', { error });
      setHasHandledUnauthorized(true);
      logout();
    }
  }, [logout, update, isPublicRoute, hasHandledUnauthorized, isLoggingOut]);

  // Listen for auth token expiration events
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('auth-token-expired', handleUnauthorized as EventListener);
      return () =>
        window.removeEventListener('auth-token-expired', handleUnauthorized as EventListener);
    }
  }, [handleUnauthorized]);

  // Reset flags when authenticated
  useEffect(() => {
    if (status === 'authenticated') {
      setHasHandledUnauthorized(false);
    }
  }, [status]);

  // Handle routing based on auth status
  useEffect(() => {
    if (status === 'authenticated' && isAuthRoute) {
      logger.debug('[AuthWrapper] Authenticated user on auth route, redirecting to /home');
      router.push('/home');
    } else if (status === 'unauthenticated' && !isPublicRoute && !isLoggingOut) {
      logger.debug('[AuthWrapper] Unauthenticated user on protected route, redirecting to /login');
      router.push('/login');
    }
  }, [status, isAuthRoute, isPublicRoute, router, isLoggingOut]);

  // Check if we have a session from SSR or client fetch
  const hasSession = !!session;

  // Only block render if we are truly loading AND have no session data yet
  if (status === 'loading' && !hasSession) {
    return <SessionLoadingState />;
  }

  // For auth routes, wrap in ActiveGroupGuard
  if (isAuthRoute) {
    return <ActiveGroupGuard>{children}</ActiveGroupGuard>;
  }

  if (isPublicRoute) {
    return <>{children}</>;
  }

  // For protected routes without session, show loading while redirecting
  if (!session) {
    return <SessionLoadingState />;
  }

  // Render app with background data fetching
  return (
    <UserDataFetcher>
      <AutoLogoutHandler />
      {children}
    </UserDataFetcher>
  );
}

/**
 * Handles auto-logout on inactivity
 */
function AutoLogoutHandler() {
  const { data: session } = useSession();
  const logout = useLogout();
  const lastActivityRef = useRef(Date.now());
  const INACTIVITY_LIMIT = 6 * 60 * 60 * 1000; // 6 hours

  const updateActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  useEffect(() => {
    if (!session) return;

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove'];

    // Throttle event listeners to avoid performance impact
    let throttleTimer: NodeJS.Timeout | null = null;
    const handleActivity = () => {
      if (!throttleTimer) {
        updateActivity();
        throttleTimer = setTimeout(() => {
          throttleTimer = null;
        }, 1000);
      }
    };

    events.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    const intervalId = setInterval(() => {
      const timeSinceLastActivity = Date.now() - lastActivityRef.current;
      if (timeSinceLastActivity >= INACTIVITY_LIMIT) {
        logger.debug('[AutoLogoutHandler] User inactive for 6 hours, logging out');
        logout();
      }
    }, 60 * 1000); // Check every minute

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      clearInterval(intervalId);
      if (throttleTimer) clearTimeout(throttleTimer);
    };
  }, [session, logout, updateActivity, INACTIVITY_LIMIT]);

  return null;
}

/**
 * Component to handle the OAuth token handoff from the URL.
 * It detects the token, triggers signIn, and handles the redirection.
 */
function TokenHandoffHandler({ children }: { children: React.ReactNode }) {
  // Use a ref to capture the initial hash state so we don't rely on the mutable URL hash during re-renders
  const isHandlingOAuthRef = useRef(
    typeof window !== 'undefined' && window.location.hash.includes('token=')
  );
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const waitForSession = useCallback(async () => {
    const attempts = 8;
    const delayMs = 150;

    for (let attempt = 0; attempt < attempts; attempt += 1) {
      const session = await getSession();
      if (session?.user) {
        return session;
      }

      if (attempt < attempts - 1) {
        await new Promise<void>((resolve) => {
          window.setTimeout(resolve, delayMs);
        });
      }
    }

    return null;
  }, []);

  useEffect(() => {
    let shouldUnblock = true;
    const bootstrap = async () => {
      try {
        const handoff = consumeOAuthTokenHandoffFromUrl();
        if (handoff?.token) {
          logger.info('[TokenHandoffHandler] OAuth token detected, signing in...');

          const result = await signIn('credentials', {
            redirect: false,
            oauthToken: handoff.token,
            oauthProvider: handoff.provider || 'google',
          });

          if (result?.ok) {
            // Wait for session to be fully available before redirecting
            const session = await waitForSession();
            const email = session?.user?.email || '';
            
            // Priority: handoff.callbackUrl > lastActiveModule logic
            const lastModule = getLastActiveModule(email);
            const fallbackUrl = lastModule === 'admin' ? '/admin/networks' : '/home';
            const redirectUrl = handoff.callbackUrl || fallbackUrl;
            
            logger.info(`[TokenHandoffHandler] OAuth sign-in successful, redirecting to ${redirectUrl}`);
            
            const redirectPathname = redirectUrl.split('?')[0];
            const isSamePath = pathname === redirectPathname;

            if (isSamePath) {
              // We are already on the destination page (e.g., /home?success=google).
              // Use client-side routing to silently clean up the URL without a full page reload.
              router.replace(redirectUrl);
              // Allow the UI to unblock since we aren't unloading the document
            } else {
              // We are on a different page (e.g., /login).
              // Do a hard replace and keep the UI blocked until the page unloads to prevent flashing.
              shouldUnblock = false; // Prevent unblocking the UI while the browser redirects
              window.location.replace(redirectUrl);
              return; // window.location.replace will handle the rest
            }
          } else {
            logger.error('[TokenHandoffHandler] OAuth sign-in failed', { error: result?.error });
            router.push(`/auth-error?error=${encodeURIComponent(result?.error || 'OAuthSignin')}`);
          }
        }
      } catch (error) {
        logger.error('[TokenHandoffHandler] Error during bootstrap', { error });
      } finally {
        if (shouldUnblock) {
          setIsBootstrapping(false);
          isHandlingOAuthRef.current = false;
        }
      }
    };

    bootstrap();
  }, [router, pathname, waitForSession]);

  if (isBootstrapping && isHandlingOAuthRef.current) {
    return <SessionLoadingState />;
  }

  return <>{children}</>;
}

/**
 * Bootstraps the app when auth is disabled (auth.provider "none").
 * Loads the current user from the configured adapter, hydrates the
 * user store, and keeps auth-only routes out of reach.
 */
function NoAuthBootstrap({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { isInitialized, userContext, activeGroup } = useAppSelector(
    (state) => state.user
  );

  // Login/auth-error pages have no purpose without an auth provider.
  const isAuthRoute = authRoutes.some((route) => matchesRoute(pathname, route));
  useEffect(() => {
    if (isAuthRoute) {
      router.replace('/home');
    }
  }, [isAuthRoute, router]);

  useEffect(() => {
    if (isInitialized) return;
    let cancelled = false;

    adapter
      .getCurrentUser('current')
      .then((data: UserDetailsResponse) => {
        if (cancelled) return;

        const userInfo = data?.users?.[0];
        if (!userInfo) {
          logger.error('[NoAuthBootstrap] Adapter returned no current user');
          return;
        }

        const { groups, networks } = filterGroupsAndNetworks(userInfo);
        const { defaultGroup, defaultNetwork, initialUserContext } =
          determineInitialUserSetup(
            userInfo,
            groups,
            networks,
            userContext,
            activeGroup,
            getLastActiveGroupId(userInfo._id)
          );

        dispatch(
          initializeUserData({
            userDetails: userInfo,
            groups,
            availableNetworks: networks,
            activeGroup: defaultGroup || null,
            activeNetwork: defaultNetwork,
            userContext: initialUserContext,
          })
        );
      })
      .catch((error: unknown) => {
        logger.error('[NoAuthBootstrap] Failed to load current user', {
          error: getApiErrorMessage(error),
        });
      });

    return () => {
      cancelled = true;
    };
  }, [dispatch, isInitialized, userContext, activeGroup]);

  if (isAuthRoute) {
    return <SessionLoadingState />;
  }

  return <>{children}</>;
}

/**
 * Main AuthProvider component
 */
export function AuthProvider({
  children,
  session,
}: {
  children: React.ReactNode;
  session?: Session | null;
}) {
  if (isAuthDisabled) {
    // Keep SessionProvider so useSession() consumers work, but with a
    // static synthetic session: no token handoff, session refresh,
    // route protection, or auto-logout.
    return (
      <SessionProvider
        session={session ?? createMockSession()}
        refetchOnWindowFocus={false}
        refetchInterval={0}
      >
        <NoAuthBootstrap>{children}</NoAuthBootstrap>
      </SessionProvider>
    );
  }

  return (
    <SessionProvider session={session} refetchOnWindowFocus={false} refetchInterval={0}>
      <TokenHandoffHandler>
        <AuthWrapper>{children}</AuthWrapper>
      </TokenHandoffHandler>
    </SessionProvider>
  );
}
