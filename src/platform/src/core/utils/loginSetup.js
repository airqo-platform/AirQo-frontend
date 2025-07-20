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
 * @param {Object} session - Next.js session object
 * @param {Function} dispatch - Redux dispatch function
 * @param {string} pathname - Current pathname
 * @param {Object} options - Additional options
 * @param {string} options.preferredGroupId - Group ID to prefer when multiple matches exist
 * @param {boolean} options.maintainActiveGroup - Whether to maintain the current active group if possible
 * @param {boolean} options.isDomainUpdate - Whether this is called after a domain update (helps prioritize preferred group)
 */
export const setupUserSession = async (
  session,
  dispatch,
  pathname,
  options = {},
) => {
  try {
    if (!session?.user?.id) {
      throw new Error('Invalid session: missing user ID');
    }

    const {
      preferredGroupId,
      maintainActiveGroup = false,
      isDomainUpdate = false,
    } = options;

    logger.info('Starting unified login setup...', {
      userId: session.user.id,
      pathname,
      preferredGroupId,
      maintainActiveGroup,
      isDomainUpdate,
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
    dispatch(setUserInfo(basicUserData)); // Step 1: Fetch complete user details with groups
    logger.info('Fetching user details...');

    // If we have a preferred group ID and are maintaining active group,
    // add a smaller delay to allow API to propagate domain changes
    if (preferredGroupId && (maintainActiveGroup || isDomainUpdate)) {
      logger.info('Waiting for API propagation after domain update...');
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Reduced from 2 seconds
    }

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
      userGroups: user.groups.map((g) => ({
        id: g._id,
        name: g.grp_name || g.grp_title,
        organizationSlug: g.organization_slug,
        grpSlug: g.grp_slug,
        titleSlug: titleToSlug(g.grp_title || g.grp_name),
      })),
      isOrgRoute: routeType === ROUTE_TYPES.ORGANIZATION,
      isOrgLogin,
      sessionOrgSlug,
      isDomainUpdate,
      preferredGroupId,
    });

    // Step 3b: Determine active group and redirect path based on login context
    // SPECIAL CASE: If we're coming from the root page ("/") or this is a new tab opening,
    // ALWAYS use AirQo group and redirect to /user/Home regardless of organization context
    const isRootPageRedirect = pathname === '/' || !pathname;

    if (isRootPageRedirect) {
      // Force user flow with AirQo group for root page access
      const airqoGroup = user.groups.find((group) => isAirQoGroup(group));
      if (airqoGroup) {
        activeGroup = airqoGroup;
        logger.info('Root page redirect: Setting AirQo as active group', {
          groupId: airqoGroup._id,
          groupName: airqoGroup.grp_title || airqoGroup.grp_name,
          loginContext: 'root_redirect',
          pathname,
        });
      } else {
        // Fallback if AirQo group not found - use first available group
        activeGroup = user.groups[0];
        logger.warn(
          'Root page redirect: AirQo group not found, using first available group',
          {
            fallbackGroupId: activeGroup._id,
            fallbackGroupName: activeGroup.grp_title || activeGroup.grp_name,
            userGroups: user.groups.map((g) => ({
              id: g._id,
              name: g.grp_title || g.grp_name,
            })),
            loginContext: 'root_redirect',
            pathname,
          },
        );
      }
      redirectPath = '/user/Home';
    } else if (pathname.includes('/org/')) {
      // ORGANIZATION LOGIN: Set active group based on slug and redirect to org dashboard
      const currentOrgSlug = pathname.match(/\/org\/([^/]+)/)?.[1];
      if (currentOrgSlug) {
        logger.info('Searching for group matching slug:', {
          currentOrgSlug,
          availableGroups: user.groups.map((g) => ({
            id: g._id,
            name: g.grp_name || g.grp_title,
            organizationSlug: g.organization_slug,
            grpSlug: g.grp_slug,
            titleSlug: titleToSlug(g.grp_title || g.grp_name),
            isAirQo: isAirQoGroup(g),
          })),
          isDomainUpdate,
          preferredGroupId,
        });

        // PRIORITY 1: If this is a domain update and we have a preferred group ID, use it FIRST
        // This ensures the user stays in the same group after domain updates
        if (isDomainUpdate && preferredGroupId) {
          logger.info(
            'Domain update detected, prioritizing preferred group...',
          );
          const preferredGroup = user.groups.find(
            (group) => group._id === preferredGroupId,
          );

          if (preferredGroup && !isAirQoGroup(preferredGroup)) {
            activeGroup = preferredGroup;
            redirectPath = `/org/${currentOrgSlug}/dashboard`;
            logger.info(
              'Domain update: Using preferred group to maintain context',
              {
                groupId: preferredGroup._id,
                groupName: preferredGroup.grp_title || preferredGroup.grp_name,
                preferredGroupId,
                orgSlug: currentOrgSlug,
                reason: 'domain_update_preferred_group',
                loginContext: 'organization',
                pathname,
              },
            );
          } else if (preferredGroup && isAirQoGroup(preferredGroup)) {
            logger.warn(
              'Domain update: Preferred group is AirQo, falling back to slug matching',
              {
                preferredGroupId,
                groupName: preferredGroup.grp_title || preferredGroup.grp_name,
              },
            );
          } else {
            logger.warn(
              'Domain update: Preferred group not found in user groups',
              {
                preferredGroupId,
                availableGroupIds: user.groups.map((g) => g._id),
              },
            );
          }
        }

        // PRIORITY 2: Find group that matches the slug - check multiple slug sources (only if no preferred group was used)
        if (!activeGroup) {
          const matchingGroup = user.groups.find((group) => {
            // Skip AirQo groups immediately for organization context
            if (isAirQoGroup(group)) {
              logger.debug('Skipping AirQo group in organization context:', {
                groupId: group._id,
                groupName: group.grp_title || group.grp_name,
              });
              return false;
            }

            // First check if group has an explicit organization_slug or grp_slug
            const explicitSlug = group.organization_slug || group.grp_slug;
            if (explicitSlug === currentOrgSlug) {
              logger.info('Found exact slug match:', {
                groupId: group._id,
                groupName: group.grp_title || group.grp_name,
                matchedSlug: explicitSlug,
                currentOrgSlug,
              });
              return true;
            }

            // Fallback to generated slug from title
            const generatedSlug = titleToSlug(
              group.grp_title || group.grp_name,
            );
            if (generatedSlug === currentOrgSlug) {
              logger.info('Found generated slug match:', {
                groupId: group._id,
                groupName: group.grp_title || group.grp_name,
                generatedSlug,
                currentOrgSlug,
              });
              return true;
            }

            return false;
          });

          if (matchingGroup) {
            activeGroup = matchingGroup;
            // Always redirect to organization dashboard for org login
            redirectPath = `/org/${currentOrgSlug}/dashboard`;
            logger.info('Organization login: Setting matching group', {
              groupId: matchingGroup._id,
              groupName: matchingGroup.grp_title || matchingGroup.grp_name,
              orgSlug: currentOrgSlug,
              organizationSlug: matchingGroup.organization_slug,
              grpSlug: matchingGroup.grp_slug,
              loginContext: 'organization',
              pathname,
            });
          }
        }

        // PRIORITY 3: Fallback handling when no match found
        if (!activeGroup) {
          // Try preferred group as final fallback (for cases where domain update caused slug mismatch)
          if (preferredGroupId && !isDomainUpdate) {
            logger.info(
              'No slug match found, checking preferred group as fallback...',
            );
            const preferredGroup = user.groups.find(
              (group) => group._id === preferredGroupId,
            );

            if (preferredGroup && !isAirQoGroup(preferredGroup)) {
              activeGroup = preferredGroup;
              redirectPath = `/org/${currentOrgSlug}/dashboard`;
              logger.info(
                'Organization login: Using preferred group (slug mismatch likely due to API delay)',
                {
                  groupId: preferredGroup._id,
                  groupName:
                    preferredGroup.grp_title || preferredGroup.grp_name,
                  preferredGroupId,
                  orgSlug: currentOrgSlug,
                  groupSlugInData:
                    preferredGroup.organization_slug || preferredGroup.grp_slug,
                  reason: 'preferred_group_fallback',
                  loginContext: 'organization',
                  pathname,
                },
              );
            }
          }

          // Final fallback: Find any non-AirQo group
          if (!activeGroup) {
            logger.warn('No matching group found for organization slug', {
              currentOrgSlug,
              preferredGroupId,
              isDomainUpdate,
              availableNonAirQoGroups: user.groups
                .filter((g) => !isAirQoGroup(g))
                .map((g) => ({
                  id: g._id,
                  name: g.grp_name || g.grp_title,
                  organizationSlug: g.organization_slug,
                  grpSlug: g.grp_slug,
                  titleSlug: titleToSlug(g.grp_title || g.grp_name),
                })),
            });

            // No matching group - find a non-AirQo group for org context
            const nonAirQoGroup = user.groups.find(
              (group) => !isAirQoGroup(group),
            );
            if (nonAirQoGroup) {
              activeGroup = nonAirQoGroup;
              redirectPath = `/org/${currentOrgSlug}/dashboard`;
              logger.info(
                'Organization login: No matching group found, using first non-AirQo group',
                {
                  groupId: activeGroup._id,
                  groupName: activeGroup.grp_title || activeGroup.grp_name,
                  orgSlug: currentOrgSlug,
                  loginContext: 'organization',
                  pathname,
                },
              );
            } else {
              // Only AirQo groups available - redirect to user flow
              activeGroup = user.groups[0];
              redirectPath = '/user/Home';
              logger.info(
                'Organization login: Only AirQo groups available, redirecting to user flow',
                {
                  groupId: activeGroup._id,
                  groupName: activeGroup.grp_title || activeGroup.grp_name,
                  loginContext: 'organization -> user',
                  pathname,
                },
              );
            }
          }
        }
      } else {
        // Fallback if no slug found - use first non-AirQo group
        const nonAirQoGroup = user.groups.find((group) => !isAirQoGroup(group));
        if (nonAirQoGroup) {
          activeGroup = nonAirQoGroup;
          const orgSlug =
            nonAirQoGroup.organization_slug ||
            nonAirQoGroup.grp_slug ||
            titleToSlug(nonAirQoGroup.grp_title);
          redirectPath = `/org/${orgSlug}/dashboard`;
          logger.info(
            'Organization login: No slug found, using first non-AirQo group',
            {
              groupId: activeGroup._id,
              groupName: activeGroup.grp_title || activeGroup.grp_name,
              generatedSlug: orgSlug,
              loginContext: 'organization',
              pathname,
            },
          );
        } else {
          // Only AirQo groups - redirect to user flow
          activeGroup = user.groups[0];
          redirectPath = '/user/Home';
          logger.info(
            'Organization login: Only AirQo groups found, redirecting to user flow',
            {
              loginContext: 'organization -> user',
              pathname,
            },
          );
        }
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
        // Clear any existing theme data first
        window.sessionStorage.removeItem('userTheme');
        window.sessionStorage.removeItem('userThemeLoaded');

        // Store the new theme
        if (userTheme) {
          // Ensure we have all required theme properties
          const themeToStore = {
            primaryColor: userTheme.primaryColor || '#145FFF',
            mode: userTheme.mode || 'light',
            interfaceStyle: userTheme.interfaceStyle || 'default',
            contentLayout: userTheme.contentLayout || 'compact',
          };

          window.sessionStorage.setItem(
            'userTheme',
            JSON.stringify(themeToStore),
          );
          logger.info('User theme stored in sessionStorage:', themeToStore);
        } else {
          logger.info('No user theme to store, will use defaults');
        }

        // Set the loaded flag last to ensure complete theme data is ready
        window.sessionStorage.setItem('userThemeLoaded', 'true');
        logger.info('Theme loading flag set in sessionStorage');
      } catch (error) {
        logger.warn('Failed to store theme in session storage:', error);
        // Attempt to clean up in case of partial success
        try {
          window.sessionStorage.removeItem('userTheme');
          window.sessionStorage.removeItem('userThemeLoaded');
        } catch (cleanupError) {
          logger.warn('Failed to clean up theme storage:', cleanupError);
        }
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
