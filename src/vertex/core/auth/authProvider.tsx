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
  logout,
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
import logger from '@/lib/logger';

/**
 * Component that automatically fetches and stores user data when authenticated
 * Optimized to prevent loops, conflicts, and repeated API calls
 */
function UserDataFetcher({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const { userDetails: user, activeGroup, isInitialized, isContextLoading, userContext } = useAppSelector((state) => state.user);

  logger.debug('[UserDataFetcher] Component rendered', {
    sessionStatus: status,
    hasSession: !!session,
    hasUser: !!user,
    userId: user?._id,
    isInitialized,
    isContextLoading,
    userContext,
    activeGroup: activeGroup?.grp_title,
  });

  // Memoize userId to prevent unnecessary re-calculations
  const userId = useMemo(() => {
    const id = session?.user && 'id' in session.user
      ? (session.user as { id: string }).id
      : null;
    logger.debug('[UserDataFetcher] userId calculated', {
      userId: id,
      hasSession: !!session,
      hasSessionUser: !!session?.user,
      sessionUserKeys: session?.user ? Object.keys(session.user) : [],
    });
    return id;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user]);

  // Determine if query should be enabled
  const queryEnabled = !!userId && status === 'authenticated';
  
  // Fetch user details only when userId is available and stable
  const { data, error, isLoading, isError, isSuccess, isFetching, isPending } = useQuery<UserDetailsResponse, Error>({
    queryKey: ['userDetails', userId],
    queryFn: () => {
      logger.debug('[UserDataFetcher] Fetching user details API call started', { userId });
      return users.getUserDetails(userId!);
    },
    enabled: queryEnabled,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Log query state changes
  useEffect(() => {
    logger.debug('[UserDataFetcher] Query state changed', {
      isLoading,
      isPending,
      isFetching,
      isError,
      isSuccess,
      hasData: !!data,
      hasError: !!error,
      userId,
      status,
      queryEnabled,
      dataStructure: data ? {
        hasUsers: !!data.users,
        usersLength: data.users?.length,
        success: data.success,
      } : null,
    });
  }, [isLoading, isPending, isFetching, isError, isSuccess, data, error, userId, status, queryEnabled]);

  // Clear user data when userId changes (different user logged in)
  const prevUserIdRef = useRef(userId);
  useEffect(() => {
    const prevUserId = prevUserIdRef.current;
    prevUserIdRef.current = userId;

    if (userId !== prevUserId) {
      logger.debug('[UserDataFetcher] userId changed', {
        prevUserId,
        newUserId: userId,
      });
      if (userId) {
        logger.debug('[UserDataFetcher] Clearing user data for new user');
        dispatch(logout());
        hasLoggedOutForNoGroupRef.current = false; // Reset for new user
      }
    }
  }, [userId, dispatch]);

  // Use refs to track previous values and prevent unnecessary dispatches
  const prevStatusRef = useRef(status);
  const prevDataRef = useRef(data);
  const prevErrorRef = useRef(error);
  const prevIsLoadingRef = useRef(isLoading);
  const hasLoggedOutForNoGroupRef = useRef(false);

  // Handle authentication status changes
  useEffect(() => {
    const prevStatus = prevStatusRef.current;
    prevStatusRef.current = status;

    // Only dispatch when status actually changes
    if (status !== prevStatus) {
      logger.debug('[UserDataFetcher] Session status changed', {
        prevStatus,
        newStatus: status,
        isInitialized,
      });
      if (status === 'unauthenticated') {
        logger.debug('[UserDataFetcher] User unauthenticated, dispatching logout');
        dispatch(logout());
      } else if (status === 'authenticated' && !isInitialized) {
        logger.debug('[UserDataFetcher] User authenticated, setting initialized');
        dispatch(setInitialized());
      }
    }
  }, [status, dispatch, isInitialized]);

  // Handle loading state changes
  useEffect(() => {
    const prevIsLoading = prevIsLoadingRef.current;
    prevIsLoadingRef.current = isLoading;

    // Only dispatch when loading state actually changes
    if (isLoading !== prevIsLoading) {
      logger.debug('[UserDataFetcher] Loading state changed', {
        prevIsLoading,
        newIsLoading: isLoading,
        isContextLoading,
        queryEnabled,
      });
      dispatch(setContextLoading(isLoading));
    }

    // If query is not enabled, ensure loading is false
    if (!queryEnabled && isLoading === false && isContextLoading) {
      logger.debug('[UserDataFetcher] Query not enabled but context still loading, setting to false');
      dispatch(setContextLoading(false));
    }
  }, [isLoading, dispatch, isContextLoading, queryEnabled]);

  // Handle error changes
  useEffect(() => {
    const prevError = prevErrorRef.current;
    prevErrorRef.current = error;

    // Only dispatch when error actually changes
    if (error !== prevError && error) {
      logger.error('[UserDataFetcher] Error fetching user details', {
        error: getApiErrorMessage(error),
        errorObject: error,
      });
      ReusableToast({
        message: `Could not load organization details: ${getApiErrorMessage(error)}`,
        type: 'WARNING',
      });
      logger.debug('[UserDataFetcher] Setting context loading to false due to error');
      dispatch(setContextLoading(false));
    }
  }, [error, dispatch]);

  // Handle successful data fetching
  useEffect(() => {
    const prevData = prevDataRef.current;
    prevDataRef.current = data;

    logger.debug('[UserDataFetcher] Data effect triggered', {
      hasData: !!data,
      dataChanged: data !== prevData,
      hasUsers: !!data?.users,
      usersCount: data?.users?.length || 0,
    });

    // If we have data but it changed and doesn't have users, set loading to false
    if (data !== prevData && data && (!data.users || data.users.length === 0)) {
      logger.warn('[UserDataFetcher] Data received but no users found', {
        hasData: !!data,
        dataKeys: data ? Object.keys(data) : [],
        users: data?.users,
      });
      dispatch(setContextLoading(false));
    }

    // Only process data when it actually changes and is valid
    if (data !== prevData && data?.users && data.users.length > 0) {
      logger.debug('[UserDataFetcher] Processing user data', {
        userId: data.users[0]?._id,
        email: data.users[0]?.email,
        groupsCount: data.users[0]?.groups?.length || 0,
        networksCount: data.users[0]?.networks?.length || 0,
      });
      const userInfo = data.users[0] as UserDetails;

      if (!userInfo) {
        logger.warn('[UserDataFetcher] Extended user details not found.');
        dispatch(setContextLoading(false));
        return;
      }

      const isAirQoStaff = !!userInfo.email?.endsWith('@airqo.net');

      let filteredGroups: Group[] = userInfo.groups || [];
      let filteredNetworks: Network[] = userInfo.networks || [];

      if (!isAirQoStaff) {
        filteredGroups = (userInfo.groups || []).filter(
          (group) => group.grp_title.toLowerCase() !== 'airqo'
        );
        filteredNetworks = (userInfo.networks || []).filter(
          (network) => network.net_name.toLowerCase() !== 'airqo'
        );

        logger.debug('[UserDataFetcher] Filtered out AirQo groups/networks for non-AirQo staff', {
          email: userInfo.email,
          originalGroupsCount: userInfo.groups?.length || 0,
          filteredGroupsCount: filteredGroups.length,
          originalNetworksCount: userInfo.networks?.length || 0,
          filteredNetworksCount: filteredNetworks.length,
          filteredGroups: filteredGroups.map((g) => g.grp_title),
          filteredNetworks: filteredNetworks.map((n) => n.net_name),
        });
      }

      const savedUserContext = localStorage.getItem('userContext') as 'personal' | 'airqo-internal' | 'external-org' | null;
      const savedActiveGroup = localStorage.getItem('activeGroup');
      const isManualPersonalMode = savedUserContext === 'personal' && !savedActiveGroup;

      dispatch(setUserDetails(userInfo));
      dispatch(setUserGroups(filteredGroups));
      dispatch(setAvailableNetworks(filteredNetworks));

      localStorage.setItem('userDetails', JSON.stringify(userInfo));
      localStorage.setItem('userGroups', JSON.stringify(filteredGroups));
      localStorage.setItem('availableNetworks', JSON.stringify(filteredNetworks));

      let defaultNetwork: Network | undefined;
      let defaultGroup: Group | undefined;
      let initialUserContext: 'personal' | 'airqo-internal' | 'external-org';

      if (isManualPersonalMode) {
        logger.debug('[UserDataFetcher] Respecting manual personal mode switch from localStorage', {
          savedUserContext,
          hasSavedActiveGroup: !!savedActiveGroup,
        });
        defaultNetwork = undefined;
        defaultGroup = undefined;
        initialUserContext = 'personal';
        dispatch(setActiveGroup(null));
        dispatch(setUserContext('personal'));
        localStorage.removeItem('activeGroup');
        localStorage.removeItem('activeNetwork');
        localStorage.setItem('userContext', 'personal');
      } else {
        const airqoNetwork = filteredNetworks.find(
          (network: Network) => network.net_name.toLowerCase() === 'airqo'
        );
        const airqoGroup = filteredGroups.find(
          (group: Group) => group.grp_title.toLowerCase() === 'airqo'
        );

        if (savedActiveGroup) {
          try {
            const parsedSavedGroup = JSON.parse(savedActiveGroup) as Group;
            // Verify the saved group is still in the user's filtered groups
            const isValidSavedGroup = filteredGroups.some(
              (g) => g._id === parsedSavedGroup._id
            );
            if (isValidSavedGroup) {
              defaultGroup = parsedSavedGroup;
              logger.debug('[UserDataFetcher] Using saved activeGroup from localStorage', {
                groupTitle: defaultGroup.grp_title,
              });
            }
          } catch (error) {
            logger.debug('[UserDataFetcher] Failed to parse saved activeGroup', { error });
          }
        }

        if (!defaultGroup) {
          if (isAirQoStaff) {
            defaultNetwork = airqoNetwork || filteredNetworks[0];
            defaultGroup = airqoGroup || filteredGroups[0];
          } else {
            defaultNetwork = filteredNetworks[0];
            defaultGroup = filteredGroups[0];

            logger.debug('[UserDataFetcher] Non-AirQo staff group selection', {
              isAirQoStaff,
              totalGroups: filteredGroups.length,
              selectedGroup: defaultGroup?.grp_title,
              allGroups: filteredGroups.map((g) => g.grp_title),
              totalNetworks: filteredNetworks.length,
              selectedNetwork: defaultNetwork?.net_name,
              allNetworks: filteredNetworks.map((n) => n.net_name),
            });
          }
        }
        
        if (defaultGroup) {
          if (!defaultNetwork && filteredNetworks.length > 0) {
            const groupTitle = defaultGroup.grp_title.toLowerCase();
            const matchedNetwork = filteredNetworks.find(
              (n) => n.net_name.toLowerCase() === groupTitle
            );
            defaultNetwork = matchedNetwork || filteredNetworks[0];
          }
        }

        if (defaultNetwork) {
          dispatch(setActiveNetwork(defaultNetwork));
          localStorage.setItem('activeNetwork', JSON.stringify(defaultNetwork));
        }
        if (defaultGroup) {
          dispatch(setActiveGroup(defaultGroup));
          localStorage.setItem('activeGroup', JSON.stringify(defaultGroup));
        } else {
          dispatch(setActiveGroup(null));
          localStorage.removeItem('activeGroup');
        }

        // Determine user context
        if (defaultGroup) {
          if (defaultGroup.grp_title.toLowerCase() === 'airqo' && isAirQoStaff) {
            initialUserContext = 'airqo-internal';
          } else {
            initialUserContext = 'external-org';
          }
        } else {
          initialUserContext = 'personal';
        }

        dispatch(setUserContext(initialUserContext));
        localStorage.setItem('userContext', initialUserContext);
      }

      logger.debug('[UserDataFetcher] User data processed successfully', {
        userId: userInfo._id,
        email: userInfo.email,
        context: initialUserContext,
        hasDefaultNetwork: !!defaultNetwork,
        hasDefaultGroup: !!defaultGroup,
        defaultGroupTitle: defaultGroup?.grp_title,
        defaultNetworkName: defaultNetwork?.net_name,
      });
      
      if (!isInitialized) {
        logger.debug('[UserDataFetcher] Marking app as initialized after user bootstrap');
        dispatch(setInitialized());
      }
      logger.debug('[UserDataFetcher] Setting context loading to false');
      dispatch(setContextLoading(false));

      // Prefetch initial device data in the background without blocking initialization
      try {
        if (initialUserContext === 'personal') {
          void queryClient.prefetchQuery({
            queryKey: ['my-devices', userInfo._id],
            queryFn: () => devices.getMyDevices(userInfo._id),
            staleTime: 300_000,
          });
        } else if (defaultGroup && defaultNetwork) {
          const resolvedNetworkName = defaultNetwork?.net_name || '';
          const resolvedGroupName = defaultGroup?.grp_title || '';

          void queryClient.prefetchQuery({
            queryKey: [
              'devices',
              resolvedNetworkName,
              resolvedGroupName,
              { page: 1, limit: 100, search: undefined, sortBy: undefined, order: undefined },
            ],
            queryFn: () =>
              devices.getDevicesSummaryApi({
                network: resolvedNetworkName,
                group: resolvedGroupName,
                limit: 100,
                skip: 0,
              }),
            staleTime: 300_000,
          });
        }
      } catch {
        ReusableToast({
          message: 'Could not load initial device data.',
          type: 'WARNING',
        });
      }
    }
  }, [data, dispatch, queryClient, isInitialized]);

  const userGroups = useAppSelector((state) => state.user.userGroups);
  useEffect(() => {
    logger.debug('[UserDataFetcher] Checking active group', {
      hasUser: !!user,
      hasActiveGroup: !!activeGroup,
      hasUserGroups: userGroups.length > 0,
      userGroupsCount: userGroups.length,
      userContext,
      isPersonalContext: userContext === 'personal',
      isLoading,
      hasLoggedOutForNoGroup: hasLoggedOutForNoGroupRef.current,
      isInitialized,
    });
    
    if (
      user &&
      !activeGroup &&
      userGroups.length === 0 &&
      userContext !== null &&
      userContext !== 'personal' &&
      !isLoading &&
      !hasLoggedOutForNoGroupRef.current &&
      isInitialized
    ) {
      logger.warn('[UserDataFetcher] User has no groups and is not in personal mode, logging out to prevent issues', {
        userContext,
        userGroupsCount: userGroups.length,
      });
      hasLoggedOutForNoGroupRef.current = true;
      clearSessionData();
      queryClient.clear();
      signOut({ callbackUrl: '/login' });
    } else if (user && !activeGroup && userGroups.length > 0 && !isLoading && isInitialized) {
      logger.warn('[UserDataFetcher] User has groups but no active group was set', {
        userGroupsCount: userGroups.length,
        userGroups: userGroups.map((g) => g.grp_title),
        userContext,
      });
    } else if (user && !activeGroup && userGroups.length === 0 && userContext === 'personal' && isInitialized) {
      logger.debug('[UserDataFetcher] User is in personal mode with no groups - this is valid and allowed', {
        userContext,
        userGroupsCount: userGroups.length,
      });
    } else if (user && !activeGroup && userGroups.length === 0 && userContext === null && isInitialized && !isLoading) {
      logger.debug('[UserDataFetcher] User has no groups but context is still being determined, waiting...', {
        userContext,
        userGroupsCount: userGroups.length,
        isContextLoading,
      });
    }
  }, [activeGroup, user, userGroups, userContext, isLoading, isInitialized, isContextLoading, queryClient]);

  useEffect(() => {
    if (status === 'authenticated' && !isInitialized) {
      logger.debug('[UserDataFetcher] Guard initializing app (authenticated with no prior status change)');
      dispatch(setInitialized());
    }
  }, [status, isInitialized, dispatch]);

  return <>{children}</>;
}

const authRoutes = ['/login', '/forgot-password'];

function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { activeGroup, isInitialized, isContextLoading, userDetails } = useAppSelector((state) => state.user);
  const [hasLoggedOutForExpiration, setHasLoggedOutForExpiration] = useState(false);
  const [hasHandledUnauthorized, setHasHandledUnauthorized] = useState(false);
  const queryClient = useQueryClient();

  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Log AuthWrapper state
  useEffect(() => {
    logger.debug('[AuthWrapper] Component state', {
      sessionStatus: status,
      hasSession: !!session,
      pathname,
      isAuthRoute,
      hasActiveGroup: !!activeGroup,
      isInitialized,
      isContextLoading,
      hasUserDetails: !!userDetails,
      hasLoggedOutForExpiration,
      hasHandledUnauthorized,
    });
  }, [status, session, pathname, isAuthRoute, activeGroup, isInitialized, isContextLoading, userDetails, hasLoggedOutForExpiration, hasHandledUnauthorized]);

  // Logout function
  const handleLogout = useCallback(() => {
    clearSessionData();
    queryClient.clear();
    signOut({ callbackUrl: '/login' });
  }, [queryClient]);

  // Listen for unauthorized events from API client
  const handleUnauthorized = useCallback(async () => {
    if (isAuthRoute) return;

    if (hasHandledUnauthorized) return;

    try {
      await update();

      const freshSession = await getSession();
      if (freshSession && freshSession.user) {
        logger.warn(
          '401 received but session is valid - likely permissions issue or account deleted'
        );
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
          logger.warn(
            'Multiple 401s with valid session - possible account deletion, logging out...'
          );
          setHasHandledUnauthorized(true);
          ReusableToast({
            message: 'Your access has been revoked. Please log in again.',
            type: 'ERROR',
          });
          handleLogout();
          return;
        }

        // Update counters
        localStorage.setItem('unauthorized_count', (unauthorizedCount + 1).toString());
        localStorage.setItem('last_unauthorized', now.toString());

        return;
      }

      // Session is expired, logout
      logger.warn('Session expired, logging out...');
      setHasHandledUnauthorized(true);
      ReusableToast({
        message: 'Your session has expired. Please log in again.',
        type: 'ERROR',
      });
      handleLogout();
    } catch (error) {
      logger.error('Error handling unauthorized event:', {
        error: error instanceof Error ? error.message : String(error),
      });
      setHasHandledUnauthorized(true);
      handleLogout();
    }
  }, [handleLogout, update, isAuthRoute, hasHandledUnauthorized]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('auth-token-expired', handleUnauthorized as EventListener);
      return () =>
        window.removeEventListener('auth-token-expired', handleUnauthorized as EventListener);
    }
  }, [handleUnauthorized]);

  // If authenticated and on an auth page, redirect to home
  useEffect(() => {
    logger.debug('[AuthWrapper] Checking redirect conditions', {
      status,
      isAuthRoute,
      hasActiveGroup: !!activeGroup,
      isInitialized,
      shouldRedirect: status === 'authenticated' && isAuthRoute && activeGroup && isInitialized,
    });
    if (status === 'authenticated' && isAuthRoute && activeGroup && isInitialized) {
      logger.debug('[AuthWrapper] Redirecting to /home');
      router.push('/home');
    }
  }, [status, isAuthRoute, activeGroup, isInitialized, router]);

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
      !hasHandledUnauthorized
    ) {
      logger.warn('Status unauthenticated on protected route, logging out');
      setHasLoggedOutForExpiration(true);
      handleLogout();
    }
  }, [status, isAuthRoute, handleLogout, hasLoggedOutForExpiration, hasHandledUnauthorized]);

  if (status === 'loading') {
    logger.debug('[AuthWrapper] Session status is loading, showing loading state');
    return <SessionLoadingState />;
  }

  if (isAuthRoute) {
    logger.debug('[AuthWrapper] Auth route detected, rendering children without UserDataFetcher');
    return <>{children}</>;
  }

  if (!session) {
    logger.debug('[AuthWrapper] No session on protected route, showing loading state');
    return <SessionLoadingState />;
  }

  logger.debug('[AuthWrapper] Rendering UserDataFetcher with children', {
    hasSession: !!session,
    status,
    isInitialized,
    isContextLoading,
  });

  return (
    <UserDataFetcher>
      {children}
    </UserDataFetcher>
  );
}

interface AuthProviderProps {
  children: React.ReactNode;
  session?: ExtendedSession;
}

export function AuthProvider({ children, session }: AuthProviderProps) {
  useEffect(() => {
    logger.debug('[AuthProvider] AuthProvider mounted', {
      hasSession: !!session,
    });
  }, [session]);

  return (
    <SessionProvider session={session} refetchOnWindowFocus={false} refetchInterval={0}>
      <AuthWrapper>{children}</AuthWrapper>
    </SessionProvider>
  );
}
