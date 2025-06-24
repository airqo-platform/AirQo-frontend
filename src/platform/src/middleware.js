import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import {
  validateServerSession,
  logSessionValidation,
} from './core/utils/sessionUtils';
import { getLoginRedirectPath } from '@/app/api/auth/[...nextauth]/options';
import logger from './lib/logger';

// Centralized route pattern matching
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

// Check if pathname matches any pattern in array
const matchesPatterns = (pathname, patterns) => {
  return patterns.some(
    (pattern) => pathname.includes(pattern) || pathname.startsWith(pattern),
  );
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
