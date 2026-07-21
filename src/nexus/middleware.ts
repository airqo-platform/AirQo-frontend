import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

const isProduction = process.env.NODE_ENV === 'production';
const sessionCookieName = isProduction
  ? '__Secure-next-auth.session-token'
  : 'next-auth.session-token';

export default withAuth(
  function middleware(req) {
    // RSC flight requests (prefetches during navigation) should pass through
    // without auth redirect. The client-side AuthProvider handles unauthenticated
    // users by showing a loading overlay and redirecting gracefully. Redirecting
    // an RSC flight request causes a 500 because the client router expects an
    // RSC payload, not a redirect response.
    const rscHeader = req.headers.get('rsc');
    const isRscFlight = rscHeader === '1' || req.nextUrl.searchParams.has('_rsc');

    if (isRscFlight) {
      return NextResponse.next();
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/user/login',
    },
    cookies: {
      sessionToken: {
        name: sessionCookieName,
      },
    },
    secret: process.env.NEXTAUTH_SECRET,
  }
);

// Protect all routes except public/auth, static assets, and API routes.
// Public routes match the list in src/shared/lib/public-routes.ts — keep
// both in sync when adding new public routes.
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|user/login|user/creation|user/forgotPwd|user/delete/confirm|org-invite|request-organization|.*\\.(?:svg|png|jpg|jpeg|webp|ico)$).*)',
  ],
};
