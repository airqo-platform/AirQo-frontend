import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(request) {
    const { pathname } = request.nextUrl;
    const token = request.nextauth.token;

    // If no token, let NextAuth handle the redirect
    if (!token) {
      return NextResponse.next();
    }

    const sessionType = token.sessionType;
    const isOrgRoute = pathname.includes('/org/');
    const isUserRoute =
      pathname.includes('/user/') || pathname.includes('(individual)');

    // Strict session type enforcement
    if (sessionType === 'organization' && isUserRoute) {
      // Organization session trying to access user routes
      const orgSlug = token.orgSlug || 'airqo';
      return NextResponse.redirect(
        new URL(`/org/${orgSlug}/dashboard`, request.url),
      );
    }

    if (sessionType === 'user' && isOrgRoute) {
      // User session trying to access organization routes
      return NextResponse.redirect(new URL('/user/Home', request.url));
    }

    // Organization route but no valid organization session
    if (isOrgRoute && sessionType !== 'organization') {
      const orgSlugMatch = pathname.match(/^\/org\/([^/]+)/);
      const orgSlug = orgSlugMatch ? orgSlugMatch[1] : 'airqo';
      return NextResponse.redirect(
        new URL(`/org/${orgSlug}/login`, request.url),
      );
    }

    // User route but no valid user session
    if (isUserRoute && sessionType !== 'user') {
      return NextResponse.redirect(new URL('/user/login', request.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Allow access to login pages without authentication
        if (
          pathname.includes('/login') ||
          pathname.includes('/register') ||
          pathname.includes('/forgotPwd')
        ) {
          return true;
        }

        // Allow access to public routes
        if (pathname === '/' || pathname.startsWith('/public/')) {
          return true;
        }

        // Require authentication for protected routes
        if (pathname.includes('/org/') || pathname.includes('/user/')) {
          return !!token;
        }

        return true;
      },
    },
  },
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
