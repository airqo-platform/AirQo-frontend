import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import {
  validateServerSession,
  logSessionValidation,
} from './core/utils/sessionUtils';
import { getLoginRedirectPath } from '@/app/api/auth/[...nextauth]/options';
import logger from './lib/logger';

// Optimized route pattern matching with caching
const ROUTE_PATTERNS = {
  AUTH: ['/login', '/register', '/forgotPwd', '/creation', '/verify-email'],
  PUBLIC: ['/', '/public/', '/_next/', '/api/auth/', '/favicon.ico'],
  PROTECTED: [
    '/org/',
    '/user/',
    '(individual)',
    '(organization)',
    '/admin',
    '/create-organization',
    '/Home',
    '/analytics',
    '/collocation',
    '/settings',
  ],
};

// Cache for route pattern matching to avoid repeated string operations
const routeMatchCache = new Map();

// Check if pathname matches any pattern in array with caching
const matchesPatterns = (pathname, patterns) => {
  const cacheKey = `${pathname}-${patterns.join(',')}`;

  if (routeMatchCache.has(cacheKey)) {
    return routeMatchCache.get(cacheKey);
  }

  const matches = patterns.some(
    (pattern) => pathname.includes(pattern) || pathname.startsWith(pattern),
  );

  // Cache result (limit cache size)
  if (routeMatchCache.size > 1000) {
    const firstKey = routeMatchCache.keys().next().value;
    routeMatchCache.delete(firstKey);
  }

  routeMatchCache.set(cacheKey, matches);
  return matches;
};

// Determine fallback login path with centralized logic
const getFallbackLoginPath = (pathname) => {
  try {
    return getLoginRedirectPath(pathname);
  } catch (error) {
    logger.error('Fallback login determination failed:', error);
    return '/user/login';
  }
};

export default withAuth(
  async function middleware(request) {
    try {
      const validation = await validateServerSession(request);
      logSessionValidation(validation, 'Middleware validation');

      if (!validation.isValid && validation.redirectPath) {
        logger.info('Middleware redirecting:', {
          from: request.nextUrl.pathname,
          to: validation.redirectPath,
          reason: validation.reason,
        });

        return NextResponse.redirect(
          new URL(validation.redirectPath, request.url),
        );
      }

      return NextResponse.next();
    } catch (error) {
      logger.error('Middleware error:', error);

      const fallbackLogin = getFallbackLoginPath(request.nextUrl.pathname);
      return NextResponse.redirect(new URL(fallbackLogin, request.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Always allow access to authentication pages
        if (matchesPatterns(pathname, ROUTE_PATTERNS.AUTH)) {
          return true;
        }

        // Allow access to public routes
        if (matchesPatterns(pathname, ROUTE_PATTERNS.PUBLIC)) {
          return true;
        }

        // Require authentication for protected routes
        if (matchesPatterns(pathname, ROUTE_PATTERNS.PROTECTED)) {
          return !!token;
        }

        // Default allow for unmatched routes
        return true;
      },
    },
  },
);

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
