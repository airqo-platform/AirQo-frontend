import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const isProduction = process.env.NODE_ENV === 'production';
const sessionCookieName = isProduction
  ? '__Secure-next-auth.session-token'
  : 'next-auth.session-token';

export default async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    cookieName: sessionCookieName,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // RSC flight requests (prefetches during navigation) must not be redirected —
  // the client-side AuthProvider expects an RSC payload and a redirect causes a
  // 500. Instead, return 401 so the client can handle the unauthenticated state
  // gracefully without spoofing this header to bypass the auth gate.
  const rscHeader = req.headers.get('rsc');
  const isRscFlight = rscHeader === '1' || req.nextUrl.searchParams.has('_rsc');

  if (!token) {
    if (isRscFlight) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
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
