import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Define authentication pages - actual URL paths, not route groups
const AUTH_PAGES = [
  // Individual user auth pages (route group structure)
  '/user/login',
  '/user/creation',
  '/user/creation/individual/register',
  '/user/creation/individual/verify-email',
  '/user/creation/individual/interest',
  '/user/creation/organisation/register',
  '/user/creation/organisation/verify-email',
  '/user/creation/organisation/request-access',
  '/user/creation/organisation/verify',
  '/user/forgotPwd',
  '/user/forgotPwd/reset',

  // Organization auth pages
  '/org/*/login',
  '/org/*/register',
  '/org/*/forgotPwd',
];

// Pages that require authentication
const PROTECTED_PAGES = [
  // Individual user protected pages
  '/user/settings',
  '/user/map',
  '/user/Home',
  '/user/analytics',
  '/user/collocation',

  // Organization protected pages
  '/org/*/dashboard',
  '/org/*/insights',
  '/org/*/preferences',
  '/org/*/settings',
];

// Cache for authorization options to avoid repeated calculations
const authOptionsCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCachedAuthOptions(pathname) {
  const cacheKey = pathname;
  const cached = authOptionsCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.value;
  }

  // Helper function to match patterns with wildcards
  const matchesPattern = (pattern) => {
    if (pattern.includes('*')) {
      const regex = new RegExp(
        '^' + pattern.replace(/\*/g, '[^/]+') + '(?:/.*)?$',
      );
      return regex.test(pathname);
    }
    return pathname.startsWith(pattern);
  };

  // Determine auth requirements
  const requiresAuth = PROTECTED_PAGES.some(matchesPattern);
  const isAuthPage = AUTH_PAGES.some(matchesPattern);

  const result = { requiresAuth, isAuthPage };
  authOptionsCache.set(cacheKey, { value: result, timestamp: Date.now() });

  return result;
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Skip middleware for API routes, static files, and Next.js internals
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  try {
    // Get authentication status
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    const isAuthenticated = !!token;
    const { requiresAuth, isAuthPage } = getCachedAuthOptions(pathname);

    // If user is authenticated and trying to access auth pages, redirect to appropriate dashboard
    if (isAuthenticated && isAuthPage) {
      // Determine redirect based on the type of auth page
      let redirectUrl;

      if (pathname.startsWith('/org/')) {
        // For organization pages, extract org slug and redirect to org dashboard
        const orgSlugMatch = pathname.match(/^\/org\/([^/]+)/);
        const orgSlug = orgSlugMatch ? orgSlugMatch[1] : 'airqo';
        redirectUrl = `/org/${orgSlug}/dashboard`;
      } else {
        // For individual user pages, redirect to Home
        redirectUrl = '/user/Home';
      }

      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }

    // If page requires authentication and user is not authenticated, redirect to login
    if (requiresAuth && !isAuthenticated) {
      let loginUrl;

      if (pathname.startsWith('/org/')) {
        // For organization pages, extract org slug and redirect to org login
        const orgSlugMatch = pathname.match(/^\/org\/([^/]+)/);
        const orgSlug = orgSlugMatch ? orgSlugMatch[1] : 'airqo';
        loginUrl = `/org/${orgSlug}/login`;
      } else {
        // For individual user pages, redirect to account login
        loginUrl = '/user/login';
      }

      // Store the attempted URL for post-login redirect
      const redirectUrl = new URL(loginUrl, request.url);
      redirectUrl.searchParams.set('callbackUrl', pathname);

      return NextResponse.redirect(redirectUrl);
    }

    return NextResponse.next();
  } catch (error) {
    // Log only critical errors to avoid noise
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('Middleware auth error:', error);
    }

    // In case of auth error, allow the request to proceed
    // The application can handle auth state on the client side
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, icons, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)',
  ],
};
