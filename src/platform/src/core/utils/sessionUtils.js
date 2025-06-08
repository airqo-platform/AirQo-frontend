/**
 * Professional Session Management Utilities
 * Provides comprehensive session type validation and route protection
 * Following Next.js and NextAuth best practices
 */

import { getToken } from 'next-auth/jwt';
import logger from '@/lib/logger';

// Session type constants
export const SESSION_TYPES = {
  USER: 'user',
  ORGANIZATION: 'organization',
};

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
    pathname.startsWith('/collocation') ||
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
 * Validates if a session type can access a specific route type
 * @param {string} sessionType - The session type
 * @param {string} routeType - The route type
 * @param {Object} options - Additional validation options
 * @returns {Object} Validation result with isValid and redirectPath
 */
export const validateSessionAccess = (sessionType, routeType, options = {}) => {
  const { pathname, orgSlug } = options;

  // Allow access to auth routes for any session state
  if (routeType === ROUTE_TYPES.AUTH) {
    return { isValid: true };
  }

  // Allow access to public routes
  if (routeType === ROUTE_TYPES.PUBLIC) {
    return { isValid: true };
  }

  // No session - redirect to appropriate login
  if (!sessionType) {
    if (routeType === ROUTE_TYPES.ORGANIZATION) {
      const slug = orgSlug || extractOrgSlug(pathname) || 'airqo';
      return {
        isValid: false,
        redirectPath: `/org/${slug}/login`,
        reason: 'No session for organization route',
      };
    }
    return {
      isValid: false,
      redirectPath: '/user/login',
      reason: 'No session for user route',
    };
  }

  // Organization session validation
  if (sessionType === SESSION_TYPES.ORGANIZATION) {
    if (routeType === ROUTE_TYPES.USER) {
      const slug = orgSlug || 'airqo';
      return {
        isValid: false,
        redirectPath: `/org/${slug}/dashboard`,
        reason: 'Organization session cannot access user routes',
      };
    }
    if (routeType === ROUTE_TYPES.ORGANIZATION) {
      return { isValid: true };
    }
  }

  // User session validation
  if (sessionType === SESSION_TYPES.USER) {
    if (routeType === ROUTE_TYPES.ORGANIZATION) {
      return {
        isValid: false,
        redirectPath: '/user/Home',
        reason: 'User session cannot access organization routes',
      };
    }
    if (routeType === ROUTE_TYPES.USER) {
      return { isValid: true };
    }
  }

  // Default deny
  return {
    isValid: false,
    redirectPath: '/user/login',
    reason: 'Invalid session or route combination',
  };
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
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    const sessionType = token?.sessionType;
    const orgSlug = token?.orgSlug || extractOrgSlug(pathname);

    const validation = validateSessionAccess(sessionType, routeType, {
      pathname,
      orgSlug,
    });

    return {
      ...validation,
      sessionType,
      routeType,
      orgSlug,
      token,
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
    const sessionType = session?.sessionType || session?.user?.sessionType;
    const orgSlug =
      session?.orgSlug || session?.user?.orgSlug || extractOrgSlug(pathname);

    const validation = validateSessionAccess(sessionType, routeType, {
      pathname,
      orgSlug,
    });

    return {
      ...validation,
      sessionType,
      routeType,
      orgSlug,
      session,
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
 * Get the appropriate dashboard path for a session type
 * @param {string} sessionType - The session type
 * @param {string} orgSlug - The organization slug (required for org sessions)
 * @returns {string} The dashboard path
 */
export const getDashboardPath = (sessionType, orgSlug = null) => {
  if (sessionType === SESSION_TYPES.ORGANIZATION) {
    const slug = orgSlug || 'airqo';
    return `/org/${slug}/dashboard`;
  }

  return '/user/Home';
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

/**
 * Check if session is properly initialized for a route
 * @param {Object} session - NextAuth session object
 * @param {string} pathname - Current pathname
 * @returns {boolean} True if session is properly initialized
 */
export const isSessionInitialized = (session, pathname) => {
  if (!session?.user) return false;

  const routeType = getRouteType(pathname);
  const sessionType = session.sessionType || session.user.sessionType;

  // For organization routes, ensure orgSlug is present
  if (
    routeType === ROUTE_TYPES.ORGANIZATION &&
    sessionType === SESSION_TYPES.ORGANIZATION
  ) {
    return !!(session.orgSlug || session.user.orgSlug);
  }

  // For user routes, ensure basic user data is present
  if (routeType === ROUTE_TYPES.USER && sessionType === SESSION_TYPES.USER) {
    return !!(session.user.id && session.user.email);
  }

  return true;
};

/**
 * Log session validation for debugging
 * @param {Object} validation - Validation result
 * @param {string} context - Context string for logging
 */
export const logSessionValidation = (
  validation,
  context = 'Session validation',
) => {
  if (process.env.NODE_ENV === 'development') {
    logger.debug(`${context}:`, {
      isValid: validation.isValid,
      sessionType: validation.sessionType,
      routeType: validation.routeType,
      redirectPath: validation.redirectPath,
      reason: validation.reason,
      orgSlug: validation.orgSlug,
    });
  }
};

export default {
  SESSION_TYPES,
  ROUTE_TYPES,
  getRouteType,
  extractOrgSlug,
  validateSessionAccess,
  validateServerSession,
  validateClientSession,
  getLoginPath,
  getDashboardPath,
  requiresAuth,
  isSessionInitialized,
  logSessionValidation,
};
