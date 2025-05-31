import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;

    // Log successful authentication for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ Authenticated access to: ${pathname}`);
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Allow access to auth pages and API routes
        if (
          pathname.startsWith('/account/') ||
          pathname.startsWith('/api/auth/') ||
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
        const isProtectedRoute = protectedRoutes.some(
          (route) => pathname.startsWith(route) || pathname === route,
        );

        if (!isProtectedRoute) {
          return true; // Allow non-protected routes
        }

        // For protected routes, check authentication
        if (!token) {
          if (process.env.NODE_ENV === 'development') {
            console.log(`❌ Unauthorized access attempt to: ${pathname}`);
          }
          return false;
        }

        // Validate token structure
        if (!token.email || !token.accessToken) {
          if (process.env.NODE_ENV === 'development') {
            console.log(`❌ Invalid token for: ${pathname}`, {
              hasEmail: !!token.email,
              hasAccessToken: !!token.accessToken,
            });
          }
          return false;
        }

        // Check token expiration (24 hours)
        const now = Math.floor(Date.now() / 1000);
        const tokenAge = now - (token.iat || 0);
        const maxAge = 24 * 60 * 60; // 24 hours in seconds

        if (tokenAge > maxAge) {
          if (process.env.NODE_ENV === 'development') {
            console.log(`❌ Expired token for: ${pathname}`, {
              tokenAge,
              maxAge,
            });
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
