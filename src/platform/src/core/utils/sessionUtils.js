/**
 * Unified Session Management Utilities
 * Uses path-based context detection for seamless user/organization navigation
 * Users can access both contexts with a single login session
 * Enhanced with AirQo group routing rules
 */

import { getToken } from 'next-auth/jwt';
import {
  getContextualLoginPath,
  isAirQoGroup,
  shouldUseUserFlow,
} from './organizationUtils';
import logger from '@/lib/logger';
import { getNextAuthSecret } from '@/lib/envConstants';

// Route type constants
export const ROUTE_TYPES = {
  USER: 'user',
  ORGANIZATION: 'organization',
  PUBLIC: 'public',
  AUTH: 'auth',
};

/**
 * Determines the route type based on pathname
 * @param {string} pathname - The current pathname
 * @returns {string} The route type
 */
export const getRouteType = (pathname) => {
  if (!pathname) return ROUTE_TYPES.PUBLIC;

  // Auth routes (check FIRST before organization routes)
  if (
    pathname.includes('/login') ||
    pathname.includes('/register') ||
    pathname.includes('/auth') ||
    pathname.includes('/creation') ||
    pathname.includes('/forgotPwd') ||
    pathname.includes('/verify-email') ||
    pathname.endsWith('/login') ||
    pathname.endsWith('/register')
  ) {
    return ROUTE_TYPES.AUTH;
  }

  // Organization routes
  if (pathname.includes('/org/') || pathname.includes('(organization)')) {
    return ROUTE_TYPES.ORGANIZATION;
  }

  // User routes (individual)
  if (
    pathname.includes('/user/') ||
    pathname.includes('(individual)') ||
    pathname.startsWith('/Home') ||
    pathname.startsWith('/analytics') ||
    pathname.startsWith('/settings')
  ) {
    return ROUTE_TYPES.USER;
  }

  // Default to public
  return ROUTE_TYPES.PUBLIC;
};

/**
 * Extracts organization slug from pathname
 * @param {string} pathname - The current pathname
 * @returns {string|null} The organization slug or null
 */
export const extractOrgSlug = (pathname) => {
  const orgMatch = pathname.match(/^\/org\/([^/]+)/);
  return orgMatch ? orgMatch[1] : null;
};

/**
 * Determines if a path is in organization context
 * @param {string} pathname - The current pathname
 * @returns {boolean} True if in organization context
 */
export const isOrganizationContext = (pathname) => {
  return getRouteType(pathname) === ROUTE_TYPES.ORGANIZATION;
};

/**
 * Determines if a path is in user context
 * @param {string} pathname - The current pathname
 * @returns {boolean} True if in user context
 */
export const isUserContext = (pathname) => {
  return getRouteType(pathname) === ROUTE_TYPES.USER;
};

/**
 * Determines the appropriate route path based on group/organization
 * @param {string} groupTitle - The group/organization title
 * @param {string} defaultPath - The default path if no specific routing needed
 * @returns {string} The appropriate route path
 */
export const getRoutePathForGroup = (
  groupTitle,
  defaultPath = '/user/Home',
) => {
  if (!groupTitle) return defaultPath;

  // If the group is AirQo, always route to user paths
  if (groupTitle.toLowerCase() === 'airqo') {
    return defaultPath
      .replace('/org/', '/user/')
      .replace('/dashboard', '/Home');
  }

  // For other organizations, use organization paths
  const orgSlug = groupTitle.toLowerCase().replace(/\s+/g, '-');
  return defaultPath
    .replace('/user/', `/org/${orgSlug}/`)
    .replace('/Home', '/dashboard');
};

/**
 * Validates session access based on route context
 * Unified sessions allow access to both user and organization contexts
 * @param {Object} session - The session object
 * @param {string} routeType - The route type
 * @param {Object} options - Additional validation options
 * @returns {Object} Validation result with isValid and redirectPath
 */
export const validateSessionAccess = (session, routeType, options = {}) => {
  const { pathname } = options;

  // Allow access to auth routes for any session state
  if (routeType === ROUTE_TYPES.AUTH) {
    return { isValid: true };
  }

  // Allow access to public routes
  if (routeType === ROUTE_TYPES.PUBLIC) {
    return { isValid: true };
  }

  // No session - redirect to appropriate login based on context and AirQo rules
  if (!session) {
    // Use enhanced contextual login path
    const redirectPath = getContextualLoginPath(pathname, null, null);
    return {
      isValid: false,
      redirectPath,
      reason: 'No session - redirecting to appropriate login',
    };
  }

  // If session exists, check for proper routing based on login context and group
  // Enhanced with AirQo routing rules
  const activeGroup = session?.user?.activeGroup;

  // Priority 1: AirQo group ALWAYS uses user flow
  if (shouldUseUserFlow(activeGroup)) {
    if (routeType === ROUTE_TYPES.ORGANIZATION) {
      return {
        isValid: false,
        redirectPath: '/user/Home',
        reason: 'AirQo group must use user flow routes',
      };
    }
    // Valid for user routes
    return { isValid: true };
  }

  // Priority 2: Check if this was an organization login
  const isOrgLogin = session.isOrgLogin || session.user?.isOrgLogin;
  const sessionOrgSlug = session.orgSlug || session.user?.requestedOrgSlug;

  if (isOrgLogin && routeType === ROUTE_TYPES.USER) {
    // User logged in through org route but is on user route - redirect to org dashboard
    const orgSlug = sessionOrgSlug || 'airqo';
    // But if orgSlug is 'airqo', redirect to user dashboard instead
    if (orgSlug === 'airqo') {
      return { isValid: true }; // Allow user route for AirQo
    }
    return {
      isValid: false,
      redirectPath: `/org/${orgSlug}/dashboard`,
      reason: 'Organization login users should use organization routes',
    };
  }

  // Priority 3: Check activeGroup for traditional routing (non-AirQo groups)
  if (activeGroup && !isAirQoGroup(activeGroup)) {
    const groupTitle = activeGroup.grp_title || activeGroup.grp_name || '';

    // Non-AirQo group on user route - redirect to organization route
    if (routeType === ROUTE_TYPES.USER && !isOrgLogin) {
      const orgSlug = groupTitle.toLowerCase().replace(/[^a-z0-9]/g, '-');
      return {
        isValid: false,
        redirectPath: `/org/${orgSlug}/dashboard`,
        reason: 'Organization users should use organization routes',
      };
    }
  }

  // Priority 4: For organization routes, validate that active group matches slug
  if (routeType === ROUTE_TYPES.ORGANIZATION && pathname) {
    const orgSlugMatch = pathname.match(/^\/org\/([^/]+)/);
    if (orgSlugMatch) {
      const urlSlug = orgSlugMatch[1];

      // If URL slug is 'airqo', redirect to user flow
      if (urlSlug === 'airqo') {
        return {
          isValid: false,
          redirectPath: '/user/Home',
          reason: 'AirQo routes should use user flow',
        };
      }

      // Check if active group matches the URL slug
      if (activeGroup) {
        const activeGroupSlug = activeGroup.grp_name
          ?.toLowerCase()
          .replace(/[^a-z0-9]/g, '-');

        // If active group doesn't match URL slug, this is invalid
        if (activeGroupSlug !== urlSlug) {
          return {
            isValid: false,
            redirectPath: `/org/${activeGroupSlug}/dashboard`,
            reason: 'Active group does not match organization route slug',
          };
        }
      }
    }
  }

  // If session exists and routing is appropriate, allow access
  return { isValid: true };
};

/**
 * Server-side session validation for middleware
 * @param {NextRequest} request - The Next.js request object
 * @returns {Promise<Object>} Session validation result
 */
export const validateServerSession = async (request) => {
  try {
    const { pathname } = request.nextUrl;
    const routeType = getRouteType(pathname);

    // Get token from middleware context
    let token;
    try {
      token = await getToken({
        req: request,
        secret: getNextAuthSecret(),
      });
    } catch (err) {
      // Handle decryption / JWE failures gracefully
      logger.error('getToken failed during server session validation:', err);

      // If the token cannot be decrypted (e.g., NEXTAUTH_SECRET mismatch or rotated),
      // return an invalid session result so the user is redirected to login.
      return {
        isValid: false,
        redirectPath: '/user/login',
        reason: 'Session invalid or expired (decryption failed)',
      };
    }

    const orgSlug = extractOrgSlug(pathname);

    const validation = validateSessionAccess(token, routeType, {
      pathname,
    });

    return {
      ...validation,
      routeType,
      orgSlug,
      token,
      isOrganizationContext: routeType === ROUTE_TYPES.ORGANIZATION,
      isUserContext: routeType === ROUTE_TYPES.USER,
    };
  } catch (error) {
    logger.error('Server session validation error:', error);
    return {
      isValid: false,
      redirectPath: '/user/login',
      reason: 'Session validation error',
    };
  }
};

/**
 * Client-side session validation
 * @param {Object} session - NextAuth session object
 * @param {string} pathname - Current pathname
 * @returns {Object} Session validation result
 */
export const validateClientSession = (session, pathname) => {
  try {
    const routeType = getRouteType(pathname);
    const orgSlug = extractOrgSlug(pathname);

    const validation = validateSessionAccess(session, routeType, {
      pathname,
    });

    return {
      ...validation,
      routeType,
      orgSlug,
      session,
      isOrganizationContext: routeType === ROUTE_TYPES.ORGANIZATION,
      isUserContext: routeType === ROUTE_TYPES.USER,
    };
  } catch (error) {
    logger.error('Client session validation error:', error);
    return {
      isValid: false,
      redirectPath: '/user/login',
      reason: 'Session validation error',
    };
  }
};

/**
 * Get the appropriate login path for a given route
 * @param {string} pathname - The current pathname
 * @returns {string} The login path
 */
export const getLoginPath = (pathname) => {
  const routeType = getRouteType(pathname);

  if (routeType === ROUTE_TYPES.ORGANIZATION) {
    const orgSlug = extractOrgSlug(pathname) || 'airqo';
    return `/org/${orgSlug}/login`;
  }

  return '/user/login';
};

/**
 * Get the appropriate dashboard path for a route context
 * @param {string} pathname - The current pathname
 * @param {string} orgSlug - The organization slug (for org routes)
 * @returns {string} The dashboard path
 */
export const getDashboardPath = (pathname, orgSlug = null) => {
  const routeType = getRouteType(pathname);

  if (routeType === ROUTE_TYPES.ORGANIZATION || orgSlug) {
    const slug = orgSlug || extractOrgSlug(pathname) || 'airqo';
    return `/org/${slug}/dashboard`;
  }

  return '/user/Home';
};

/**
 * Get navigation configuration based on context
 * @param {string} pathname - The current pathname
 * @returns {Object} Navigation configuration
 */
export const getNavigationConfig = (pathname) => {
  const routeType = getRouteType(pathname);
  const orgSlug = extractOrgSlug(pathname);

  if (routeType === ROUTE_TYPES.ORGANIZATION) {
    return {
      loginPath: `/org/${orgSlug || 'airqo'}/login`,
      dashboardPath: `/org/${orgSlug || 'airqo'}/dashboard`,
      homePath: `/org/${orgSlug || 'airqo'}/dashboard`,
      isOrganization: true,
      orgSlug: orgSlug || 'airqo',
    };
  }

  return {
    loginPath: '/user/login',
    dashboardPath: '/user/Home',
    homePath: '/user/Home',
    isOrganization: false,
    orgSlug: null,
  };
};

/**
 * Check if current user has access to organization
 * With unified sessions, all authenticated users can access any organization they belong to
 * @param {Object} session - The session object
 * @param {string} orgSlug - The organization slug
 * @returns {boolean} True if user has access
 */
export const hasOrganizationAccess = (session, orgSlug) => {
  if (!session || !orgSlug) return false;

  // For unified sessions, check if user belongs to the organization
  // This should be enhanced with proper organization membership validation
  const userOrg = session.user?.organization;
  if (!userOrg) return false;

  // Allow different formats: direct match, case-insensitive match, or slug format
  return (
    userOrg === orgSlug ||
    userOrg.toLowerCase() === orgSlug.toLowerCase() ||
    userOrg.replace(/[\s-_]/g, '').toLowerCase() ===
      orgSlug.replace(/[\s-_]/g, '').toLowerCase()
  );
};

/**
 * Get user's organization context from session
 * @param {Object} session - The session object
 * @returns {Object|null} Organization context or null
 */
export const getUserOrganizationContext = (session) => {
  if (!session?.user) return null;

  // Extract organization context from session if available
  return {
    organization: session.user.organization || null,
    long_organization: session.user.long_organization || null,
    role: session.user.privilege || 'user',
    permissions: session.user.permissions || [],
  };
};

/**
 * Check if current route requires authentication
 * @param {string} pathname - The current pathname
 * @returns {boolean} True if authentication is required
 */
export const requiresAuth = (pathname) => {
  const routeType = getRouteType(pathname);
  return (
    routeType === ROUTE_TYPES.USER || routeType === ROUTE_TYPES.ORGANIZATION
  );
};

// Utility function to create a session-aware redirect
export const createSessionRedirect = (
  pathname,
  fallbackPath = '/user/login',
) => {
  const routeType = getRouteType(pathname);

  if (routeType === ROUTE_TYPES.ORGANIZATION) {
    const orgSlug = extractOrgSlug(pathname) || 'airqo';
    return `/org/${orgSlug}/login`;
  }

  return fallbackPath;
};

/**
 * Debug logging for session validation (development only)
 * @param {Object} validation - The validation result object
 * @param {string} context - Context string for debugging
 */
export const logSessionValidation = (
  validation,
  context = 'Session validation',
) => {
  if (process.env.NODE_ENV === 'development') {
    logger.debug(`${context}:`, {
      isValid: validation.isValid,
      routeType: validation.routeType,
      redirectPath: validation.redirectPath,
      reason: validation.reason,
      orgSlug: validation.orgSlug,
      isOrganizationContext: validation.isOrganizationContext,
      isUserContext: validation.isUserContext,
    });
  }
};

// Legacy compatibility - maintain existing API surface for backward compatibility
// Note: SESSION_TYPES are kept for compatibility but no longer used for validation
export const SESSION_TYPES = {
  USER: 'user',
  ORGANIZATION: 'organization',
};

const sessionUtils = {
  SESSION_TYPES,
  ROUTE_TYPES,
  getRouteType,
  extractOrgSlug,
  isOrganizationContext,
  isUserContext,
  validateSessionAccess,
  validateServerSession,
  validateClientSession,
  getLoginPath,
  getDashboardPath,
  getNavigationConfig,
  hasOrganizationAccess,
  getUserOrganizationContext,
  requiresAuth,
  createSessionRedirect,
  logSessionValidation,
};

export default sessionUtils;
