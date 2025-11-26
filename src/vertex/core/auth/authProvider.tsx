"use client";

import { useEffect, useMemo, useRef, useCallback, useState } from 'react';
import { useSession, SessionProvider, getSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAppSelector, useAppDispatch } from '@/core/redux/hooks';
import {
  setUserDetails,
  setActiveNetwork,
  setActiveGroup,
  setAvailableNetworks,
  setUserGroups,
  setInitialized,
  logout as logoutAction,
  setUserContext,
} from '@/core/redux/slices/userSlice';
import { users } from '@/core/apis/users';
import { getApiErrorMessage } from '@/core/utils/getApiErrorMessage';
import ReusableToast from '@/components/shared/toast/ReusableToast';
import SessionLoadingState from '@/components/layout/loading/session-loading';
import type {
  Network,
  Group,
  UserDetailsResponse,
  UserDetails,
} from '@/app/types/users';
import { ExtendedSession } from '../utils/secureApiProxyClient';
import { useLogout } from '@/core/hooks/useLogout';
import logger from '@/lib/logger';

// --- Helper Functions ---

function filterGroupsAndNetworks(
  userInfo: UserDetails
): { groups: Group[]; networks: Network[] } {
  const isAirQoStaff = !!userInfo.email?.endsWith('@airqo.net');
  if (isAirQoStaff) {
    return {
      groups: userInfo.groups || [],
      networks: userInfo.networks || [],
    };
  }

  const filteredGroups = (userInfo.groups || []).filter(
    (group) => group.grp_title.toLowerCase() !== 'airqo'
  );
  const filteredNetworks = (userInfo.networks || []).filter(
    (network) => network.net_name.toLowerCase() !== 'airqo'
  );

  return { groups: filteredGroups, networks: filteredNetworks };
}

function determineInitialUserSetup(
  userInfo: UserDetails,
  filteredGroups: Group[],
  filteredNetworks: Network[],
  userContext: 'personal' | 'airqo-internal' | 'external-org' | null,
  activeGroup: Group | null,
): {
  defaultNetwork?: Network;
  defaultGroup?: Group;
  initialUserContext: 'personal' | 'airqo-internal' | 'external-org';
} {
  const isAirQoStaff = !!userInfo.email?.endsWith('@airqo.net');
  const isManualPersonalMode = userContext === 'personal' && !activeGroup;

  if (isManualPersonalMode) {
    return { initialUserContext: 'personal' };
  }

  let defaultGroup: Group | undefined;
  let defaultNetwork: Network | undefined;

  if (activeGroup) {
    if (filteredGroups.some((g) => g._id === activeGroup._id)) {
      defaultGroup = activeGroup;
    }
  }

  if (!defaultGroup) {
    if (isAirQoStaff) {
      defaultGroup = filteredGroups.find((g) => g.grp_title.toLowerCase() === 'airqo') || filteredGroups[0];
    } else {
      defaultGroup = filteredGroups[0];
    }
  }

  if (defaultGroup && filteredNetworks.length > 0) {
    const groupTitle = defaultGroup.grp_title.toLowerCase();
    defaultNetwork = filteredNetworks.find((n) => n.net_name.toLowerCase() === groupTitle) || filteredNetworks[0];
  }

  let initialUserContext: 'personal' | 'airqo-internal' | 'external-org' = 'personal';
  if (defaultGroup) {
    initialUserContext = defaultGroup.grp_title.toLowerCase() === 'airqo' && isAirQoStaff ? 'airqo-internal' : 'external-org';
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
      logger.warn('[OnlineStatus] Connection lost');
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
 * Hook to fetch user details - only when online
 */
function useUserDetails(userId: string | null, isOnline: boolean) {
  return useQuery<UserDetailsResponse, Error>({
    queryKey: ['userDetails', userId],
    queryFn: () => users.getUserDetails(userId!),
    enabled: !!userId && isOnline, // Only fetch when online
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: true, // Auto-refetch when connection restored
  });
}

// --- Components ---

const authRoutes = ['/login', '/forgot-password'];

/**
 * Redirects authenticated users away from auth routes
 */
function ActiveGroupGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { status } = useSession();
  const { activeGroup, isInitialized } = useAppSelector((state) => state.user);

  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  useEffect(() => {
    if (status === 'authenticated' && isAuthRoute && activeGroup && isInitialized) {
      logger.debug('[ActiveGroupGuard] Redirecting authenticated user to /home');
      router.push('/home');
    }
  }, [status, isAuthRoute, activeGroup, isInitialized, router]);

  return <>{children}</>;
}

/**
 * Fetches user data in background without blocking render
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

  // Memoize userId
  const userId = useMemo(() => {
    return session?.user && 'id' in session.user
      ? (session.user as { id: string }).id
      : null;
  }, [session?.user]);

  // Fetch user details (only when online)
  const { data, error, isLoading } = useUserDetails(userId, isOnline);

  // Track refs for change detection
  const prevUserIdRef = useRef(userId);
  const prevDataRef = useRef(data);
  const hasShownOfflineToastRef = useRef(false);
  const hasLoggedOutForNoGroupRef = useRef(false);

  // Clear user data when userId changes (user switch)
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

  // Handle offline state with cached data
  useEffect(() => {
    if (!isOnline && cachedUser && userId && !isInitialized) {
      logger.info('[UserDataFetcher] Offline - using cached user data');
      dispatch(setInitialized());
      
      if (!hasShownOfflineToastRef.current) {
        hasShownOfflineToastRef.current = true;
      }
    }

    // Reset toast flag when back online
    if (isOnline && hasShownOfflineToastRef.current) {
      hasShownOfflineToastRef.current = false;
    }
  }, [isOnline, cachedUser, userId, isInitialized, dispatch]);

  // Handle errors
  useEffect(() => {
    if (!error) return;

    // Offline errors are expected - don't show error toast
    if (!isOnline) {
      logger.info('[UserDataFetcher] Query failed while offline (expected)');
      return;
    }

    // Real error while online
    logger.error('[UserDataFetcher] Error fetching user details', {
      error: getApiErrorMessage(error),
    });

    // If we have cached data, inform user we're using it
    if (cachedUser) {
      
    } else {
      ReusableToast({
        message: `Could not load user details: ${getApiErrorMessage(error)}`,
        type: 'WARNING',
      });
    }
  }, [error, isOnline, cachedUser]);

  // Handle successful data fetching
  useEffect(() => {
    const prevData = prevDataRef.current;
    prevDataRef.current = data;

    // Skip if data hasn't changed
    if (data === prevData) {
      return;
    }

    if (!data?.users || data.users.length === 0) {
      logger.warn('[UserDataFetcher] Data received but no users found');
      return;
    }

    const userInfo = data.users[0] as UserDetails;
    if (!userInfo) {
      return;
    }

    logger.info('[UserDataFetcher] Updating user data in Redux');

    const { groups: filteredGroups, networks: filteredNetworks } = 
      filterGroupsAndNetworks(userInfo);
    const { defaultGroup, defaultNetwork, initialUserContext } = 
      determineInitialUserSetup(
        userInfo,
        filteredGroups,
        filteredNetworks,
        userContext,
        activeGroup
      );

    // Update Redux store
    dispatch(setUserDetails(userInfo));
    dispatch(setUserGroups(filteredGroups));
    dispatch(setAvailableNetworks(filteredNetworks));

    if (defaultNetwork) {
      dispatch(setActiveNetwork(defaultNetwork));
    }
    dispatch(setActiveGroup(defaultGroup || null));
    dispatch(setUserContext(initialUserContext));

    if (!isInitialized) {
      dispatch(setInitialized());
    }
  }, [data, dispatch, isInitialized, userContext, activeGroup]);

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
        logger.warn(
          '[UserDataFetcher] User has no groups and is not in personal mode, logging out',
          { userContext }
        );
        hasLoggedOutForNoGroupRef.current = true;
        logout();
      }
    }
  }, [activeGroup, cachedUser, logout, isLoading, isInitialized, userContext, isLoggingOut]);

  // CRITICAL: Always render children - don't block on loading
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

  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Handle unauthorized/expired token events
  const handleUnauthorized = useCallback(async () => {
    if (isAuthRoute) return;
    if (hasHandledUnauthorized) return;
    if (isLoggingOut) return;

    logger.warn('[AuthWrapper] Handling unauthorized event');

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
          logger.warn(
            '[AuthWrapper] Multiple 401s with valid session - possible account deletion'
          );
          setHasHandledUnauthorized(true);
          ReusableToast({
            message: 'Your access has been revoked. Please log in again.',
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
      logger.warn('[AuthWrapper] Session expired, logging out');
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
  }, [logout, update, isAuthRoute, hasHandledUnauthorized, isLoggingOut]);

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
    } else if (status === 'unauthenticated' && !isAuthRoute && !isLoggingOut) {
      logger.debug('[AuthWrapper] Unauthenticated user on protected route, redirecting to /login');
      router.push('/login');
    }
  }, [status, isAuthRoute, router, isLoggingOut]);

  // Only block render while NextAuth is initializing
  if (status === 'loading') {
    return <SessionLoadingState />;
  }

  // For auth routes, wrap in ActiveGroupGuard
  if (isAuthRoute) {
    return <ActiveGroupGuard>{children}</ActiveGroupGuard>;
  }

  // For protected routes without session, show loading while redirecting
  if (!session) {
    return <SessionLoadingState />;
  }

  // Render app with background data fetching
  return <UserDataFetcher>{children}</UserDataFetcher>;
}

/**
 * Main AuthProvider component
 */
export function AuthProvider({
  children,
  session,
}: {
  children: React.ReactNode;
  session?: ExtendedSession;
}) {
  return (
    <SessionProvider session={session} refetchOnWindowFocus={false} refetchInterval={0}>
      <AuthWrapper>{children}</AuthWrapper>
    </SessionProvider>
  );
}