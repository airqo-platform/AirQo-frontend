/**
 * Organization-specific utilities for handling context and routing
 * Helps maintain organization context throughout the authentication flow
 */

import logger from '@/lib/logger';

/**
 * Utility function to convert organization title to URL slug
 * This should be consistent across all files that need slug generation
 */
export const titleToSlug = (title) => {
  if (!title) return '';
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Checks if a group is AirQo group
 * @param {Object|string} group - Group object or group name/title
 * @returns {boolean} Whether the group is AirQo
 */
export const isAirQoGroup = (group) => {
  if (!group) return false;

  const groupName =
    typeof group === 'string' ? group : group.grp_name || group.grp_title || '';
  return groupName.toLowerCase().trim() === 'airqo';
};

/**
 * Determines if user should use user flow based on active group
 * AirQo group MUST always use user flow (/user/*) routes
 * @param {Object} activeGroup - Active group object
 * @returns {boolean} Whether to use user flow
 */
export const shouldUseUserFlow = (activeGroup) => {
  return isAirQoGroup(activeGroup);
};

/**
 * Gets the appropriate route prefix based on group
 * @param {Object} activeGroup - Active group object
 * @returns {string} Route prefix ('/user' or '/org/[slug]')
 */
export const getRoutePrefix = (activeGroup) => {
  if (shouldUseUserFlow(activeGroup)) {
    return '/user';
  }
  const groupSlug = titleToSlug(activeGroup?.grp_title) || 'airqo';
  return `/org/${groupSlug}`;
};

/**
 * Detects if the current context is organization-based
 * @param {Object} session - NextAuth session object
 * @param {string} pathname - Current pathname
 * @returns {Object} Organization context detection result
 */
export const detectOrganizationContext = (session, pathname) => {
  try {
    // Priority 1: Check session flags set during login
    const sessionOrgLogin = session?.isOrgLogin || session?.user?.isOrgLogin;
    const sessionOrgSlug = session?.orgSlug || session?.user?.requestedOrgSlug;

    // Priority 2: Check current path
    const pathOrgSlug = pathname?.match(/\/org\/([^/]+)/)?.[1];

    // Priority 3: Check user organization membership
    const userOrganization = session?.user?.organization;

    const result = {
      isOrganizationContext: !!(
        sessionOrgLogin ||
        pathOrgSlug ||
        userOrganization
      ),
      orgSlug: sessionOrgSlug || pathOrgSlug || 'airqo',
      source: sessionOrgLogin
        ? 'session'
        : pathOrgSlug
          ? 'path'
          : userOrganization
            ? 'user'
            : 'none',
      sessionOrgLogin,
      pathOrgSlug,
      userOrganization,
    };

    logger.debug('Organization context detection:', result);
    return result;
  } catch (error) {
    logger.error('Error detecting organization context:', error);
    return {
      isOrganizationContext: false,
      orgSlug: 'airqo',
      source: 'error',
    };
  }
};

/**
 * Determines the appropriate login path based on context and active group
 * AirQo group ALWAYS uses /user/login regardless of context
 * @param {string} pathname - Current pathname
 * @param {Object} session - NextAuth session object (optional)
 * @param {Object} activeGroup - Active group object (optional)
 * @returns {string} Login path
 */
export const getContextualLoginPath = (
  pathname,
  session = null,
  activeGroup = null,
) => {
  // If active group is AirQo, ALWAYS use user flow
  if (shouldUseUserFlow(activeGroup)) {
    return '/user/login';
  }

  const orgContext = detectOrganizationContext(session, pathname);

  if (orgContext.isOrganizationContext) {
    return `/org/${orgContext.orgSlug}/login`;
  }

  return '/user/login';
};

/**
 * Determines the appropriate dashboard path based on context and active group
 * AirQo group ALWAYS uses /user/Home regardless of context
 * @param {string} pathname - Current pathname
 * @param {Object} session - NextAuth session object (optional)
 * @param {Object} activeGroup - Active group object (optional)
 * @returns {string} Dashboard path
 */
export const getContextualDashboardPath = (
  pathname,
  session = null,
  activeGroup = null,
) => {
  // If active group is AirQo, ALWAYS use user flow
  if (shouldUseUserFlow(activeGroup)) {
    return '/user/Home';
  }

  const orgContext = detectOrganizationContext(session, pathname);

  if (orgContext.isOrganizationContext) {
    return `/org/${orgContext.orgSlug}/dashboard`;
  }

  return '/user/Home';
};

/**
 * Creates a smart redirect based on login context and active group
 * Maintains organization context when users login through org routes
 * AirQo group ALWAYS redirects to /user/Home regardless of login context
 * @param {Object} session - NextAuth session object
 * @param {string} currentPath - Current pathname
 * @param {Array} userGroups - User's available groups
 * @param {Object} activeGroup - Active group object (optional)
 * @returns {string} Redirect path
 */
export const createSmartRedirect = (
  session,
  currentPath,
  userGroups = [],
  activeGroup = null,
) => {
  try {
    // If active group is AirQo, ALWAYS redirect to user flow
    if (shouldUseUserFlow(activeGroup)) {
      return '/user/Home';
    }

    const orgContext = detectOrganizationContext(session, currentPath);

    // If this was an organization login or user is on org route
    if (orgContext.isOrganizationContext) {
      // Try to find matching group
      const matchingGroup = userGroups.find((group) => {
        // Skip AirQo group - it should use user flow
        if (isAirQoGroup(group)) return false;

        const groupSlug = titleToSlug(group.grp_title);
        return groupSlug === orgContext.orgSlug;
      });

      if (matchingGroup) {
        return `/org/${orgContext.orgSlug}/dashboard`;
      }

      // If no matching group but this was an org login, find any non-AirQo group
      if (orgContext.sessionOrgLogin) {
        const nonAirQoGroup = userGroups.find((group) => !isAirQoGroup(group));

        if (nonAirQoGroup) {
          const orgSlug = titleToSlug(nonAirQoGroup.grp_title);
          return `/org/${orgSlug}/dashboard`;
        }
      }

      // Keep org context even if no matching group (but not for AirQo)
      if (orgContext.orgSlug !== 'airqo') {
        return `/org/${orgContext.orgSlug}/dashboard`;
      }
    }

    // Default to user dashboard
    return '/user/Home';
  } catch (error) {
    logger.error('Error creating smart redirect:', error);
    return '/user/Home';
  }
};

/**
 * Validates if a user has access to a specific organization
 * @param {Array} userGroups - User's available groups
 * @param {string} orgSlug - Organization slug to check
 * @returns {boolean} Whether user has access
 */
export const validateOrganizationAccess = (userGroups, orgSlug) => {
  if (!userGroups || !orgSlug) return false;
  return userGroups.some((group) => {
    const groupSlug = titleToSlug(group.grp_title);
    return groupSlug === orgSlug;
  });
};

/**
 * Extracts organization slug from various sources
 * @param {string} pathname - Current pathname
 * @param {Object} session - NextAuth session object
 * @returns {string|null} Organization slug
 */
export const extractOrganizationSlug = (pathname, session = null) => {
  // Try path first
  const pathSlug = pathname?.match(/\/org\/([^/]+)/)?.[1];
  if (pathSlug) return pathSlug;

  // Try session
  const sessionSlug = session?.orgSlug || session?.user?.requestedOrgSlug;
  if (sessionSlug) return sessionSlug;

  return null;
};
