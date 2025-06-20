'use client';

import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import PropTypes from 'prop-types';

// Redux imports
import {
  setActiveGroup,
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

// Utils
import { isAirQoGroup, titleToSlug } from '@/core/utils/organizationUtils';
// API imports
import { getOrganizationBySlugApi } from '@/core/apis/Organizations';
// Components
import LoadingSpinner from '@/components/LoadingSpinner';
import OrganizationNotFound from '@/components/Organization/OrganizationNotFound';
import logger from '@/lib/logger';

const UnifiedGroupContext = createContext({
  // Group state
  activeGroup: null,
  userGroups: [],
  isLoading: false,
  error: null,

  // Group actions
  setActiveGroupById: () => {},
  switchToGroup: () => {},
  refreshGroups: () => {},

  // Organization detection
  isOrganizationContext: false,
  organizationSlug: null,

  // Organization data
  organization: null,
  organizationTheme: null,
  organizationLoading: false,
  organizationError: null,
  organizationInitialized: false,

  // Route helpers
  getGroupRoute: () => '',
  canSwitchToGroup: () => false,

  // Admin flow support
  isAdminContext: false,

  // Loading states
  isSwitching: false,
});

/**
 * Utility function to extract organization slug from pathname
 */
const extractOrgSlug = (pathname) => {
  if (!pathname) return null;

  // Handle different organization URL patterns:
  // - /org/[slug]/...
  // - /(organization)/org/[slug]/...
  // - /admin/... (for admin context)
  const orgMatch = pathname.match(/\/org\/([^/]+)/);
  if (orgMatch) {
    return orgMatch[1];
  }

  return null;
};

/**
 * Find group by organization slug
 */
const findGroupBySlug = (groups, slug) => {
  if (!groups || !slug) return null;

  return groups.find((group) => {
    const groupSlug = titleToSlug(group.grp_title);
    return groupSlug === slug;
  });
};

/**
 * Determine the appropriate route for a group
 */
const getRouteForGroup = (group) => {
  if (!group) return '/user/Home';

  // AirQo group always uses user flow
  if (isAirQoGroup(group)) {
    return '/user/Home';
  }

  // For non-AirQo groups, use organization flow
  const groupSlug = group.organization_slug || titleToSlug(group.grp_title);
  if (!groupSlug || groupSlug === 'default') {
    logger.warn(
      'getRouteForGroup: Invalid slug for non-AirQo group, using fallback',
      {
        group: group.grp_title,
        organizationSlug: group.organization_slug,
        generatedSlug: titleToSlug(group.grp_title),
      },
    );
    return '/user/Home';
  }

  return `/org/${groupSlug}/dashboard`;
};

/**
 * Unified Group Provider - Consolidates all group/organization management
 *
 * Features:
 * - Centralized group state management with proper debouncing
 * - URL-based organization detection
 * - Smart group switching with atomic updates
 * - Support for user, organization, and admin flows
 * - Memory leak prevention with proper cleanup
 * - Race condition prevention with state synchronization
 */
export function UnifiedGroupProvider({ children }) {
  const dispatch = useDispatch();
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  // Redux state
  const activeGroup = useSelector(selectActiveGroup);
  const userGroups = useSelector(selectUserGroups);

  // Local state - optimized for consistency
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSwitching, setIsSwitching] = useState(false);
  const [initialGroupSet, setInitialGroupSet] = useState(false);

  // Organization state
  const [organization, setOrganization] = useState(null);
  const [organizationTheme, setOrganizationTheme] = useState(null);
  const [organizationLoading, setOrganizationLoading] = useState(false);
  const [organizationError, setOrganizationError] = useState(null);
  const [organizationInitialized, setOrganizationInitialized] = useState(false);

  // Refs for cleanup and state coordination
  const switchTimeoutRef = useRef(null);
  const lastGroupSwitchRef = useRef(null);
  const mountedRef = useRef(true);
  const groupUpdateLockRef = useRef(false); // Prevents concurrent group updates
  const loadingOrgSlugRef = useRef(null); // Tracks currently loading organization slug  // Context detection
  const { isOrganizationContext, organizationSlug, isAdminContext } =
    useMemo(() => {
      const isOrgContext =
        pathname?.includes('/org/') || pathname?.startsWith('/org/');
      const isAdmin =
        pathname?.includes('/admin') || pathname?.startsWith('/admin');
      const orgSlug = extractOrgSlug(pathname);

      // Debug logging for context detection
      if (isOrgContext) {
        logger.info('Organization context detected:', {
          pathname,
          orgSlug,
          isOrgContext,
        });
      }

      return {
        isOrganizationContext: isOrgContext,
        organizationSlug: orgSlug,
        isAdminContext: isAdmin,
      };
    }, [pathname]);

  // Optimized groups refresh with proper error handling
  const refreshGroups = useCallback(async () => {
    if (!session?.user?.id || isLoading || groupUpdateLockRef.current) return;

    groupUpdateLockRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      if (userGroups.length === 0) {
        await dispatch(fetchUserGroups(session.user.id)).unwrap();
      }
    } catch (err) {
      logger.error('Failed to fetch user groups:', err);
      setError(err.message || 'Failed to fetch groups');
    } finally {
      setIsLoading(false);
      groupUpdateLockRef.current = false;
    }
  }, [session?.user?.id, dispatch, userGroups.length, isLoading]);

  // Initial groups fetch - only once per session
  useEffect(() => {
    if (
      session?.user?.id &&
      userGroups.length === 0 &&
      !groupUpdateLockRef.current
    ) {
      refreshGroups();
    }
  }, [session?.user?.id, userGroups.length, refreshGroups]);

  // Atomic active group setting to prevent conflicts
  const setActiveGroupAtomic = useCallback(
    (targetGroup, reason = 'manual') => {
      if (!targetGroup || groupUpdateLockRef.current) return;

      groupUpdateLockRef.current = true;

      try {
        logger.info('UnifiedGroupProvider: Setting active group atomically:', {
          group: targetGroup.grp_title,
          groupId: targetGroup._id,
          reason,
          previousGroup: activeGroup?.grp_title,
        });

        // Single atomic Redux update
        dispatch(setActiveGroup(targetGroup));
        dispatch(setOrganizationName(targetGroup.grp_title));

        setInitialGroupSet(true);
      } catch (error) {
        logger.error('Failed to set active group atomically:', error);
      } finally {
        groupUpdateLockRef.current = false;
      }
    },
    [dispatch, activeGroup?.grp_title],
  );
  // Smart active group initialization - only runs once per session
  useEffect(() => {
    if (
      !session?.user?.id ||
      userGroups.length === 0 ||
      initialGroupSet ||
      groupUpdateLockRef.current
    ) {
      return;
    }

    let targetGroup = null;

    // Priority 1: URL-based group selection (organization context)
    if (isOrganizationContext && organizationSlug) {
      targetGroup = findGroupBySlug(userGroups, organizationSlug);
      if (targetGroup) {
        setActiveGroupAtomic(targetGroup, 'url-based');
        return;
      }
    }

    // Priority 2: Session active group (if valid)
    if (session.user.activeGroup) {
      targetGroup = userGroups.find(
        (g) => g._id === session.user.activeGroup._id,
      );
      if (targetGroup) {
        setActiveGroupAtomic(targetGroup, 'session-based');
        return;
      }
    }

    // Priority 3: Fallback to AirQo or first available group
    const airqoGroup = userGroups.find(isAirQoGroup);
    targetGroup = airqoGroup || userGroups[0];

    if (targetGroup) {
      setActiveGroupAtomic(targetGroup, 'fallback');
    }
  }, [
    session?.user?.id,
    session?.user?.activeGroup,
    userGroups,
    isOrganizationContext,
    organizationSlug,
    initialGroupSet,
    setActiveGroupAtomic,
  ]);

  // Simplified URL synchronization - avoid conflicts during switching
  useEffect(() => {
    if (
      !isOrganizationContext ||
      !organizationSlug ||
      !userGroups.length ||
      !initialGroupSet ||
      isSwitching ||
      groupUpdateLockRef.current
    ) {
      return;
    }

    const urlGroup = findGroupBySlug(userGroups, organizationSlug);

    // Only sync if URL group exists and is different from active group
    if (
      urlGroup &&
      activeGroup &&
      urlGroup._id !== activeGroup._id &&
      !isAirQoGroup(activeGroup) // Don't override AirQo group navigation
    ) {
      setActiveGroupAtomic(urlGroup, 'url-sync');
    }
  }, [
    isOrganizationContext,
    organizationSlug,
    userGroups,
    activeGroup,
    initialGroupSet,
    isSwitching,
    setActiveGroupAtomic,
  ]);
  // Optimized group switching with atomic updates and proper cleanup
  const switchToGroup = useCallback(
    async (targetGroup, options = {}) => {
      if (
        !targetGroup ||
        !session?.user?.id ||
        isSwitching ||
        groupUpdateLockRef.current
      ) {
        return { success: false, error: 'Invalid group or switch in progress' };
      }

      // Prevent rapid switches
      const now = Date.now();
      if (
        lastGroupSwitchRef.current &&
        now - lastGroupSwitchRef.current < 1000
      ) {
        return { success: false, error: 'Too many rapid switches' };
      }
      lastGroupSwitchRef.current = now;

      // If it's the same group, no need to switch
      if (activeGroup && activeGroup._id === targetGroup._id) {
        return { success: true, message: 'Already active group' };
      }

      // Lock switching state
      setIsSwitching(true);
      groupUpdateLockRef.current = true;

      try {
        const isTargetAirQo = isAirQoGroup(targetGroup);
        const isCurrentAirQo = activeGroup ? isAirQoGroup(activeGroup) : false;
        const targetRoute = getRouteForGroup(targetGroup);

        logger.info('UnifiedGroupProvider: Switching group:', {
          from: activeGroup?.grp_title,
          to: targetGroup.grp_title,
          route: targetRoute,
          isTargetAirQo,
          isCurrentAirQo,
        });

        // 1. Atomic Redux updates - all at once to prevent inconsistencies
        dispatch(setActiveGroup(targetGroup));
        dispatch(setOrganizationName(targetGroup.grp_title));
        dispatch(setChartSites([]));

        if (!isTargetAirQo) {
          dispatch(resetChartStore());
        }

        // 2. Navigate if route change is needed
        const shouldNavigate =
          options.navigate !== false &&
          (isTargetAirQo !== isCurrentAirQo || !isTargetAirQo);

        if (shouldNavigate) {
          await router.push(targetRoute);
        }

        // 3. Update user preferences in background (non-blocking)
        const updatePreferences = async () => {
          try {
            await dispatch(
              replaceUserPreferences({
                user_id: session.user.id,
                group_id: targetGroup._id,
              }),
            );

            if (options.fetchDetails) {
              await dispatch(fetchGroupDetails(targetGroup._id));
            }

            logger.info(
              'UnifiedGroupProvider: Group switch completed successfully:',
              {
                group: targetGroup.grp_title,
                route: targetRoute,
              },
            );
          } catch (prefError) {
            logger.warn(
              'Failed to update preferences after group switch:',
              prefError,
            );
          }
        };

        // Use timeout to ensure UI updates complete before preferences update
        if (switchTimeoutRef.current) {
          clearTimeout(switchTimeoutRef.current);
        }

        switchTimeoutRef.current = setTimeout(() => {
          if (mountedRef.current) {
            updatePreferences();
            switchTimeoutRef.current = null;
          }
        }, 300);

        return { success: true, targetRoute };
      } catch (error) {
        logger.error('Group switching failed:', error);

        // Clear any pending timeouts on error
        if (switchTimeoutRef.current) {
          clearTimeout(switchTimeoutRef.current);
          switchTimeoutRef.current = null;
        }

        // Fallback: try to switch to AirQo group
        try {
          const airqoGroup = userGroups.find(isAirQoGroup);
          if (airqoGroup && airqoGroup._id !== targetGroup._id) {
            logger.info(
              'UnifiedGroupProvider: Attempting fallback to AirQo group',
            );
            dispatch(setActiveGroup(airqoGroup));
            dispatch(setOrganizationName(airqoGroup.grp_title));
            await router.push('/user/Home');
          }
        } catch (fallbackError) {
          logger.error('Fallback group switch failed:', fallbackError);
        }

        return { success: false, error: error.message };
      } finally {
        // Always clear switching state
        if (mountedRef.current) {
          setIsSwitching(false);
          groupUpdateLockRef.current = false;
        }
      }
    },
    [activeGroup, session?.user?.id, dispatch, router, userGroups, isSwitching],
  );

  // Helper function to set active group by ID
  const setActiveGroupById = useCallback(
    async (groupId, options = {}) => {
      if (!userGroups.length)
        return { success: false, error: 'No groups loaded' };

      const targetGroup = userGroups.find((g) => g._id === groupId);
      if (!targetGroup) {
        return { success: false, error: 'Group not found' };
      }

      return await switchToGroup(targetGroup, options);
    },
    [userGroups, switchToGroup],
  );

  // Helper function to get route for a group
  const getGroupRoute = useCallback((group) => {
    return getRouteForGroup(group);
  }, []);

  // Helper function to check if user can switch to a group
  const canSwitchToGroup = useCallback(
    (group) => {
      if (!group || !userGroups.length) return false;
      return userGroups.some((g) => g._id === group._id);
    },
    [userGroups],
  ); // Organization data loading effect - optimized with debounced error handling
  useEffect(() => {
    if (isOrganizationContext && organizationSlug) {
      // Reset state when slug changes or when we need to load new organization
      if (
        !organization ||
        organization.slug !== organizationSlug ||
        organization.organization_slug !== organizationSlug
      ) {
        // Prevent overlapping requests for the same slug
        if (loadingOrgSlugRef.current === organizationSlug) {
          return;
        }

        logger.info('Loading organization data for slug:', organizationSlug);
        setOrganizationLoading(true);
        setOrganizationError(null);
        setOrganizationInitialized(false);
        loadingOrgSlugRef.current = organizationSlug;

        // Minimum loading time to prevent UI flashing (400ms for more stable experience)
        const startTime = Date.now();
        const minLoadingTime = 400;

        getOrganizationBySlugApi(organizationSlug)
          .then((response) => {
            if (
              !mountedRef.current ||
              loadingOrgSlugRef.current !== organizationSlug
            ) {
              return; // Ignore if component unmounted or slug changed
            }

            if (response.success && response.data) {
              const orgData = response.data;
              logger.info('Organization data loaded successfully:', {
                name: orgData.name,
                slug: orgData.slug,
              });

              // Calculate remaining time to maintain minimum loading duration
              const elapsedTime = Date.now() - startTime;
              const remainingTime = Math.max(0, minLoadingTime - elapsedTime);

              setTimeout(() => {
                if (
                  !mountedRef.current ||
                  loadingOrgSlugRef.current !== organizationSlug
                ) {
                  return; // Double-check before setting state
                }

                setOrganization(orgData);
                setOrganizationTheme({
                  name: orgData.name,
                  logo: orgData.logo,
                  primaryColor: orgData.primaryColor,
                  secondaryColor: orgData.secondaryColor,
                  font: orgData.font,
                });
                setOrganizationError(null);
                setOrganizationLoading(false);
                setOrganizationInitialized(true);
                loadingOrgSlugRef.current = null; // Clear loading state
              }, remainingTime);
            } else {
              throw new Error(response.message || 'Organization not found');
            }
          })
          .catch((err) => {
            if (
              !mountedRef.current ||
              loadingOrgSlugRef.current !== organizationSlug
            ) {
              return; // Ignore if component unmounted or slug changed
            }

            logger.error('Error loading organization:', err);

            // Calculate remaining time to maintain minimum loading duration
            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, minLoadingTime - elapsedTime);

            // Delay error display to prevent flashing
            setTimeout(() => {
              if (
                !mountedRef.current ||
                loadingOrgSlugRef.current !== organizationSlug
              ) {
                return; // Double-check before setting state
              }

              setOrganizationError(err);
              setOrganization(null);
              setOrganizationTheme(null);
              setOrganizationLoading(false);
              setOrganizationInitialized(true);
              loadingOrgSlugRef.current = null; // Clear loading state
            }, remainingTime);
          });
      }
    } else if (!isOrganizationContext) {
      // Clear organization data when not in organization context
      setOrganization(null);
      setOrganizationTheme(null);
      setOrganizationError(null);
      setOrganizationLoading(false);
      setOrganizationInitialized(false);
      loadingOrgSlugRef.current = null;
    }
  }, [isOrganizationContext, organizationSlug]); // Removed 'organization' from deps to avoid unnecessary re-runs

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      groupUpdateLockRef.current = false;
      loadingOrgSlugRef.current = null;
      if (switchTimeoutRef.current) {
        clearTimeout(switchTimeoutRef.current);
        switchTimeoutRef.current = null;
      }
    };
  }, []);
  const contextValue = useMemo(
    () => ({
      // Group state
      activeGroup,
      userGroups,
      isLoading,
      error,

      // Group actions
      setActiveGroupById,
      switchToGroup,
      refreshGroups,

      // Organization detection
      isOrganizationContext,
      organizationSlug,

      // Organization data
      organization,
      organizationTheme,
      organizationLoading,
      organizationError,
      organizationInitialized,

      // Route helpers
      getGroupRoute,
      canSwitchToGroup,

      // Admin flow support
      isAdminContext,

      // Loading states
      isSwitching,

      // Essential organization helpers (optimized)
      primaryColor:
        organizationTheme?.primaryColor ||
        organization?.primaryColor ||
        '#135DFF',
      secondaryColor:
        organizationTheme?.secondaryColor ||
        organization?.secondaryColor ||
        '#1B2559',
      logo:
        organizationTheme?.logo ||
        organization?.logo ||
        '/icons/airqo_logo.svg',
    }),
    [
      activeGroup,
      userGroups,
      isLoading,
      error,
      setActiveGroupById,
      switchToGroup,
      refreshGroups,
      isOrganizationContext,
      organizationSlug,
      organization,
      organizationTheme,
      organizationLoading,
      organizationError,
      organizationInitialized,
      getGroupRoute,
      canSwitchToGroup,
      isAdminContext,
      isSwitching,
    ],
  );

  // Handle organization loading and errors with improved logic
  if (isOrganizationContext && organizationLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" text="Loading organization..." />
      </div>
    );
  }

  // Only show error state if:
  // 1. We're in organization context
  // 2. Organization loading is complete (organizationInitialized)
  // 3. There's an error OR we have a slug but no organization data
  if (
    isOrganizationContext &&
    organizationInitialized &&
    (organizationError || (organizationSlug && !organization))
  ) {
    return <OrganizationNotFound orgSlug={organizationSlug || ''} />;
  }

  return (
    <UnifiedGroupContext.Provider value={contextValue}>
      {children}
    </UnifiedGroupContext.Provider>
  );
}

/**
 * Main hook to access the unified group context
 */
export function useUnifiedGroup() {
  const context = useContext(UnifiedGroupContext);
  if (!context) {
    throw new Error(
      'useUnifiedGroup must be used within a UnifiedGroupProvider',
    );
  }
  return context;
}

/**
 * Legacy hook for backward compatibility
 * @deprecated Use useUnifiedGroup instead
 */
export function useGetActiveGroup() {
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
}

/**
 * Organization hook for organization context only
 * @deprecated Use useUnifiedGroup instead for new code
 */
export function useOrganization() {
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

  // Allow usage in organization context, especially during loading
  // Only throw error if we're definitely not in org context
  if (!isOrganizationContext) {
    throw new Error(
      'useOrganization must be used within an organization context (routes starting with /org/)',
    );
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
    // Add the missing getDisplayName function
    getDisplayName: () => {
      if (organization?.parent) {
        return `${organization.parent.name} - ${organization.name}`;
      }
      return organization?.name || organization?.grp_title || 'AirQo';
    },
    // Add additional helper functions that auth pages might need
    canUserRegister: () =>
      organization?.settings?.allowSelfRegistration || false,
    requiresApproval: () => organization?.settings?.requireApproval || false,
  };
}

UnifiedGroupProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default UnifiedGroupProvider;
