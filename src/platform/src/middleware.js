import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Get the token from the request
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Allow access to public paths and API routes
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/robots.txt') ||
    pathname.startsWith('/sitemap.xml') ||
    pathname.includes('/login') ||
    pathname.includes('/register') ||
    pathname.includes('/forgotPwd') ||
    pathname === '/'
  ) {
    return NextResponse.next();
  }

  // For organization routes, check if user has organization context
  if (pathname.startsWith('/org/')) {
    if (!token) {
      // Not authenticated, redirect to login
      const orgSlug = pathname.split('/')[2];
      return NextResponse.redirect(
        new URL(`/org/${orgSlug}/login`, request.url),
      );
    }

    // Check if user has organization access
    if (!token.organization) {
      // User is authenticated but doesn't have organization context
      const orgSlug = pathname.split('/')[2];
      return NextResponse.redirect(
        new URL(`/org/${orgSlug}/login`, request.url),
      );
    }
  }

  // For individual user routes
  if (pathname.startsWith('/individual/')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};
