import {
  getUserDetails,
  getUserGroupPermissionsApi,
} from '@/core/apis/Account';
import { getOrganizationThemePreferencesApi } from '@/core/apis/Organizations';
import {
  setUserInfo,
  setSuccess,
  setError,
} from '@/lib/store/services/account/LoginSlice';
import { setUserGroups } from '@/lib/store/services/groups';
import { setActiveGroup } from '@/lib/store/services/groups';
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
import { isAirQoGroup } from '@/core/utils/organizationUtils';
import logger from '@/lib/logger';
import { getAirqoGroupId } from '@/lib/constants';

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

    const preferencesRes = await dispatch(
      getIndividualUserPreferences({
        identifier: userId,
        groupID: activeGroupId,
      }),
    );

    if (preferencesRes?.payload?.individual_preferences?.length > 0) {
      const preferences = preferencesRes.payload.individual_preferences[0];

      if (preferences?.selected_sites?.length > 0) {
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
 * Optimized for fast login flow with minimal blocking operations
 */
export const setupUserSession = async (
  session,
  dispatch,
  pathname = '/',
  options = {},
) => {
  try {
    // CRITICAL: Validate inputs first, before any variable access
    if (!session?.user?.id) {
      throw new Error('Invalid session: missing user ID');
    }

    // CRITICAL: Safe defaults for options destructuring
    if (!options || typeof options !== 'object') {
      options = {};
    }

    const preferredGroupId = options?.preferredGroupId || undefined;
    const maintainActiveGroup = options?.maintainActiveGroup ?? false;
    const providedUserGroups = options?.userGroups || undefined;

    logger.info('🔵 START: setupUserSession', {
      userId: session.user.id,
      pathname,
      preferredGroupId,
      maintainActiveGroup,
      hasProvidedUserGroups: !!providedUserGroups,
    });

    // Clear only the volatile slices that must be refreshed for a new session
    dispatch(clearPermissions());
    dispatch(clearOrganizationTheme());
    dispatch(setChartSites([]));
    logger.debug('✅ Cleared volatile Redux slices');

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
    logger.debug('✅ Set basic user info in Redux', { userId: basicUserData._id });

    // Use provided userGroups if available (avoids redundant API call)
    let userGroups = Array.isArray(providedUserGroups)
      ? providedUserGroups
      : null;

    logger.debug('📊 UserGroups check', {
      hasProvidedUserGroups: !!userGroups,
      providedGroupsCount: userGroups?.length || 0,
    });

    // If no cached groups, we need to fetch them
    if (!userGroups) {
      logger.info('📡 No cached groups - fetching user details from API...');

      try {
        logger.debug('🌐 Calling getUserDetails API...');
        const userRes = await getUserDetails(session.user.id);
        logger.debug('✅ API RETURNED:', {
          hasUsers: !!userRes?.users,
          usersCount: userRes?.users?.length || 0,
          firstUserKeys: Object.keys(userRes?.users?.[0] || {}),
        });

        const user = userRes.users ? userRes.users[0] : null;
        logger.debug('✅ USER EXTRACTED:', {
          userId: user?._id,
          userName: user?.name,
          hasGroups: !!user?.groups,
          groupsCount: user?.groups?.length || 0,
          hasMyGroups: !!user?.my_groups,
          myGroupsCount: user?.my_groups?.length || 0,
        });

        if (!user) {
          logger.error('❌ User not found in API response');
          throw new Error('User not found');
        }

        logger.debug('✅ USER VALID - Extracting groups...');

        // Prioritize `groups` for session setup.
        // Fallback to `my_groups` if `groups` is not available.
        userGroups =
          Array.isArray(user.groups) && user.groups.length
            ? user.groups
            : Array.isArray(user.my_groups) && user.my_groups.length
              ? user.my_groups
              : [];

        logger.debug('✅ USERGROUPS EXTRACTED:', {
          groupsSource: Array.isArray(user.groups) && user.groups.length ? 'groups' : Array.isArray(user.my_groups) && user.my_groups.length ? 'my_groups' : 'none',
          userGroupsCount: userGroups.length,
          firstGroupTitle: userGroups[0]?.grp_title,
        });

        if (!Array.isArray(userGroups) || userGroups.length === 0) {
          logger.error('❌ USER HAS NO ASSOCIATED GROUPS');
          throw new Error(
            'No organization found. Contact support to add you to an organization.',
          );
        }

        // Update user data with fetched info
        const completeUserData = {
          ...basicUserData,
          ...user,
          groups: userGroups,
        };
        logger.debug('✅ DISPATCHING setUserInfo with complete user data...');
        dispatch(setUserInfo(completeUserData));
        logger.debug('✅ setUserInfo dispatched successfully');
      } catch (fetchError) {
        logger.error('❌ FAILED TO FETCH USER DETAILS:', {
          errorMessage: fetchError?.message,
          errorName: fetchError?.name,
        });
        logger.warn('⚠️ FALLING BACK to default AirQo group...');

        // Fallback: create minimal groups from session if available
        const airqoGroupId = getAirqoGroupId();
        logger.debug('📋 Creating fallback AirQo group:', { airqoGroupId });

        userGroups = [
          {
            _id: airqoGroupId,
            grp_title: 'airqo',
            grp_name: 'airqo',
            organization_slug: 'airqo',
          },
        ];
        logger.debug('✅ Fallback groups created:', { userGroupsCount: userGroups.length });
      }
    }

    logger.debug('🎯 Determining active group and redirect path...');

    // Determine active group and redirect path quickly
    let activeGroup = null;
    let redirectPath = null;

    const routeType = getRouteType(pathname);
    const isRootPageRedirect = pathname === '/';

    logger.debug('🗺️ Route analysis:', {
      routeType,
      pathname,
      isRootPageRedirect,
      userGroupsCount: userGroups.length,
    });

    // Simplified group selection logic for faster processing
    if (isRootPageRedirect) {
      logger.info('📍 GROUP SELECTION: Root page redirect. Using AirQo group.');
      activeGroup = userGroups.find(isAirQoGroup) || userGroups[0];
      redirectPath = '/user/Home';
    } else if (pathname.startsWith('/admin')) {
      logger.info('📍 GROUP SELECTION: Admin route. Using AirQo group.');
      activeGroup = userGroups.find(isAirQoGroup) || userGroups[0];
    } else if (
      routeType === ROUTE_TYPES.ORGANIZATION &&
      pathname.includes('/org/')
    ) {
      logger.info('📍 GROUP SELECTION: Organization route.');
      let orgSlug = pathname.match(/\/org\/([^/]+)/)?.[1];

      if (session?.requestedOrgSlug) {
        orgSlug = session.requestedOrgSlug;
        logger.info(`Using requested org slug from session: ${orgSlug}`);
      }

      if (orgSlug) {
        logger.debug(`Attempting to match group for slug: "${orgSlug}"`);
        const matchingGroup = userGroups.find((group) => {
          if (isAirQoGroup(group)) return false;

          const explicitSlug = group.organization_slug || group.grp_slug;
          if (explicitSlug === orgSlug) return true;

          const generatedSlug = titleToSlug(group.grp_title || group.grp_name);
          return generatedSlug === orgSlug;
        });

        if (matchingGroup) {
          logger.info(`✅ Found matching group: "${matchingGroup.grp_title}"`);
        } else {
          logger.warn(`⚠️ No matching group for slug "${orgSlug}". Will use first available non-AirQo group.`);
        }
        activeGroup =
          matchingGroup ||
          userGroups.find((g) => !isAirQoGroup(g)) ||
          userGroups[0];

        if (
          matchingGroup &&
          (session?.requestedOrgSlug ||
            pathname === `/org/${orgSlug}` ||
            pathname === `/org/${orgSlug}/`)
        ) {
          redirectPath = `/org/${orgSlug}/dashboard`;
        }
      } else {
        logger.warn('Organization route without a slug. Using first available non-AirQo group.');
        activeGroup = userGroups.find((g) => !isAirQoGroup(g)) || userGroups[0];
      }
    } else if (routeType === ROUTE_TYPES.USER) {
      logger.info('📍 GROUP SELECTION: User route. Using AirQo group.');
      activeGroup = userGroups.find(isAirQoGroup) || userGroups[0];
    } else {
      logger.info('📍 GROUP SELECTION: Default fallback. Using first available group.');
      activeGroup = userGroups[0];
    }

    if (!activeGroup) {
      logger.error('❌ CRITICAL: Could not determine an active group after all checks.');
      throw new Error('No valid group found');
    }

    logger.info(`✅ Final active group selected: "${activeGroup.grp_title}" (ID: ${activeGroup._id})`);

    logger.info('✅ FAST SESSION SETUP COMPLETED', {
      activeGroupId: activeGroup._id,
      activeGroupName: activeGroup.grp_title || activeGroup.grp_name,
      redirectPath,
    });

    // Update Redux with essential data synchronously
    logger.debug('🔄 Updating Redux with user groups and active group...');
    dispatch(setUserGroups(userGroups));
    dispatch(setActiveGroup(activeGroup));
    dispatch(setSuccess(true));
    dispatch(setError(''));
    logger.debug('✅ Redux state updated successfully');

    // Load additional data in background (completely non-blocking)
    logger.debug('🔄 Starting background data loading...');
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
          const operations = ['permissions', 'theme', 'preferences'];
          logger.warn(
            `Background ${operations[index]} loading failed:`,
            result.reason,
          );
        }
      });
      logger.debug('✅ Background data loading completed');
    });

    logger.info('✅ setupUserSession COMPLETED SUCCESSFULLY');
    return {
      success: true,
      redirectPath,
      activeGroup,
      userGroups,
    };
  } catch (error) {
    logger.error('❌ setupUserSession FAILED:', {
      errorMessage: error?.message,
      errorName: error?.name,
      errorStack: error?.stack,
    });

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
  const { resetReduxStore } = await import('@/lib/logoutUtils');
  try {
    logger.info('Clearing user session...');
    await resetReduxStore(dispatch);
    logger.debug('User session cleared');
    return { success: true };
  } catch (error) {
    logger.error('Failed to clear user session:', error);
    return { success: false, error: error.message };
  }
};

export default setupUserSession;