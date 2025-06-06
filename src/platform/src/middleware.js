import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Get the token from the request
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Public paths that don't require authentication
  const publicPaths = [
    '/api/',
    '/_next/',
    '/favicon.ico',
    '/robots.txt',
    '/sitemap.xml',
    '/icons/',
    '/images/',
  ];

  // Auth paths that should be accessible without token
  const authPaths = ['/login', '/register', '/forgotPwd', '/creation'];

  // Check if path is public or auth-related
  if (
    publicPaths.some((path) => pathname.startsWith(path)) ||
    authPaths.some((path) => pathname.includes(path))
  ) {
    return NextResponse.next();
  }

  // Handle root path redirect
  if (pathname === '/') {
    return token
      ? NextResponse.redirect(new URL('/user/Home', request.url))
      : NextResponse.redirect(new URL('/user/login', request.url));
  }

  // Handle organization routes
  if (pathname.startsWith('/org/')) {
    const pathSegments = pathname.split('/').filter(Boolean);
    const orgSlug = pathSegments[1];

    if (!orgSlug) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // If not authenticated, redirect to org login
    if (!token) {
      return NextResponse.redirect(
        new URL(`/org/${orgSlug}/login`, request.url),
      );
    }

    // Check if user has organization access
    const userOrgSlug = token.organization?.slug || token.orgSlug;
    if (!userOrgSlug || userOrgSlug !== orgSlug) {
      return NextResponse.redirect(
        new URL(`/org/${orgSlug}/login`, request.url),
      );
    }

    // If authenticated and accessing org root, redirect to dashboard
    if (pathname === `/org/${orgSlug}` || pathname === `/org/${orgSlug}/`) {
      return NextResponse.redirect(
        new URL(`/org/${orgSlug}/dashboard`, request.url),
      );
    }
  }

  // Handle user routes
  if (pathname.startsWith('/user/')) {
    // Allow access to auth routes without token
    if (authPaths.some((path) => pathname.includes(path))) {
      return NextResponse.next();
    }

    // If not authenticated, redirect to user login
    if (!token) {
      return NextResponse.redirect(new URL('/user/login', request.url));
    }

    // If authenticated and accessing user root, redirect to Home
    if (pathname === '/user' || pathname === '/user/') {
      return NextResponse.redirect(new URL('/user/Home', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|icons|images).*)',
  ],
};
