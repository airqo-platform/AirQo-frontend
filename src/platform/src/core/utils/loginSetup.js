import { getUserDetails, getUserThemeApi } from '@/core/apis/Account';
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
import { getRouteType, ROUTE_TYPES } from '@/core/utils/sessionUtils';
import { isAirQoGroup } from '@/core/utils/organizationUtils';
import logger from '@/lib/logger';

/**
 * Utility function to convert organization title to URL slug
 * This should be consistent across all files that need slug generation
 */
const titleToSlug = (title) => {
  if (!title) return '';
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

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
    } // Step 2: Skip fetching user preferences for group selection
    // We no longer use previous group preferences to avoid conflicts
    // Group selection is now purely based on login context (individual vs organization)

    // Step 3: Determine route context and appropriate active group
    const routeType = getRouteType(pathname);
    let activeGroup = null;
    let redirectPath = null;

    // Check if this is an organization login from session data
    const isOrgLogin = session.isOrgLogin || session.user.isOrgLogin;
    const sessionOrgSlug = session.orgSlug || session.user.requestedOrgSlug;

    logger.info('Determining redirect path', {
      routeType,
      pathname,
      userGroupsCount: user.groups.length,
      userGroups: user.groups.map((g) => g.grp_name),
      isOrgRoute: routeType === ROUTE_TYPES.ORGANIZATION,
      isOrgLogin,
      sessionOrgSlug,
    });

    // Step 3b: Determine active group and redirect path based on login context
    if (pathname.includes('/org/')) {
      // ORGANIZATION LOGIN: Set active group based on slug and redirect to org dashboard
      const currentOrgSlug = pathname.match(/\/org\/([^/]+)/)?.[1];

      if (currentOrgSlug) {
        // Find group that matches the slug
        const matchingGroup = user.groups.find((group) => {
          const groupSlug = titleToSlug(group.grp_title);
          return groupSlug === currentOrgSlug;
        });

        if (matchingGroup) {
          activeGroup = matchingGroup;
          // Always redirect to organization dashboard for org login
          redirectPath = `/org/${currentOrgSlug}/dashboard`;
          logger.info('Organization login: Setting matching group', {
            groupId: matchingGroup._id,
            groupName: matchingGroup.grp_title || matchingGroup.grp_name,
            orgSlug: currentOrgSlug,
            loginContext: 'organization',
            pathname,
          });
        } else {
          // No matching group - use first available group but keep org context
          activeGroup = user.groups[0];
          redirectPath = `/org/${currentOrgSlug}/dashboard`;
          logger.info(
            'Organization login: No matching group found, using first available',
            {
              groupId: activeGroup._id,
              groupName: activeGroup.grp_title || activeGroup.grp_name,
              orgSlug: currentOrgSlug,
              loginContext: 'organization',
              pathname,
            },
          );
        }
      } else {
        // Fallback if no slug found - use first available group
        activeGroup = user.groups[0];
        const orgSlug = titleToSlug(activeGroup.grp_title);
        redirectPath = `/org/${orgSlug}/dashboard`;
        logger.info('Organization login: No slug found, using first group', {
          groupId: activeGroup._id,
          groupName: activeGroup.grp_title || activeGroup.grp_name,
          generatedSlug: orgSlug,
          loginContext: 'organization',
          pathname,
        });
      }
    } else {
      // USER LOGIN: For individual login page, always default to AirQo group regardless of previous preferences
      // This ensures users logging in from /user/login always get AirQo as default
      const airqoGroup = user.groups.find((group) => isAirQoGroup(group));
      if (airqoGroup) {
        // Always use AirQo group for individual login
        activeGroup = airqoGroup;
        logger.info('Individual login: Setting AirQo as default group', {
          groupId: airqoGroup._id,
          groupName: airqoGroup.grp_title || airqoGroup.grp_name,
          loginContext: 'individual',
          pathname,
        });
      } else {
        // Fallback if AirQo group not found - use first available group
        activeGroup = user.groups[0];
        logger.warn(
          'AirQo group not found for individual login, using first available group',
          {
            fallbackGroupId: activeGroup._id,
            fallbackGroupName: activeGroup.grp_title || activeGroup.grp_name,
            userGroups: user.groups.map((g) => ({
              id: g._id,
              name: g.grp_title || g.grp_name,
            })),
            loginContext: 'individual',
            pathname,
          },
        );
      }

      redirectPath = '/user/Home';
    }

    // Step 4: Update Redux store with complete data
    dispatch(setUserInfo(user));
    dispatch(setUserGroups(user.groups));
    dispatch(setActiveGroup(activeGroup));

    // Step 5: Fetch individual preferences for the active group (needed for analytics)
    // This ensures data insights page has correct user preferences for analytics cards/charts
    if (activeGroup) {
      try {
        const { replaceUserPreferences } = await import(
          '@/lib/store/services/account/UserDefaultsSlice'
        );
        await dispatch(
          replaceUserPreferences({
            user_id: user._id,
            group_id: activeGroup._id,
          }),
        ).unwrap();
        logger.info('User preferences fetched for active group:', {
          activeGroupName: activeGroup.grp_name,
          groupId: activeGroup._id,
        });
      } catch (error) {
        logger.warn(
          'Failed to fetch user preferences for active group:',
          error,
        );
        // Continue without preferences - non-critical
      }
    }

    dispatch(setSuccess(true));

    // Step 6: Fetch organization theme preferences for the active group
    if (activeGroup && activeGroup._id) {
      try {
        dispatch(setOrganizationThemeLoading(true));
        logger.info('Fetching organization theme preferences...', {
          activeGroupId: activeGroup._id,
          activeGroupName: activeGroup.grp_title || activeGroup.grp_name,
        });

        const orgThemeRes = await getOrganizationThemePreferencesApi(
          activeGroup._id,
        );
        if (orgThemeRes?.success && orgThemeRes?.data) {
          const organizationTheme = orgThemeRes.data;
          dispatch(setOrganizationTheme(organizationTheme));
          logger.info(
            'Organization theme loaded successfully:',
            organizationTheme,
          );
        } else {
          // No organization theme found, clear any existing data
          dispatch(clearOrganizationTheme());
          logger.info('No organization theme found for active group');
        }
      } catch (error) {
        logger.warn('Failed to fetch organization theme:', error);
        dispatch(
          setOrganizationThemeError(
            error.message || 'Failed to fetch organization theme',
          ),
        );
        // Continue without organization theme - non-critical
      } finally {
        dispatch(setOrganizationThemeLoading(false));
      }
    } else {
      // No active group, clear organization theme
      dispatch(clearOrganizationTheme());
    }

    // Step Final: Fetch user theme preferences after successful authentication
    logger.info('Fetching user theme preferences...');
    let userTheme = null;
    try {
      const themeRes = await getUserThemeApi(session.user.id);
      if (themeRes?.success && themeRes?.data) {
        userTheme = themeRes.data;
        logger.info('User theme loaded successfully:', userTheme);
      } else {
        logger.info('No user theme found, will use defaults');
      }
    } catch (error) {
      logger.warn('Failed to fetch user theme, will use defaults:', error);
    }

    // Store theme in global context for immediate access by theme hooks
    // Always set the loaded flag, even if no theme was found
    if (typeof window !== 'undefined') {
      try {
        if (userTheme) {
          window.sessionStorage.setItem('userTheme', JSON.stringify(userTheme));
          logger.info('User theme stored in sessionStorage:', userTheme);
        } else {
          logger.info('No user theme to store, will use defaults');
        }
        // Always set this flag to indicate theme loading is complete
        window.sessionStorage.setItem('userThemeLoaded', 'true');
        logger.info('Theme loading flag set in sessionStorage');
      } catch (error) {
        logger.warn('Failed to store theme in session storage:', error);
      }
    }

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
    dispatch(clearOrganizationTheme());
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
