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
      // Log error and fallback to appropriate login based on route context
      logger.error('Middleware error:', error);

      // Determine fallback redirect using enhanced routing logic
      const pathname = request.nextUrl.pathname;
      let fallbackLogin = '/user/login';

      // Enhanced fallback logic that considers AirQo rules
      try {
        // Try to get active group from request headers or other context
        // For now, use pathname-based fallback with AirQo considerations
        if (pathname.includes('/org/')) {
          const orgSlugMatch = pathname.match(/^\/org\/([^/]+)/);
          const orgSlug = orgSlugMatch ? orgSlugMatch[1] : 'airqo';

          // If the org slug is 'airqo', redirect to user login instead
          if (orgSlug === 'airqo') {
            fallbackLogin = '/user/login';
          } else {
            fallbackLogin = `/org/${orgSlug}/login`;
          }
        } else {
          fallbackLogin = '/user/login';
        }
      } catch (fallbackError) {
        logger.error('Fallback login determination failed:', fallbackError);
        fallbackLogin = '/user/login';
      }

      return NextResponse.redirect(new URL(fallbackLogin, request.url));
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
        } // Require authentication for protected routes
        if (
          pathname.includes('/org/') ||
          pathname.includes('/user/') ||
          pathname.includes('(individual)') ||
          pathname.includes('(organization)') ||
          pathname.startsWith('/admin') ||
          pathname.startsWith('/create-organization') ||
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
