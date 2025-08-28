'use client';

import React, {
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
import LoadingSpinner from '@/components/LoadingSpinner';
import OrganizationNotFound from '@/components/Organization/OrganizationNotFound';
import OrganizationSwitchLoader from '@/common/components/Organization/OrganizationSwitchLoader';
import logger from '@/lib/logger';

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

const findGroupBySlug = (groups, slug) =>
  groups?.find?.((g) => {
    if (isAirQoGroup(g)) return false;
    return (
      (g.organization_slug || g.grp_slug || titleToSlug(g.grp_title)) === slug
    );
  });

// --- Reducer ---
const initialState = {
  isLoading: false,
  error: null,
  isSwitching: false,
  initialGroupSet: false,
  organization: null,
  organizationTheme: null,
  organizationLoading: false,
  organizationError: null,
  organizationInitialized: false,
  organizationRetryCount: 0,
  organizationLastFailedAt: null,
  organizationRequestCache: new Map(),
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
        organizationLastFailedAt: action.payload.error ? Date.now() : null,
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
    default:
      return state;
  }
};

// --- Provider ---
export function UnifiedGroupProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const rdxDispatch = useDispatch();
  const { data: session, status: sessionStatus } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  const activeGroup = useSelector(selectActiveGroup);
  const userGroups = useSelector(selectUserGroups);
  const lock = useRef(false);
  const abortRef = useRef(null);

  const organizationSlug = useMemo(() => extractOrgSlug(pathname), [pathname]);
  const isOrganizationContext = Boolean(organizationSlug);

  // --- Core Logic ---
  const refreshGroups = useCallback(
    async (force = false) => {
      if (
        sessionStatus !== 'authenticated' ||
        !session?.user?.id ||
        (!force && state.isLoading) ||
        lock.current
      )
        return;

      lock.current = true;
      dispatch({ type: 'SET_GROUPS_LOADING', payload: true });

      try {
        if (!userGroups.length || force) {
          await rdxDispatch(fetchUserGroups(session.user.id)).unwrap();
        }
        dispatch({ type: 'SET_GROUPS_LOADING', payload: false });
      } catch (error) {
        logger.error('refreshGroups error:', error);
        dispatch({ type: 'SET_GROUPS_ERROR', payload: error.message });

        if (error?.status === 401 || error?.message?.includes?.('401')) {
          signOut({ callbackUrl: '/user/login' }).catch(logger.error);
        }
      } finally {
        lock.current = false;
      }
    },
    [
      rdxDispatch,
      sessionStatus,
      session?.user?.id,
      userGroups.length,
      state.isLoading,
    ],
  );

  const setActiveGroupAtomic = useCallback(
    (group, reason) => {
      if (!group || lock.current) return;
      logger.debug('setActiveGroupAtomic', { group: group.grp_title, reason });
      lock.current = true;
      rdxDispatch(setActiveGroupAction(group));
      rdxDispatch(setOrganizationName(group.grp_title));
      dispatch({ type: 'SET_INITIAL_GROUP_SET' });
      lock.current = false;
    },
    [rdxDispatch],
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
      )
        return { success: false, error: 'Invalid or duplicate' };

      lock.current = true;
      dispatch({ type: 'SET_SWITCHING', payload: true });

      try {
        const isAirQo = isAirQoGroup(target);

        rdxDispatch(setActiveGroupAction(target));
        rdxDispatch(setOrganizationName(target.grp_title));
        rdxDispatch(setChartSites([]));
        if (!isAirQo) rdxDispatch(resetChartStore());

        // Calculate target route outside of navigate condition
        const targetRoute = groupRoute(target);

        if (navigate) {
          // Force navigation to ensure proper layout loading
          const currentPath = pathname;

          // Only navigate if we're actually changing routes
          if (currentPath !== targetRoute) {
            // Add a delay to allow UI to update before navigation
            await new Promise((resolve) => setTimeout(resolve, 150));
            router.push(targetRoute);
            // Don't clear loading immediately - let route change effect handle it
          } else {
            // Same route, just clear switching state
            lock.current = false;
            dispatch({ type: 'SET_SWITCHING', payload: false });
          }
        } else {
          // If not navigating, clear switching state immediately
          lock.current = false;
          dispatch({ type: 'SET_SWITCHING', payload: false });
        }

        await rdxDispatch(
          replaceUserPreferences({
            user_id: session.user.id,
            group_id: target._id,
          }),
        );

        if (opts.fetchDetails) {
          await rdxDispatch(fetchGroupDetails(target._id));
        }

        return { success: true, targetRoute };
      } catch (error) {
        logger.error('switchToGroup error:', error);
        lock.current = false;
        dispatch({ type: 'SET_SWITCHING', payload: false });
        return { success: false, error: error.message };
      }
    },
    [
      rdxDispatch,
      session?.user?.id,
      activeGroup,
      state.isSwitching,
      router,
      pathname,
    ],
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

  // --- Effects ---
  useEffect(() => {
    if (
      sessionStatus === 'authenticated' &&
      session?.user?.id &&
      !userGroups.length
    ) {
      refreshGroups();
    }
  }, [sessionStatus, session?.user?.id, userGroups.length, refreshGroups]);

  useEffect(() => {
    if (!userGroups.length || state.initialGroupSet || lock.current) return;

    let target = null;
    if (isOrganizationContext && organizationSlug) {
      target = findGroupBySlug(userGroups, organizationSlug);
    } else if (session?.user?.activeGroup) {
      target = userGroups.find((g) => g._id === session.user.activeGroup._id);
    }

    if (!target) target = userGroups.find(isAirQoGroup) ?? userGroups[0];
    if (target) setActiveGroupAtomic(target, 'auto');
  }, [
    userGroups,
    organizationSlug,
    isOrganizationContext,
    session?.user?.activeGroup,
    state.initialGroupSet,
    setActiveGroupAtomic,
  ]);

  // Organization data fetching with rate limiting protection
  useEffect(() => {
    if (!isOrganizationContext || !organizationSlug) {
      if (state.organization || state.organizationLoading) {
        dispatch({ type: 'CLEAR_ORG_DATA' });
      }
      return;
    }

    // Rate limiting logic - check if we should wait before making another request
    const timeSinceLastFailure = state.organizationLastFailedAt
      ? Date.now() - state.organizationLastFailedAt
      : Infinity;

    // Exponential backoff: 1s, 2s, 4s, 8s, 16s, then 5 minutes
    const backoffDelays = [1000, 2000, 4000, 8000, 16000, 300000];
    const currentBackoff =
      backoffDelays[
        Math.min(state.organizationRetryCount, backoffDelays.length - 1)
      ];

    if (
      state.organizationRetryCount > 0 &&
      timeSinceLastFailure < currentBackoff
    ) {
      logger.warn(
        `Rate limiting: waiting ${currentBackoff - timeSinceLastFailure}ms before retry`,
        {
          organizationSlug,
          retryCount: state.organizationRetryCount,
          timeSinceLastFailure,
          currentBackoff,
        },
      );
      return;
    }

    // Check cache for pending requests (deduplication)
    const cacheKey = organizationSlug;
    if (state.organizationRequestCache.has(cacheKey)) {
      logger.info(`Deduplicating request for ${organizationSlug}`);
      return;
    }

    // Abort previous request
    abortRef.current?.abort?.();
    abortRef.current = new AbortController();
    const { signal } = abortRef.current;

    // Add to cache to prevent duplicate requests
    state.organizationRequestCache.set(cacheKey, true);

    dispatch({ type: 'SET_ORG_LOADING' });

    getOrganizationBySlugApi(organizationSlug, { signal })
      .then((res) => {
        if (signal.aborted) return;

        // Clear from cache on completion
        state.organizationRequestCache.delete(cacheKey);

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

        dispatch({
          type: 'SET_ORG_DATA',
          payload: {
            org,
            theme,
            error: res.success ? null : res.message || 'Organization not found',
          },
        });
      })
      .catch((error) => {
        if (!signal.aborted) {
          // Clear from cache on error
          state.organizationRequestCache.delete(cacheKey);

          // Check if it's a rate limiting error
          const isRateLimited =
            error.response?.status === 429 ||
            error.message?.includes('rate limit') ||
            error.message?.includes('Too many requests');

          if (isRateLimited) {
            logger.error('Rate limited by server:', {
              organizationSlug,
              retryCount: state.organizationRetryCount,
              error: error.message,
            });
          } else {
            logger.error('Organization fetch error:', error);
          }

          dispatch({
            type: 'SET_ORG_DATA',
            payload: {
              error: isRateLimited
                ? 'Too many requests. Please wait.'
                : error.message,
              org: null,
              theme: null,
            },
          });
        }
      });

    return () => {
      abortRef.current?.abort?.(); // Cleanup on unmount/change
      state.organizationRequestCache.delete(cacheKey);
    };
  }, [
    organizationSlug,
    isOrganizationContext,
    state.organizationRetryCount,
    state.organizationLastFailedAt,
  ]); // These are the only dependencies we want to trigger re-fetching

  // Clear switching state when route changes (organization switch complete)
  useEffect(() => {
    if (state.isSwitching) {
      // Use setTimeout to ensure route change is complete
      const timer = setTimeout(() => {
        lock.current = false;
        dispatch({ type: 'SET_SWITCHING', payload: false });
      }, 1000); // Longer delay to ensure complete transition and avoid loader conflicts

      return () => clearTimeout(timer);
    }
  }, [pathname, state.isSwitching]);

  // --- Render ---
  const value = useMemo(
    () => ({
      ...state,
      activeGroup,
      userGroups,
      setActiveGroupById,
      switchToGroup,
      refreshGroups,
      isOrganizationContext,
      organizationSlug,
      isAdminContext: pathname?.startsWith?.('/admin'),
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
  const showLoader =
    isOrganizationContext &&
    !state.isSwitching && // Don't show loader if switching (switching loader has priority)
    (state.organizationLoading ||
      (!themeComplete && !state.organizationError && state.organization));

  // Show organization switch loader when switching groups (highest priority)
  if (state.isSwitching && activeGroup) {
    return (
      <OrganizationSwitchLoader
        organizationName={activeGroup.grp_title || 'Organization'}
        primaryColor={
          state.organizationTheme?.primaryColor ||
          state.organization?.primaryColor ||
          '#135DFF'
        }
      />
    );
  }

  // Show organization data loader when not switching
  if (showLoader) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" text="Loading organization…" />
      </div>
    );
  }

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

// Legacy hooks (unchanged API)
export const useGetActiveGroup = () => {
  const { activeGroup, userGroups, isLoading, error } = useUnifiedGroup();
  const { data: session } = useSession();
  return {
    loading: isLoading,
    error,
    id: activeGroup?._id || null,
    title: activeGroup?.grp_title || null,
    userID: session?.user?.id || null,
    groupList: userGroups,
    activeGroup,
  };
};

export const useOrganization = () => {
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
  } = useUnifiedGroup();

  if (!isOrganizationContext) {
    throw new Error('useOrganization must be used within /org/ context');
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
    getDisplayName: () =>
      organization?.parent
        ? `${organization.parent.name} - ${organization.name}`
        : organization?.name || organization?.grp_title || 'AirQo',
    canUserRegister: () =>
      organization?.settings?.allowSelfRegistration || false,
    requiresApproval: () => organization?.settings?.requireApproval || false,
  };
};

export default UnifiedGroupProvider;
