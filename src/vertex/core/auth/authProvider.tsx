"use client";

import { useEffect, useMemo, useRef, useCallback, useState } from 'react';
import { useSession, SessionProvider, getSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
  setContextLoading,
} from '@/core/redux/slices/userSlice';
import { users } from '@/core/apis/users';
import { devices } from '@/core/apis/devices';
import { clearSessionData } from '@/core/utils/sessionManager';
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

function useUserDetails(userId: string | null) {
  return useQuery<UserDetailsResponse, Error>({
    queryKey: ['userDetails', userId],
    queryFn: () => users.getUserDetails(userId!),
    enabled: !!userId,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}



function usePrefetchData(
  userInfo: UserDetails | null,
  context: 'personal' | 'airqo-internal' | 'external-org' | null,
  group: Group | null,
  network: Network | null
) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userInfo || !context) return;

    const prefetch = async () => {
      try {
        if (context === 'personal') {
          await queryClient.prefetchQuery({
            queryKey: ['my-devices', userInfo._id],
            queryFn: () => devices.getMyDevices(userInfo._id),
            staleTime: 300_000,
          });
        } else if (group && network) {
          await queryClient.prefetchQuery({
            queryKey: ['devices', group.grp_title, { page: 1, limit: 100, search: undefined, sortBy: undefined, order: undefined }],
            queryFn: () => devices.getDevicesSummaryApi({ group: group.grp_title, limit: 100, skip: 0 }),
            staleTime: 300_000,
          });
        }
      } catch (error) {
        logger.error('[UserDataFetcher] Failed to prefetch device data', { error });
      }
    };

    prefetch();
  }, [userInfo, context, group, network, queryClient]);
}

// --- Components ---

const authRoutes = ['/login', '/forgot-password'];

function ActiveGroupGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { status } = useSession();
  const { activeGroup, isInitialized } = useAppSelector((state) => state.user);

  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  useEffect(() => {
    if (status === 'authenticated' && isAuthRoute && activeGroup && isInitialized) {
      logger.debug('[ActiveGroupGuard] Redirecting to /home');
      router.push('/home');
    }
  }, [status, isAuthRoute, activeGroup, isInitialized, router]);

  return <>{children}</>;
}

function UserDataFetcher({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const dispatch = useAppDispatch();
  const { activeGroup, isInitialized, userContext, userDetails: user } = useAppSelector((state) => state.user);
  const logout = useLogout();
  const isLoggingOut = useAppSelector((state) => state.user.isLoggingOut);

  // Memoize userId
  const userId = useMemo(() => {
    return session?.user && 'id' in session.user
      ? (session.user as { id: string }).id
      : null;
  }, [session?.user]);

  // Fetch user details
  const { data, error, isLoading } = useUserDetails(userId);

  // Clear user data when userId changes
  const prevUserIdRef = useRef(userId);
  useEffect(() => {
    const prevUserId = prevUserIdRef.current;
    prevUserIdRef.current = userId;

    if (userId !== prevUserId && userId) {
      dispatch(logoutAction());
      hasLoggedOutForNoGroupRef.current = false;
    }
  }, [userId, dispatch]);

  // Track previous values
  const prevStatusRef = useRef(status);
  const prevDataRef = useRef(data);
  const prevErrorRef = useRef(error);
  const prevIsLoadingRef = useRef(isLoading);
  const hasLoggedOutForNoGroupRef = useRef(false);

  // Handle status changes
  useEffect(() => {
    const prevStatus = prevStatusRef.current;
    prevStatusRef.current = status;

    if (status !== prevStatus) {
      if (status === 'unauthenticated' && !isLoggingOut) {
        dispatch(logoutAction());
      } else if (status === 'authenticated' && !isInitialized) {
        dispatch(setInitialized());
      }
    }
  }, [status, dispatch, isLoggingOut, isInitialized]);

  // Handle loading state
  useEffect(() => {
    const prevIsLoading = prevIsLoadingRef.current;
    prevIsLoadingRef.current = isLoading;

    if (isLoading !== prevIsLoading) {
      dispatch(setContextLoading(isLoading));
    }
  }, [isLoading, dispatch]);

  // Handle errors
  useEffect(() => {
    const prevError = prevErrorRef.current;
    prevErrorRef.current = error;

    if (error !== prevError && error) {
      logger.error('[UserDataFetcher] Error fetching user details', {
        error: getApiErrorMessage(error),
      });
      ReusableToast({
        message: `Could not load organization details: ${getApiErrorMessage(error)}`,
        type: 'WARNING',
      });
      dispatch(setContextLoading(false));
    }
  }, [error, dispatch]);

  // Handle successful data fetching
  useEffect(() => {
    const prevData = prevDataRef.current;
    prevDataRef.current = data;

    if (data === prevData || !data?.users || data.users.length === 0) {
      if (data !== prevData) {
        logger.warn('[UserDataFetcher] Data received but no users found');
        dispatch(setContextLoading(false));
      }
      return;
    }

    const userInfo = data.users[0] as UserDetails;
    if (!userInfo) {
      dispatch(setContextLoading(false));
      return;
    }

    const { groups: filteredGroups, networks: filteredNetworks } = filterGroupsAndNetworks(userInfo);
    const { defaultGroup, defaultNetwork, initialUserContext } = determineInitialUserSetup(
      userInfo,
      filteredGroups,
      filteredNetworks,
      userContext,
      activeGroup
    );

    // Batch updates where possible (Redux handles batching, but logical grouping helps)
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
    dispatch(setContextLoading(false));
  }, [data, dispatch, isInitialized, userContext, activeGroup]);

  // Check if user has no active group after data is loaded
  useEffect(() => {
    if (
      user &&
      !activeGroup &&
      !isLoading &&
      !hasLoggedOutForNoGroupRef.current &&
      isInitialized &&
      userContext !== 'personal' &&
      userContext !== null
    ) {
      // Only logout if we are sure we should have a group but don't
      // If userContext is personal, no group is expected.
      // If userContext is null, we might still be loading.
      const userGroups = user.groups || [];
      if (userGroups.length === 0) {
        logger.warn('[UserDataFetcher] User has no groups and is not in personal mode, logging out', { userContext });
        hasLoggedOutForNoGroupRef.current = true;
        logout();
      }
    }
  }, [activeGroup, user, logout, isLoading, isInitialized, userContext]);

  usePrefetchData(user, userContext, activeGroup, useAppSelector(state => state.user.activeNetwork));

  return <ActiveGroupGuard>{children}</ActiveGroupGuard>;
}

function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { data: session, status, update } = useSession();
  const pathname = usePathname();
  const isLoggingOut = useAppSelector((state) => state.user.isLoggingOut);
  const logout = useLogout();
  const [hasLoggedOutForExpiration, setHasLoggedOutForExpiration] = useState(false);
  const [hasHandledUnauthorized, setHasHandledUnauthorized] = useState(false);

  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  const handleUnauthorized = useCallback(async () => {
    if (isAuthRoute) return;
    if (hasHandledUnauthorized) return;
    if (isLoggingOut) return;

    // Check for account deletion flag
    if (typeof window !== 'undefined') {
      const accountDeleted = localStorage.getItem('account_deleted');
      const deletionTimestamp = localStorage.getItem('account_deleted_timestamp');

      if (accountDeleted === 'true') {
        setHasHandledUnauthorized(true);
        try {
          localStorage.removeItem('account_deleted');
          localStorage.removeItem('account_deleted_timestamp');
        } catch (e) { /* ignore */ }

        ReusableToast({
          message: 'Your account has been deleted. You have been logged out.',
          type: 'ERROR',
        });
        logout();
        return;
      }

      if (deletionTimestamp) {
        const timestamp = parseInt(deletionTimestamp, 10);
        if (Date.now() - timestamp > 5 * 60 * 1000) {
          localStorage.removeItem('account_deleted');
          localStorage.removeItem('account_deleted_timestamp');
        }
      }
    }

    try {
      await update();
      const freshSession = await getSession();

      if (freshSession && freshSession.user) {
        const unauthorizedCount = parseInt(localStorage.getItem('unauthorized_count') || '0', 10);
        const lastUnauthorized = parseInt(localStorage.getItem('last_unauthorized') || '0', 10);
        const now = Date.now();

        if (now - lastUnauthorized < 30000 && unauthorizedCount >= 2) {
          logger.warn('Multiple 401s with valid session - possible account deletion, logging out...');
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

      logger.warn('Session expired, logging out...');
      setHasHandledUnauthorized(true);
      ReusableToast({
        message: 'Your session has expired. Please log in again.',
        type: 'ERROR',
      });
      logout();
    } catch (error) {
      logger.error('Error handling unauthorized event:', { error });
      setHasHandledUnauthorized(true);
      logout();
    }
  }, [logout, update, isAuthRoute, hasHandledUnauthorized, isLoggingOut]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('auth-token-expired', handleUnauthorized as EventListener);
      return () => window.removeEventListener('auth-token-expired', handleUnauthorized as EventListener);
    }
  }, [handleUnauthorized]);

  useEffect(() => {
    if (status === 'authenticated') {
      setHasLoggedOutForExpiration(false);
      setHasHandledUnauthorized(false);
    }
  }, [status]);

  useEffect(() => {
    if (
      status === 'unauthenticated' &&
      !isAuthRoute &&
      !hasLoggedOutForExpiration &&
      !isLoggingOut &&
      !hasHandledUnauthorized
    ) {
      logger.warn('Status unauthenticated on protected route, logging out');
      setHasLoggedOutForExpiration(true);
      logout();
    }
  }, [status, isAuthRoute, logout, hasLoggedOutForExpiration, isLoggingOut, hasHandledUnauthorized]);

  if (status === 'loading') {
    return <SessionLoadingState />;
  }

  if (isAuthRoute) {
    return <>{children}</>;
  }

  if (!session) {
    return <SessionLoadingState />;
  }

  return <UserDataFetcher>{children}</UserDataFetcher>;
}

export function AuthProvider({ children, session }: { children: React.ReactNode; session?: ExtendedSession }) {
  return (
    <SessionProvider session={session} refetchOnWindowFocus={false} refetchInterval={0}>
      <AuthWrapper>{children}</AuthWrapper>
    </SessionProvider>
  );
}
