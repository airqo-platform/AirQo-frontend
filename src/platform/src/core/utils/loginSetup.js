import { getUserDetails, recentUserPreferencesAPI } from '@/core/apis/Account';
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
import { getRouteType, ROUTE_TYPES } from '@/core/utils/sessionUtils';
import logger from '@/lib/logger';

/**
 * Unified login setup utility for both user and organization contexts
 */
export const setupUserSession = async (session, dispatch, pathname) => {
  try {
    if (!session?.user?.id) {
      throw new Error('Invalid session: missing user ID');
    }

    logger.info('Starting unified login setup...', {
      userId: session.user.id,
      pathname,
    });

    // Clear any existing data first
    dispatch(resetStore());
    dispatch(clearAllGroupData());

    // Set basic user data immediately from session
    const basicUserData = {
      _id: session.user.id,
      firstName:
        session.user.firstName ||
        session.user.name?.split(' ')[0] ||
        session.user.name,
      lastName:
        session.user.lastName ||
        session.user.name?.split(' ').slice(1).join(' '),
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

    // Update Redux immediately with session data
    dispatch(setUserInfo(basicUserData));

    // Step 1: Fetch complete user details with groups
    logger.info('Fetching user details...');
    const userRes = await getUserDetails(session.user.id);
    const user = userRes.users[0];

    if (!user) {
      throw new Error('User not found');
    }

    if (!user.groups?.length) {
      throw new Error(
        'Server error. Contact support to add you to an organization',
      );
    }

    // Step 2: Fetch user preferences
    logger.info('Fetching user preferences...');
    let userPreferences = null;
    try {
      const preferencesRes = await recentUserPreferencesAPI(session.user.id);
      userPreferences = preferencesRes.preferences;
    } catch (error) {
      logger.warn('Failed to fetch user preferences, using defaults:', error);
    }

    // Step 3: Determine route context and appropriate active group
    const routeType = getRouteType(pathname);
    let activeGroup = null;
    let redirectPath = null;

    logger.info('Determining redirect path', {
      routeType,
      pathname,
      userGroupsCount: user.groups.length,
      userGroups: user.groups.map((g) => g.grp_name),
      isOrgRoute: routeType === ROUTE_TYPES.ORGANIZATION,
    });

    if (routeType === ROUTE_TYPES.ORGANIZATION) {
      // For organization routes, find the matching group
      const pathOrgSlug = pathname.match(/\/org\/([^/]+)/)?.[1];

      logger.info('Processing organization route', {
        pathOrgSlug,
        availableGroups: user.groups.map((g) => ({
          name: g.grp_name,
          slug: g.grp_name?.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        })),
      });

      if (pathOrgSlug) {
        // Try to find matching organization group
        activeGroup = user.groups.find(
          (group) =>
            group.grp_name?.toLowerCase().replace(/[^a-z0-9]/g, '-') ===
            pathOrgSlug,
        );

        if (activeGroup) {
          // Found matching group, redirect to org dashboard
          redirectPath = `/org/${pathOrgSlug}/dashboard`;
        } else {
          // If no exact match, try to find any non-AirQo group or use the pathOrgSlug anyway
          const nonAirQoGroup = user.groups.find(
            (group) => group.grp_name?.toLowerCase() !== 'airqo',
          );

          if (nonAirQoGroup) {
            const orgSlug = nonAirQoGroup.grp_name
              .toLowerCase()
              .replace(/[^a-z0-9]/g, '-');
            redirectPath = `/org/${orgSlug}/dashboard`;
            activeGroup = nonAirQoGroup;
          } else {
            // Even if no matching group, if user came from org login, keep them in org context
            // Use the pathOrgSlug from URL and use first available group
            redirectPath = `/org/${pathOrgSlug}/dashboard`;
            activeGroup = user.groups[0] || {
              grp_name: pathOrgSlug,
              _id: 'default',
            };
          }
        }
      } else {
        // No org slug in path, redirect to appropriate org
        const nonAirQoGroup = user.groups.find(
          (group) => group.grp_name?.toLowerCase() !== 'airqo',
        );

        if (nonAirQoGroup) {
          const orgSlug = nonAirQoGroup.grp_name
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '-');
          redirectPath = `/org/${orgSlug}/dashboard`;
          activeGroup = nonAirQoGroup;
        } else {
          redirectPath = '/user/Home';
          activeGroup = user.groups[0];
        }
      }
    } else {
      // For user routes, use AirQo group or first group
      activeGroup =
        user.groups.find(
          (group) => group.grp_name?.toLowerCase() === 'airqo',
        ) || user.groups[0];

      // If user doesn't have AirQo group but has other orgs
      if (
        !activeGroup.grp_name?.toLowerCase().includes('airqo') &&
        user.groups.length > 0
      ) {
        // Check user preferences
        if (
          !userPreferences?.preferredDashboard ||
          userPreferences.preferredDashboard === 'user'
        ) {
          // User prefers user dashboard, keep current group
        } else {
          // Redirect to their organization dashboard
          const orgSlug = activeGroup.grp_name
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '-');
          redirectPath = `/org/${orgSlug}/dashboard`;
        }
      }
    }

    // Step 4: Update Redux store with complete data
    dispatch(setUserInfo(user));
    dispatch(setUserGroups(user.groups));
    dispatch(setActiveGroup(activeGroup));
    dispatch(setSuccess(true));

    logger.info('Login setup completed successfully', {
      userId: user._id,
      activeGroupName: activeGroup?.grp_name,
      redirectPath,
      routeType,
      finalRedirectPath: redirectPath,
    });

    return {
      success: true,
      redirectPath,
      activeGroup,
      user,
    };
  } catch (error) {
    logger.error('Login setup failed:', error);

    // Clear Redux state if setup fails
    dispatch(setSuccess(false));
    dispatch(setError(error.message || 'Error setting up user session'));
    dispatch(resetStore());
    dispatch(clearAllGroupData());

    return {
      success: false,
      redirectPath: '/user/login',
      activeGroup: null,
      user: null,
      error: error.message,
    };
  }
};

/**
 * Clear all session data on logout
 */
export const clearUserSession = (dispatch) => {
  try {
    logger.info('Clearing user session...');

    // Clear Redux store
    dispatch(resetStore());
    dispatch(clearAllGroupData());
    dispatch(setUserInfo(null));
    dispatch(setActiveGroup(null));
    dispatch(setUserGroups([]));
    dispatch(setSuccess(false));
    dispatch(setError(null));

    // Clear localStorage items if needed
    try {
      localStorage.removeItem('userPreferences');
      localStorage.removeItem('activeGroup');
      localStorage.removeItem('userGroups');
    } catch (error) {
      // localStorage might not be available
      logger.warn('Failed to clear localStorage:', error);
    }

    logger.info('User session cleared successfully');
  } catch (error) {
    logger.error('Error clearing user session:', error);
  }
};

export default setupUserSession;
