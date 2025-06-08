import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import {
  validateServerSession,
  logSessionValidation,
} from './core/utils/sessionUtils';
import logger from './lib/logger';

export default withAuth(
  async function middleware(request) {
    try {
      // Validate session using professional utilities
      const validation = await validateServerSession(request);

      // Log validation for debugging in development
      logSessionValidation(validation, 'Middleware validation');

      // If validation fails, redirect to appropriate login
      if (!validation.isValid && validation.redirectPath) {
        return NextResponse.redirect(
          new URL(validation.redirectPath, request.url),
        );
      }

      return NextResponse.next();
    } catch (error) {
      // Log error and fallback to user login on error
      logger.error('Middleware error:', error);
      return NextResponse.redirect(new URL('/user/login', request.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Always allow access to authentication pages
        if (
          pathname.includes('/login') ||
          pathname.includes('/register') ||
          pathname.includes('/forgotPwd') ||
          pathname.includes('/creation') ||
          pathname.includes('/verify-email')
        ) {
          return true;
        }

        // Allow access to public routes
        if (
          pathname === '/' ||
          pathname.startsWith('/public/') ||
          pathname.startsWith('/_next/') ||
          pathname.startsWith('/api/auth/') ||
          pathname === '/favicon.ico'
        ) {
          return true;
        }

        // Require authentication for protected routes
        if (
          pathname.includes('/org/') ||
          pathname.includes('/user/') ||
          pathname.includes('(individual)') ||
          pathname.includes('(organization)') ||
          pathname.startsWith('/Home') ||
          pathname.startsWith('/analytics') ||
          pathname.startsWith('/collocation') ||
          pathname.startsWith('/settings')
        ) {
          return !!token;
        }

        // Default allow for unmatched routes
        return true;
      },
    },
  },
);

export const config = {
  matcher: [
    /*
     * Match all routes except:
     * - API routes (/api/*)
     * - Static files (/_next/*)
     * - Public files
     * - Favicon
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
