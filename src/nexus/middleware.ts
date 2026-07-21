import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const isProduction = process.env.NODE_ENV === 'production';
const sessionCookieName = isProduction
  ? '__Secure-next-auth.session-token'
  : 'next-auth.session-token';

export default async function middleware(req: NextRequest) {
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

  const token = await getToken({
    req,
    cookieName: sessionCookieName,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    const signInUrl = new URL('/user/login', req.url);
    signInUrl.searchParams.set('callbackUrl', req.url);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

// Protect all routes except public/auth, static assets, and API routes.
// Public routes match the list in src/shared/lib/public-routes.ts — keep
// both in sync when adding new public routes.
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|user/login|user/creation|user/forgotPwd|user/delete/confirm|org-invite|request-organization|org/[^/]+/login|org/[^/]+/register|.*\\.(?:svg|png|jpg|jpeg|webp|ico)$).*)',
  ],
};
