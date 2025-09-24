import {
  getUserDetails,
  getUserGroupPermissionsApi,
} from '@/core/apis/Account';
import { getOrganizationThemePreferencesApi } from '@/core/apis/Organizations';
import {
  setUserInfo,
  setSuccess,
  setError,
  resetStore,
} from '@/lib/store/services/account/LoginSlice';
import {
  setActiveGroup,
  setUserGroups,
  clearAllGroupData,
} from '@/lib/store/services/groups';
import {
  setOrganizationTheme,
  setOrganizationThemeLoading,
  setOrganizationThemeError,
  clearOrganizationTheme,
} from '@/lib/store/services/organizationTheme/OrganizationThemeSlice';
import {
  setPermissionsData,
  setPermissionsError,
  clearPermissions,
} from '@/lib/store/services/permissions/PermissionsSlice';
import { setChartSites } from '@/lib/store/services/charts/ChartSlice';
import { getIndividualUserPreferences } from '@/lib/store/services/account/UserDefaultsSlice';
// Simple route type constants (replacing removed sessionUtils.js)
const ROUTE_TYPES = {
  USER: 'user',
  ORGANIZATION: 'organization',
  PUBLIC: 'public',
  AUTH: 'auth',
};

// Simple route type detection
const getRouteType = (pathname) => {
  if (!pathname || typeof pathname !== 'string') return ROUTE_TYPES.PUBLIC;

  if (
    pathname.includes('/login') ||
    pathname.includes('/register') ||
    pathname.includes('/auth')
  ) {
    return ROUTE_TYPES.AUTH;
  }

  if (pathname.includes('/org/') || pathname.includes('(organization)')) {
    return ROUTE_TYPES.ORGANIZATION;
  }

  if (pathname.includes('/user/') || pathname.includes('(individual)')) {
    return ROUTE_TYPES.USER;
  }

  return ROUTE_TYPES.PUBLIC;
};
import { isAirQoGroup } from '@/core/utils/organizationUtils';
import logger from '@/lib/logger';

/**
 * Utility function to convert organization title to URL slug
 */
const titleToSlug = (title) => {
  if (!title) return '';
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Load user permissions in the background
 */
const loadUserPermissions = async (session, groupId, dispatch) => {
  try {
    logger.debug('Loading user permissions...');
    const permissionsRes = await getUserGroupPermissionsApi({
      userId: session.user.id,
      groupId,
    });

    if (permissionsRes?.permissions) {
      dispatch(setPermissionsData(permissionsRes.permissions));
    }
  } catch (error) {
    logger.warn('Failed to load user permissions:', error.message);
    dispatch(setPermissionsError(error.message));
  }
};

/**
 * Load user preferences and set chart sites
 */
const loadUserPreferencesAndChartSites = async (
  userId,
  activeGroupId,
  dispatch,
) => {
  try {
    logger.debug('Loading user preferences and chart sites...');

    // Get user preferences
    const preferencesRes = await dispatch(
      getIndividualUserPreferences({
        identifier: userId,
        groupID: activeGroupId,
      }),
    );

    // Check if preferences were loaded successfully
    if (preferencesRes?.payload?.individual_preferences?.length > 0) {
      const preferences = preferencesRes.payload.individual_preferences[0];

      if (preferences?.selected_sites?.length > 0) {
        // Extract site IDs from selected sites
        const chartSiteIds = preferences.selected_sites
          .map((site) => site?._id)
          .filter(Boolean);

        if (chartSiteIds.length > 0) {
          logger.debug(
            `Setting ${chartSiteIds.length} chart sites from preferences`,
          );
          dispatch(setChartSites(chartSiteIds));
        }
      }
    }
  } catch (error) {
    logger.warn('Failed to load user preferences and chart sites:', error);
  }
};

/**
 * Load organization theme in the background
 */
const loadOrganizationTheme = async (activeGroup, dispatch) => {
  try {
    if (isAirQoGroup(activeGroup)) {
      dispatch(clearOrganizationTheme());
      return;
    }

    logger.debug('Loading organization theme...');
    dispatch(setOrganizationThemeLoading(true));

    const themeRes = await getOrganizationThemePreferencesApi(activeGroup._id);
    if (themeRes?.theme) {
      dispatch(setOrganizationTheme(themeRes.theme));
    }
  } catch (error) {
    logger.warn('Failed to load organization theme:', error.message);
    dispatch(setOrganizationThemeError(error.message));
  } finally {
    dispatch(setOrganizationThemeLoading(false));
  }
};

/**
 * Simplified and robust user session setup utility
 */
export const setupUserSession = async (
  session,
  dispatch,
  pathname = '/',
  options = {},
) => {
  try {
    if (!session?.user?.id) {
      throw new Error('Invalid session: missing user ID');
    }

    const { preferredGroupId, maintainActiveGroup = false } = options;

    logger.info('Starting user session setup...', {
      userId: session.user.id,
      pathname,
      preferredGroupId,
      maintainActiveGroup,
    });

    // Clear any existing data first
    dispatch(resetStore());
    dispatch(clearAllGroupData());
    dispatch(clearPermissions());
    dispatch(clearOrganizationTheme());

    // Set basic user data immediately from session
    const basicUserData = {
      _id: session.user.id,
      firstName:
        session.user.firstName || session.user.name?.split(' ')[0] || 'User',
      lastName:
        session.user.lastName ||
        session.user.name?.split(' ').slice(1).join(' ') ||
        '',
      name: session.user.name,
      email: session.user.email,
      userName: session.user.userName || session.user.email,
      organization: session.user.organization,
      long_organization: session.user.long_organization,
      profilePicture: session.user.profilePicture || session.user.image,
      country: session.user.country,
      phoneNumber: session.user.phoneNumber,
      createdAt: session.user.createdAt,
      updatedAt: session.user.updatedAt,
    };

    // Update Redux immediately
    dispatch(setUserInfo(basicUserData));

    // Fetch complete user details
    logger.debug('Fetching user details...');
    const userRes = await getUserDetails(session.user.id);
    const user = userRes.users[0];

    if (!user) {
      throw new Error('User not found');
    }

    // Normalize group data
    const userGroups =
      Array.isArray(user.groups) && user.groups.length
        ? user.groups
        : Array.isArray(user.my_groups) && user.my_groups.length
          ? user.my_groups
          : [];

    if (userGroups.length === 0) {
      throw new Error(
        'No organization found. Contact support to add you to an organization.',
      );
    }

    user.groups = userGroups;

    // Determine active group and redirect path
    let activeGroup = null;
    let redirectPath = null;

    const routeType = getRouteType(pathname);
    const isRootPageRedirect = pathname === '/';

    logger.debug('Route analysis:', {
      routeType,
      pathname,
      isRootPageRedirect,
      userGroupsCount: userGroups.length,
    });

    // Simplified group selection logic
    if (isRootPageRedirect) {
      // Root page - use AirQo group, redirect to dashboard
      activeGroup = userGroups.find(isAirQoGroup) || userGroups[0];
      redirectPath = '/user/Home';
    } else if (pathname.startsWith('/admin')) {
      // Admin routes - use AirQo group, no redirect
      activeGroup = userGroups.find(isAirQoGroup) || userGroups[0];
    } else if (
      routeType === ROUTE_TYPES.ORGANIZATION &&
      pathname.includes('/org/')
    ) {
      // Organization routes - match slug, prioritizing session requestedOrgSlug
      let orgSlug = pathname.match(/\/org\/([^/]+)/)?.[1];

      // Check if session has requested org slug from organization-specific login
      if (session?.requestedOrgSlug) {
        orgSlug = session.requestedOrgSlug;
        logger.info(`Using requested org slug from session: ${orgSlug}`);
      }

      if (orgSlug) {
        // Find matching group
        const matchingGroup = userGroups.find((group) => {
          if (isAirQoGroup(group)) return false;

          const explicitSlug = group.organization_slug || group.grp_slug;
          if (explicitSlug === orgSlug) return true;

          const generatedSlug = titleToSlug(group.grp_title || group.grp_name);
          return generatedSlug === orgSlug;
        });

        activeGroup =
          matchingGroup ||
          userGroups.find((g) => !isAirQoGroup(g)) ||
          userGroups[0];

        // Redirect to proper organization dashboard if we found the matching group
        // and we're either from session login or on the root org path
        if (
          matchingGroup &&
          (session?.requestedOrgSlug ||
            pathname === `/org/${orgSlug}` ||
            pathname === `/org/${orgSlug}/`)
        ) {
          redirectPath = `/org/${orgSlug}/dashboard`;
        }
      } else {
        // Fallback for org routes without slug
        activeGroup = userGroups.find((g) => !isAirQoGroup(g)) || userGroups[0];
      }
    } else if (routeType === ROUTE_TYPES.INDIVIDUAL) {
      // Individual user routes - use AirQo group
      activeGroup = userGroups.find(isAirQoGroup) || userGroups[0];
    } else {
      // Default fallback
      activeGroup = userGroups[0];
    }

    if (!activeGroup) {
      throw new Error('No valid group found');
    }

    logger.info('Session setup completed', {
      activeGroupId: activeGroup._id,
      activeGroupName: activeGroup.grp_title || activeGroup.grp_name,
      redirectPath,
    });

    // Update Redux with complete data - but delay activeGroup setting to allow loading state to show
    const completeUserData = {
      ...basicUserData,
      ...user,
      groups: userGroups,
    };

    dispatch(setUserInfo(completeUserData));
    dispatch(setUserGroups(userGroups));
    dispatch(setSuccess(true));
    dispatch(setError(''));

    // Delay setting activeGroup to ensure "Setting up your session..." message is visible
    // before root page triggers redirect
    setTimeout(() => {
      dispatch(setActiveGroup(activeGroup));
    }, 300);

    // Load additional data in background (don't block)
    Promise.allSettled([
      loadUserPermissions(session, activeGroup._id, dispatch),
      loadOrganizationTheme(activeGroup, dispatch),
      loadUserPreferencesAndChartSites(
        session.user.id,
        activeGroup._id,
        dispatch,
      ),
    ]).then((results) => {
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          logger.warn(
            `Background data loading failed (${index}):`,
            result.reason,
          );
        }
      });
    });

    return {
      success: true,
      redirectPath,
    };
  } catch (error) {
    logger.error('User session setup failed:', error);

    dispatch(setError(error.message));
    dispatch(setSuccess(false));

    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Clear user session data
 */
export const clearUserSession = async (dispatch) => {
  try {
    logger.info('Clearing user session...');

    dispatch(resetStore());
    dispatch(clearAllGroupData());
    dispatch(clearPermissions());
    dispatch(clearOrganizationTheme());

    logger.debug('User session cleared');

    return { success: true };
  } catch (error) {
    logger.error('Failed to clear user session:', error);
    return { success: false, error: error.message };
  }
};

export default setupUserSession;
