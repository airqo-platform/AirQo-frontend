import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;

    // Log access for debugging in development
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.log(`🔍 Middleware checking: ${pathname}`);
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Always allow access to auth pages (client-side redirects handle logged-in users)
        if (pathname.includes('(auth)') || pathname.startsWith('/account/')) {
          return true;
        }

        // Allow access to API routes and static files
        if (
          pathname.startsWith('/api/') ||
          pathname.startsWith('/_next') ||
          pathname.startsWith('/favicon') ||
          pathname.startsWith('/robots') ||
          pathname.startsWith('/sitemap')
        ) {
          return true;
        }

        // Protected routes that require authentication
        const protectedRoutes = [
          '/Home',
          '/map',
          '/analytics',
          '/settings',
          '/collocation',
        ];

        // Check for organization-specific routes under /org/
        const orgRoutePattern =
          /^\/org\/([^/]+)(\/([^/]+))?\/(dashboard|insights|preferences|map)/;
        const isOrgRoute = orgRoutePattern.test(pathname);

        const isProtectedRoute =
          protectedRoutes.some((route) => pathname.startsWith(route)) ||
          isOrgRoute;

        // Allow non-protected routes without authentication
        if (!isProtectedRoute) {
          return true;
        }

        // For protected routes, require valid authentication
        if (!token) {
          if (process.env.NODE_ENV === 'development') {
            // eslint-disable-next-line no-console
            console.log(
              `❌ Unauthorized access attempt to protected route: ${pathname}`,
            );
          }
          return false;
        }

        // Validate token structure for protected routes
        if (!token.email || !token.accessToken) {
          if (process.env.NODE_ENV === 'development') {
            // eslint-disable-next-line no-console
            console.log(`❌ Invalid token structure for: ${pathname}`);
          }
          return false;
        }

        return true;
      },
    },
    pages: {
      signIn: '/account/login',
      error: '/account/login',
    },
  },
);

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (except auth)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, robots.txt, sitemap.xml (metadata files)
     * - images in public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$|.*\\.ico$).*)',
  ],
};
