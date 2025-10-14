'use client';

import React, {
  useState,
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useSession, signOut } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import PropTypes from 'prop-types';
import { getOrganizationBySlugApi } from '@/core/apis/Organizations';
import {
  setActiveGroup as setActiveGroupAction,
  selectActiveGroup,
  selectUserGroups,
  fetchUserGroups,
  fetchGroupDetails,
} from '@/lib/store/services/groups';
import { replaceUserPreferences } from '@/lib/store/services/account/UserDefaultsSlice';
import {
  setOrganizationName,
  setChartSites,
  resetChartStore,
} from '@/lib/store/services/charts/ChartSlice';
import { isAirQoGroup, titleToSlug } from '@/core/utils/organizationUtils';
import { setupUserSession } from '@/core/utils/loginSetup';
import LoadingSpinner from '@/common/components/LoadingSpinner';
import OrganizationNotFound from '@/common/components/Organization/OrganizationNotFound';
import OrganizationSwitchLoader from '@/common/components/Organization/OrganizationSwitchLoader';
import logger from '@/lib/logger';
import LogoutUser from '@/core/HOC/LogoutUser';

const ctx = createContext(null);

// --- Pure Helpers ---
const extractOrgSlug = (pathname) =>
  pathname?.match?.(/\/org\/([^/]+)/)?.[1] ?? null;

const groupRoute = (group) => {
  if (!group || isAirQoGroup(group)) return '/user/Home';
  const slug = group.organization_slug || titleToSlug(group.grp_title);
  if (!slug || slug === 'default') {
    logger.warn('Invalid slug for non-AirQo group', { group });
    return '/user/Home';
  }
  return `/org/${slug}/dashboard`;
};

const findGroupBySlug = (groups, slug) => {
  if (!slug) return groups?.find?.(isAirQoGroup);
  return groups?.find?.((g) => {
    const currentSlug =
      g.organization_slug || g.grp_slug || titleToSlug(g.grp_title);
    return currentSlug === slug;
  });
};

// Calculate retry delay with exponential backoff
const calculateRetryDelay = (retryCount) => {
  const backoffDelays = [1000, 2000, 4000, 8000, 16000, 300000];
  return backoffDelays[Math.min(retryCount, backoffDelays.length - 1)];
};

// Safe error message extraction
const extractErrorMessage = (error) => {
  if (typeof error?.message === 'string') return error.message;
  if (error == null) return 'Unknown error occurred';
  return String(error);
};

// --- Reducer ---
const initialState = {
  isLoading: false,
  error: null,
  isSwitching: false,
  initialGroupSet: false,
  sessionInitialized: false,
  sessionReady: false, // NEW: Tracks if session is fully ready (initialized + group set)
  organization: null,
  organizationTheme: null,
  organizationLoading: false,
  organizationError: null,
  organizationInitialized: false,
  organizationRetryCount: 0,
  organizationLastFailedAt: null,
  organizationRetryNonce: 0,
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_GROUPS_LOADING':
      return { ...state, isLoading: action.payload, error: null };
    case 'SET_GROUPS_ERROR':
      return { ...state, isLoading: false, error: action.payload };
    case 'SET_SWITCHING':
      return { ...state, isSwitching: action.payload };
    case 'SET_INITIAL_GROUP_SET':
      return { ...state, initialGroupSet: true };
    case 'SET_SESSION_INITIALIZED':
      return { ...state, sessionInitialized: action.payload };
    case 'SET_SESSION_READY':
      return { ...state, sessionReady: action.payload };
    case 'SET_ORG_LOADING':
      return { ...state, organizationLoading: true, organizationError: null };
    case 'SET_ORG_DATA':
      return {
        ...state,
        organizationLoading: false,
        organizationError: action.payload.error,
        organizationInitialized: true,
        organization: action.payload.org,
        organizationTheme: action.payload.theme,
        organizationRetryCount: action.payload.error
          ? state.organizationRetryCount + 1
          : 0,
        organizationLastFailedAt: action.payload.error
          ? action.payload.now
          : null,
      };
    case 'CLEAR_ORG_DATA':
      return {
        ...state,
        organization: null,
        organizationTheme: null,
        organizationLoading: false,
        organizationError: null,
        organizationInitialized: false,
        organizationRetryCount: 0,
        organizationLastFailedAt: null,
      };
    case 'ORG_RETRY_TICK':
      return {
        ...state,
        organizationRetryNonce: state.organizationRetryNonce + 1,
      };
    default:
      return state;
  }
};

// --- Provider ---
export function UnifiedGroupProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const rdxDispatch = useDispatch();
  const { data: session, status: sessionStatus } = useSession();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const activeGroup = useSelector(selectActiveGroup);
  const _rawUserGroups = useSelector(selectUserGroups);

  // Stable memoized values to prevent unnecessary re-renders
  const userGroups = useMemo(() => {
    // Defensive check - ensure we always have an array
    if (Array.isArray(_rawUserGroups)) {
      return _rawUserGroups;
    }
    // Handle case where userGroups might be undefined or null during SSR
    if (_rawUserGroups === undefined || _rawUserGroups === null) {
      return [];
    }
    // Log warning for debugging - userGroups should always be an array from Redux initial state
    if (process.env.NODE_ENV === 'development') {
      logger.warn(
        'UnifiedGroupProvider: _rawUserGroups is not an array:',
        _rawUserGroups,
      );
    }
    // Fallback to empty array
    return [];
  }, [_rawUserGroups]);

  const userGroupsLength = useMemo(() => {
    // Extra safety check to prevent length access on undefined
    return Array.isArray(userGroups) ? userGroups.length : 0;
  }, [userGroups]);

  // Refs for async operations - initialize properly with safe defaults
  const lock = useRef(false);
  // keep abortRef as a flat ref to the AbortController (avoid wrapper object)
  const abortRef = useRef(null);
  const requestCacheRef = useRef(new Map());
  const retryTimerRef = useRef(null);
  const initializedRef = useRef(false);
  const mountedRef = useRef(true);
  const prevOrgSlugRef = useRef(null);
  const setupAbortRef = useRef(null);
  const hasManuallySwitched = useRef(false);


  const orgCacheRef = useRef(new Map());
  const ORG_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  // Cleanup function to prevent memory leaks
  const cleanup = useCallback(() => {
    try {
      // Clear all timers
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }

      // Abort any pending requests
      if (abortRef.current && typeof abortRef.current.abort === 'function') {
        abortRef.current.abort();
        abortRef.current = null;
      }

      // Clear request cache
      if (
        requestCacheRef.current &&
        typeof requestCacheRef.current.clear === 'function'
      ) {
        requestCacheRef.current.clear();
      }

      // Release locks
      lock.current = false;
    } catch (error) {
      logger.error('Cleanup error:', error);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      try {
        cleanup();
      } catch (e) {
        logger.error('Cleanup error:', e);
      }
    };
  }, [cleanup]);

  useEffect(() => {
    logger.debug('[UnifiedGroupProvider] Component mounted/updated', {
      sessionStatus,
      hasSession: !!session,
      userId: session?.user?.id,
      userGroupsLength,
      sessionInitialized: state.sessionInitialized,
      initialGroupSet: state.initialGroupSet,
      sessionReady: state.sessionReady,
      isLoading: state.isLoading,
      initializedRef: initializedRef.current,
      lock: lock.current
    });
  }, [sessionStatus, session, userGroupsLength, state.sessionInitialized, state.initialGroupSet, state.sessionReady, state.isLoading]);

  // Centralized sign-out logic
  const handleSignOut = useCallback(async () => {
    // The LogoutUser utility handles its own loading state, prevents re-entry,
    // and performs a full application state cleanup and redirect.
    // We can simply call it here to ensure consistent logout behavior everywhere.
    // The `isSigningOut` state will be shown until LogoutUser performs a hard redirect.
    if (!isSigningOut) setIsSigningOut(true);
    await LogoutUser(rdxDispatch);
  }, [rdxDispatch, isSigningOut]);

  const isAuthRoute = useMemo(() => {
    return (
      typeof pathname === 'string' &&
      (pathname.includes('/login') ||
        pathname.includes('/register') ||
        pathname.includes('/auth'))
    );
  }, [pathname]);

  const organizationSlug = useMemo(() => {
    if (isAuthRoute) return null;
    return extractOrgSlug(pathname);
  }, [pathname, isAuthRoute]);

  const isOrganizationContext = Boolean(organizationSlug);

  // --- Core Logic (moved to useCallback to prevent recreations) ---
  const refreshGroups = useCallback(
    async (force = false, retryCount = 0) => {
      const maxRetries = 3;
      const retryDelay = 1000 * (retryCount + 1); // 1s, 2s, 3s delays

      logger.debug('[UnifiedGroupProvider] refreshGroups called', {
        force,
        retryCount,
        maxRetries,
        sessionStatus,
        hasSession: !!session?.user?.id,
        userId: session?.user?.id,
        userGroupsLength,
        isLoading: state.isLoading,
        lock: lock.current,
        mounted: mountedRef.current
      });

      // Prevent concurrent executions and invalid states
      if (
        !mountedRef.current ||
        sessionStatus !== 'authenticated' ||
        !session?.user?.id ||
        (!force && state.isLoading) ||
        lock.current
      ) {
        logger.debug('[UnifiedGroupProvider] refreshGroups conditions not met, returning early');
        return;
      }

      lock.current = true;

      try {
        if (!mountedRef.current) return;
        logger.info('[UnifiedGroupProvider] Starting groups fetch', {
          userId: session.user.id,
          force,
          retryCount,
          currentUserGroupsLength: userGroupsLength
        });

        dispatch({ type: 'SET_GROUPS_LOADING', payload: true });

        // Always fetch if userGroups is empty or force is true
        if (userGroupsLength === 0 || force) {
          logger.debug('[UnifiedGroupProvider] Calling fetchUserGroups API', {
            userId: session.user.id,
            retryCount
          });

          const result = await rdxDispatch(fetchUserGroups(session.user.id)).unwrap();

          logger.info('[UnifiedGroupProvider] fetchUserGroups API completed successfully', {
            userId: session.user.id,
            groupsCount: result.groups?.length || 0,
            hasUser: !!result.user,
            resultKeys: Object.keys(result || {}),
            groupsArray: result.groups,
            userObject: result.user
          });

          logger.info('Redux Thunk: fetchUserGroups BEFORE RETURN', {
            result,
            groupsCount: result.groups?.length,
            groupsArray: result.groups,
            userObject: result.user,
            resultKeys: Object.keys(result || {}),
          });

          return result;

        }

        if (!mountedRef.current) return;
        dispatch({ type: 'SET_GROUPS_LOADING', payload: false });

        logger.info('[UnifiedGroupProvider] refreshGroups completed successfully');
      } catch (error) {
        if (!mountedRef.current) return;

        logger.error('[UnifiedGroupProvider] refreshGroups error:', {
          errorMessage: error?.message,
          errorName: error?.name,
          errorStack: error?.stack,
          userId: session?.user?.id,
          retryCount,
          maxRetries,
          errorType: typeof error,
          errorKeys: error ? Object.keys(error) : []
        });

        // Retry logic for network errors
        if (retryCount < maxRetries && error?.code === 'ECONNABORTED') {
          logger.info('[UnifiedGroupProvider] Retrying after network error', {
            retryCount: retryCount + 1,
            delay: retryDelay
          });

          setTimeout(() => {
            if (mountedRef.current) {
              refreshGroups(force, retryCount + 1);
            }
          }, retryDelay);
          return;
        }

        // Safe error handling - defer state updates
        const safeMessage = extractErrorMessage(error);
        dispatch({ type: 'SET_GROUPS_ERROR', payload: safeMessage });

        // Handle auth errors asynchronously
        const status = error?.response?.status ?? error?.status;
        const isAuthError = status === 401 || safeMessage.includes('401');

        logger.debug('[UnifiedGroupProvider] Error analysis', {
          status,
          isAuthError,
          safeMessage,
          retryCount
        });

        if (isAuthError && typeof signOut === 'function') {
          // Use setTimeout to avoid setState during render
          setTimeout(() => {
            // Use the new centralized sign-out handler
            if (mountedRef.current) handleSignOut();
          }, 0);
        }
      } finally {
        if (retryCount === 0) { // Only release lock on first attempt, retries will handle it
          lock.current = false;
          logger.debug('[UnifiedGroupProvider] refreshGroups finally block - lock released');
        }
      }
    },
    [
      rdxDispatch,
      sessionStatus,
      session?.user?.id,
      userGroupsLength,
      state.isLoading,
      handleSignOut,
    ],
  );

  const setActiveGroupAtomic = useCallback(
    (group, reason) => {
      if (!group || lock.current) return;

      // Defensive: grp_title might be missing during hot-reload or malformed data
      const groupTitleForLog =
        group?.grp_title ?? group?._id ?? 'unknown-group';
      logger.debug('setActiveGroupAtomic', { group: groupTitleForLog, reason });
      lock.current = true;

      try {
        // Defer Redux dispatch to avoid setState during render
        const performUpdate = () => {
          if (mountedRef.current) {
            rdxDispatch(setActiveGroupAction(group));
            rdxDispatch(setOrganizationName(group?.grp_title || ''));
            // mark initial group set safely
            if (mountedRef.current) {
              dispatch({ type: 'SET_INITIAL_GROUP_SET' });
              // When the first group is set, the session is considered fully ready
              if (!state.sessionReady)
                dispatch({ type: 'SET_SESSION_READY', payload: true });
            }
          }
        };

        // Use requestAnimationFrame for non-blocking state updates
        requestAnimationFrame(performUpdate);
      } finally {
        lock.current = false;
      }
    },
    [rdxDispatch, state.sessionReady],
  );

  const switchToGroup = useCallback(
    async (target, opts = {}) => {
      const { navigate = true } = opts;

      if (
        !target ||
        !session?.user?.id ||
        state.isSwitching ||
        lock.current ||
        activeGroup?._id === target._id
      ) {
        return { success: false, error: 'Invalid or duplicate switch' };
      }

      lock.current = true;
      dispatch({ type: 'SET_SWITCHING', payload: true });
      hasManuallySwitched.current = true;

      try {
        const isAirQo = isAirQoGroup(target);

        // Update Redux store
        rdxDispatch(setActiveGroupAction(target));
        rdxDispatch(setOrganizationName(target?.grp_title || ''));
        rdxDispatch(setChartSites([]));
        if (!isAirQo) rdxDispatch(resetChartStore());

        const targetRoute = groupRoute(target);

        if (navigate && pathname !== targetRoute) {
          // Use immediate navigation with replace for smoother transition
          router.replace(targetRoute);
        }

        logger.info(`[UnifiedGroupProvider] Context switch`, {
          context: organizationSlug || 'AirQo',
          activeGroup: activeGroup?.grp_title,
        });

        // Update user preferences asynchronously without blocking UI
        rdxDispatch(
          replaceUserPreferences({
            user_id: session.user.id,
            group_id: target._id,
          }),
        );


        if (opts.fetchDetails) {
          await rdxDispatch(fetchGroupDetails(target._id));
        }

        // Clear switching state after a short delay to allow navigation to complete
        setTimeout(() => {
          dispatch({ type: 'SET_SWITCHING', payload: false });
        }, 300);

        return { success: true, targetRoute };
      } catch (error) {
        logger.error('switchToGroup error:', error);
        return { success: false, error: extractErrorMessage(error) };
      } finally {
        lock.current = false;
      }
    },
    [session.user.id, state.isSwitching, activeGroup?._id, activeGroup?.grp_title, rdxDispatch, pathname, organizationSlug, router],
  );

  const setActiveGroupById = useCallback(
    (id, opts) =>
      switchToGroup(
        userGroups.find((g) => g._id === id),
        opts,
      ),
    [userGroups, switchToGroup],
  );

  const canSwitchToGroup = useCallback(
    (g) => userGroups.some((x) => x._id === g._id),
    [userGroups],
  );

  // --- Effects (properly structured to avoid setState during render) ---
  useEffect(() => {
    logger.debug('[UnifiedGroupProvider] Redux state changed', {
      userGroupsLength,
      userGroups: userGroups?.length || 0,
      userGroupsArray: userGroups,
      activeGroup: activeGroup ? {
        id: activeGroup._id,
        name: activeGroup.grp_title
      } : null,
      rawUserGroups: _rawUserGroups?.length || 0,
      rawUserGroupsArray: _rawUserGroups,
      isLoading: state.isLoading,
      sessionInitialized: state.sessionInitialized,
      initialGroupSet: state.initialGroupSet,
      sessionReady: state.sessionReady
    });
  }, [userGroupsLength, userGroups, activeGroup, _rawUserGroups, state.isLoading, state.sessionInitialized, state.initialGroupSet, state.sessionReady]);

  useEffect(() => {
    if (!isOrganizationContext || !organizationSlug) return;

    // Check if we have this org in the fast cache
    const cachedEntry = orgCacheRef.current.get(organizationSlug);
    if (cachedEntry && Date.now() - cachedEntry.timestamp < ORG_CACHE_TTL) {
      logger.info('[UnifiedGroupProvider] Using org from fast cache', {
        organizationSlug,
        age: Date.now() - cachedEntry.timestamp,
      });

      dispatch({
        type: 'SET_ORG_DATA',
        payload: {
          org: cachedEntry.org,
          theme: cachedEntry.theme,
          error: null,
          now: Date.now(),
        },
      });
      return;
    }
  }, [ORG_CACHE_TTL, isOrganizationContext, organizationSlug]);

  // Initialize groups
  useEffect(() => {
    logger.debug('[UnifiedGroupProvider] Groups initialization effect triggered', {
      sessionStatus,
      hasSession: !!session?.user?.id,
      userGroupsLength,
      initializedRef: initializedRef.current,
      isLoading: state.isLoading,
      conditionMet: (
        sessionStatus === 'authenticated' &&
        session?.user?.id &&
        userGroupsLength === 0 &&
        !initializedRef.current &&
        !state.isLoading
      )
    });

    if (
      sessionStatus === 'authenticated' &&
      session?.user?.id &&
      userGroupsLength === 0 &&
      !initializedRef.current &&
      !state.isLoading
    ) {
      logger.info('[UnifiedGroupProvider] Starting groups initialization');
      initializedRef.current = true;
      refreshGroups();
    }
  }, [
    sessionStatus,
    session?.user?.id,
    userGroupsLength,
    refreshGroups,
    state.isLoading,
  ]);

  useEffect(() => {
    logger.debug('[UnifiedGroupProvider] Session initialization effect triggered', {
      sessionStatus,
      hasSession: !!session?.user?.id,
      userGroupsLength,
      sessionInitialized: state.sessionInitialized,
      lock: lock.current,
      conditionMet: (
        sessionStatus === 'authenticated' &&
        session?.user?.id &&
        userGroupsLength > 0 &&
        !state.sessionInitialized &&
        !lock.current
      )
    });
    if (
      sessionStatus === 'authenticated' &&
      session?.user?.id &&
      userGroupsLength > 0 &&
      !state.sessionInitialized &&
      !lock.current
    ) {
      logger.info('Initializing user session with optimized setupUserSession', {
        userId: session.user.id,
        userGroupsCount: userGroupsLength,
        userGroupsAvailable: Array.isArray(userGroups) && userGroups.length > 0,
      });

      const fallbackTimeout = setTimeout(() => {
        if (mountedRef.current && !state.sessionInitialized) {
          logger.warn('Session setup timeout - forcing session initialization');
          dispatch({ type: 'SET_SESSION_INITIALIZED', payload: true });
          dispatch({ type: 'SET_INITIAL_GROUP_SET', payload: true });
        }
      }, 5000);

      const setupSession = async () => {
        try {
          logger.info('[UnifiedGroupProvider] Starting setupUserSession', {
            userId: session.user.id,
            userGroupsCount: userGroupsLength,
            hasUserGroups: Array.isArray(userGroups) && userGroups.length > 0,
            pathname
          });

          const result = await setupUserSession(
            session,
            rdxDispatch,
            pathname,
            {
              userGroups: Array.isArray(userGroups) && userGroups.length > 0
                ? userGroups
                : undefined,
              maintainActiveGroup: true,
            },
          );

          logger.info('[UnifiedGroupProvider] setupUserSession completed', {
            success: result.success,
            hasActiveGroup: !!result.activeGroup,
            activeGroupId: result.activeGroup?._id,
            error: result.error
          });

          if (result.success) {
            logger.info('User session setup completed successfully', {
              activeGroupId: result.activeGroup?._id,
              activeGroupName: result.activeGroup?.grp_title,
            });
          } else {
            logger.error('User session setup failed:', result.error);
          }
        } catch (error) {
          logger.error('[UnifiedGroupProvider] setupUserSession error:', {
            errorMessage: error?.message,
            errorName: error?.name,
            errorStack: error?.stack,
            userId: session.user.id
          });
        } finally {
          clearTimeout(fallbackTimeout);

          if (mountedRef.current) {
            logger.info('[UnifiedGroupProvider] Setting session as initialized', {
              wasSessionInitialized: state.sessionInitialized,
              wasInitialGroupSet: state.initialGroupSet
            });

            dispatch({ type: 'SET_SESSION_INITIALIZED', payload: true });
            if (!state.initialGroupSet) {
              dispatch({ type: 'SET_INITIAL_GROUP_SET', payload: true });
            }
          }
        }
      };

      setupSession();

      return () => clearTimeout(fallbackTimeout);
    }
  }, [
    sessionStatus,
    session,
    userGroupsLength,
    userGroups,
    state.sessionInitialized,
    state.initialGroupSet,
    rdxDispatch,
    pathname,
  ]);

  useEffect(() => {
    return () => {
      // Clean up setupUserSession abort controller if it exists
      if (setupAbortRef.current && typeof setupAbortRef.current.abort === 'function') {
        try {
          setupAbortRef.current.abort();
        } catch (e) {
          logger.warn('Error aborting setupUserSession:', e);
        }
        setupAbortRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (hasManuallySwitched.current) return;

    if (!isOrganizationContext && organizationSlug === null) {
      logger.debug('🟢 Staying in AirQo context, skipping org reversion');
      return;
    }

    // Existing logic continues
    if (activeGroup && activeGroup._id) {
      dispatch({ type: 'SET_INITIAL_GROUP_SET' });
      if (!state.sessionReady)
        dispatch({ type: 'SET_SESSION_READY', payload: true });
    } else if (
      userGroupsLength > 0 &&
      !state.initialGroupSet &&
      !lock.current &&
      state.sessionInitialized &&
      !activeGroup
    ) {
      const target = userGroups.find(isAirQoGroup) ?? userGroups[0];
      if (target) {
        logger.debug('✅ Applying fallback group', { group: target });
        setActiveGroupAtomic(target, 'auto-initialization-fallback');
      }
    }
  }, [userGroupsLength, state.initialGroupSet, state.sessionInitialized, state.sessionReady, activeGroup, lock, userGroups, setActiveGroupAtomic, isOrganizationContext, organizationSlug]);

  useEffect(() => {

    let target = null;

    if (isOrganizationContext && organizationSlug) {
      target = findGroupBySlug(userGroups, organizationSlug);
    } else if (session?.user?.activeGroup) {
      target = userGroups.find((g) => g._id === session.user.activeGroup._id);
    }

    if (target) {
      logger.debug("✅ Applying fallback group", { group: target });
      setActiveGroupAtomic(target, 'auto-initialization');
    }

  }, [userGroupsLength, state.initialGroupSet, state.sessionInitialized, organizationSlug, isOrganizationContext, session?.user?.activeGroup, userGroups, setActiveGroupAtomic, activeGroup, lock]);

  useEffect(() => {
    if (!isOrganizationContext || !organizationSlug) {
      if (state.organization || state.organizationLoading) {
        dispatch({ type: 'CLEAR_ORG_DATA' });
      }
      return;
    }

    if (prevOrgSlugRef.current !== organizationSlug) {
      dispatch({ type: 'CLEAR_ORG_DATA' });
      prevOrgSlugRef.current = organizationSlug;
    }

    const debounceMs = 200;
    const currentCache = requestCacheRef.current;
    const cacheKey = organizationSlug;

    let controllerForThisEffect = null;

    const timer = setTimeout(async () => {
      if (!mountedRef.current) return;

      const timeSinceLastFailure = state.organizationLastFailedAt
        ? Date.now() - state.organizationLastFailedAt
        : Infinity;
      const currentBackoff = calculateRetryDelay(state.organizationRetryCount);

      if (
        state.organizationRetryCount > 0 &&
        timeSinceLastFailure < currentBackoff
      ) {
        logger.warn(
          `Rate limiting: waiting ${currentBackoff - timeSinceLastFailure}ms before retry`,
          { organizationSlug, retryCount: state.organizationRetryCount },
        );
        return;
      }

      if (currentCache.has(cacheKey)) {
        logger.info(`Deduplicating request for ${organizationSlug}`);
        return;
      }

      abortRef.current?.abort();
      abortRef.current = new AbortController();
      controllerForThisEffect = abortRef.current;
      const { signal } = controllerForThisEffect;

      currentCache.set(cacheKey, true);

      if (!mountedRef.current) return;
      dispatch({ type: 'SET_ORG_LOADING' });

      try {
        const res = await getOrganizationBySlugApi(organizationSlug, {
          signal,
        });

        if (signal.aborted || !mountedRef.current) return;

        currentCache.delete(cacheKey);

        const org = res.success ? res.data : null;
        const theme = org
          ? {
            name: org.name,
            logo: org.logo,
            primaryColor: org.primaryColor,
            secondaryColor: org.secondaryColor,
            font: org.font,
          }
          : null;

        if (signal.aborted || !mountedRef.current) return;

        currentCache.delete(cacheKey);

        if (res.success && org) {
          orgCacheRef.current.set(organizationSlug, {
            org,
            theme,
            timestamp: Date.now(),
          });

          logger.info('[UnifiedGroupProvider] Cached org data', {
            organizationSlug,
            orgName: org.name,
            cacheSize: orgCacheRef.current.size,
          });
        }

        dispatch({
          type: 'SET_ORG_DATA',
          payload: {
            org,
            theme,
            error: res.success ? null : res.message || 'Organization not found',
            now: Date.now(),
          },
        });
      } catch (error) {
        if (signal.aborted || !mountedRef.current) return;

        currentCache.delete(cacheKey);

        const isRateLimited =
          error.response?.status === 429 ||
          error.message?.includes('rate limit') ||
          error.message?.includes('Too many requests');

        const errorMessage = isRateLimited
          ? 'Too many requests. Please wait.'
          : extractErrorMessage(error);

        dispatch({
          type: 'SET_ORG_DATA',
          payload: {
            error: errorMessage,
            org: null,
            theme: null,
            now: Date.now(),
          },
        });

        if (isRateLimited && mountedRef.current) {
          if (retryTimerRef.current) {
            clearTimeout(retryTimerRef.current);
          }

          const retryDelay = calculateRetryDelay(
            state.organizationRetryCount + 1,
          );
          retryTimerRef.current = setTimeout(() => {
            if (mountedRef.current) {
              dispatch({ type: 'ORG_RETRY_TICK' });
            }
          }, retryDelay);
        }

        logger.error('Organization fetch error:', error);
      }
    }, debounceMs);

    return () => {
      try {
        clearTimeout(timer);
        controllerForThisEffect?.abort();
        currentCache.delete(cacheKey);
        if (retryTimerRef.current) {
          clearTimeout(retryTimerRef.current);
          retryTimerRef.current = null;
        }
      } catch (e) {
        logger.error('Inner-effect cleanup error:', e);
      }
    };
  }, [
    organizationSlug,
    isOrganizationContext,
    state.organizationRetryCount,
    state.organizationLastFailedAt,
    state.organization,
    state.organizationLoading,
    state.organizationRetryNonce,
  ]);

  // Clear switching state when route changes
  useEffect(() => {
    if (state.isSwitching) {
      const timer = setTimeout(() => {
        if (mountedRef.current) {
          dispatch({ type: 'SET_SWITCHING', payload: false });
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [pathname, state.isSwitching]);

  // --- Context Value ---
  const value = useMemo(
    () => ({
      ...state,
      activeGroup,
      userGroups,
      setActiveGroupById,
      handleSignOut,
      switchToGroup,
      refreshGroups,
      isOrganizationContext,
      organizationSlug,
      // pathname may be null during some Next.js transitions; guard startsWith
      isAdminContext:
        typeof pathname === 'string' ? pathname.startsWith('/admin') : false,
      getGroupRoute: groupRoute,
      canSwitchToGroup,
      primaryColor:
        state.organizationTheme?.primaryColor ||
        state.organization?.primaryColor ||
        '#135DFF',
      secondaryColor:
        state.organizationTheme?.secondaryColor ||
        state.organization?.secondaryColor ||
        '#1B2559',
      logo:
        state.organizationTheme?.logo ||
        state.organization?.logo ||
        '/icons/airqo_logo.svg',
    }),
    [
      state,
      activeGroup,
      userGroups,
      setActiveGroupById,
      handleSignOut,
      switchToGroup,
      refreshGroups,
      isOrganizationContext,
      organizationSlug,
      pathname,
      canSwitchToGroup,
    ],
  );

  // --- Loading & Error States ---
  const themeComplete =
    state.organizationTheme?.primaryColor &&
    state.organizationTheme?.secondaryColor &&
    state.organizationTheme?.logo;

  // Show a loader during the sign-out process
  if (isSigningOut) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" text="Signing out..." />
      </div>
    );
  }

  const showLoader =
    isOrganizationContext &&
    !state.isSwitching &&
    (state.organizationLoading ||
      (!themeComplete && !state.organizationError && state.organization));

  // Session initialization loader (show while setting up user session)
  // Also show while initial group is being set to prevent premature UI display
  // Show loader only when session has not been initialized AND there's no activeGroup yet.
  // Previously this used an OR which caused the provider to keep showing the
  // "Setting up your session..." overlay even when an activeGroup had already
  // been set (for example by `setupUserSession`). That prevented children from
  // rendering and blocked redirects until a full page reload. Use && here so
  // children can render as soon as an activeGroup exists.
  if (
    sessionStatus === 'authenticated' &&
    !isAuthRoute &&
    !activeGroup?._id &&
    (!state.sessionInitialized || userGroupsLength === 0)
  ) {
    const loadingText = 'Setting up your session…';
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" text={loadingText} />
      </div>
    );
  }

  // Organization switch loader (highest priority)
  if (state.isSwitching && activeGroup) {
    return (
      <OrganizationSwitchLoader
        organizationName={activeGroup?.grp_title || 'Organization'}
        primaryColor={
          state.organizationTheme?.primaryColor ||
          state.organization?.primaryColor ||
          '#135DFF'
        }
      />
    );
  }

  // Organization data loader
  if (showLoader) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" text="Loading organization…" />
      </div>
    );
  }

  // Organization not found
  if (
    isOrganizationContext &&
    state.organizationInitialized &&
    (!state.organization || state.organizationError)
  ) {
    return <OrganizationNotFound orgSlug={organizationSlug} />;
  }

  return <ctx.Provider value={value}>{children}</ctx.Provider>;
}

UnifiedGroupProvider.propTypes = { children: PropTypes.node.isRequired };

// --- Public Hooks ---
export const useUnifiedGroup = () => {
  const context = useContext(ctx);
  if (!context) {
    throw new Error('useUnifiedGroup must be used within UnifiedGroupProvider');
  }
  return context;
};

// Safe variant: returns null instead of throwing when provider is not present.
export const useUnifiedGroupSafe = () => {
  const context = useContext(ctx);
  return context || null;
};

// Legacy hooks (unchanged API)
export const useGetActiveGroup = () => {
  const context = useContext(ctx);
  const { data: session } = useSession();

  // Handle context not being available
  if (!context) {
    logger.error('useGetActiveGroup: Provider not available');
    return {
      loading: false,
      error: 'Provider not available',
      id: null,
      title: null,
      userID: session?.user?.id || null,
      groupList: [],
      activeGroup: null,
    };
  }

  const { activeGroup, userGroups, isLoading, error } = context;

  return {
    loading: isLoading,
    error,
    id: activeGroup?._id || null,
    title: activeGroup?.grp_title || null,
    userID: session?.user?.id || null,
    groupList: Array.isArray(userGroups) ? userGroups : [],
    activeGroup,
  };
};

export const useOrganizationSafe = () => {
  const {
    organization,
    organizationTheme,
    organizationLoading,
    organizationError,
    organizationInitialized,
    isOrganizationContext,
    primaryColor,
    secondaryColor,
    logo,
    organizationSlug,
  } = useUnifiedGroup();

  if (!isOrganizationContext) {
    return {
      organization: null,
      theme: organizationTheme,
      isLoading: false,
      error: organizationError,
      isInitialized: true,
      primaryColor: '#135DFF',
      secondaryColor: '#1B2559',
      logo: '/icons/airqo_logo.svg',
      organizationSlug: null,
      getDisplayName: () => 'AirQo',
      canUserRegister: () => false,
      requiresApproval: () => false,
      isOrgContext: false,
    };
  }

  return {
    organization,
    theme: organizationTheme,
    isLoading: organizationLoading,
    error: organizationError,
    isInitialized: organizationInitialized,
    primaryColor,
    secondaryColor,
    logo,
    organizationSlug,
    getDisplayName: () =>
      organization?.parent
        ? `${organization.parent.name} - ${organization.name}`
        : organization?.name || organization?.grp_title || 'AirQo',
    canUserRegister: () =>
      organization?.settings?.allowSelfRegistration || false,
    requiresApproval: () => organization?.settings?.requireApproval || false,
    isOrgContext: true,
  };
};

export default UnifiedGroupProvider;
