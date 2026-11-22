

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'


import { withAuth } from "next-auth/middleware"
import { isSystemGroup } from "@/beacon.config"
import { AUTH_SECRET } from "@/lib/auth-secret"

// Routes that don't require authentication
const PUBLIC_ROUTES = ['/login']

// Static assets and system routes to skip
const SKIP_PATHS = [
  '/api/',
  '/_next/',
  '/static/',
  '/favicon.ico',
  '/public/'
]

/**
 * Members of the system group with admin rights land on the fleet overview. GroupProvider sets the
 * `isSystemAdmin` cookie once it has the user's groups; before that the session's organisation decides.
 */
function isSystemAdminRequest(token: any, request: NextRequest): boolean {
  const privilege = token?.privilege?.toLowerCase() ?? ''
  const fromSession =
    isSystemGroup(token?.organization) &&
    (privilege.includes('admin') || privilege === 'super' || privilege === 'net admin')
  return fromSession || request.cookies.get('isSystemAdmin')?.value === 'true'
}

export default withAuth(
  function middleware(request) {
    const { pathname } = request.nextUrl
    
    // Skip middleware for API routes and static assets
    if (SKIP_PATHS.some(path => pathname.startsWith(path))) {
      return NextResponse.next()
    }

    const token = request.nextauth.token as any;
    const expTime = token?.exp;
    // Add a 5-minute (300 seconds) grace period for clock drift
    const isTokenExpired =
      typeof expTime === 'number' && Date.now() / 1000 > (expTime + 300);
    const isAuthenticated = !!token && !isTokenExpired;
    const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route))

    // Unauthenticated users go to /login, which signs them in to the demo
    if (!isAuthenticated && !isPublicRoute) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('from', `${pathname}${request.nextUrl.search}`)
      return NextResponse.redirect(loginUrl)
    }
    
    // Redirect authenticated users away from auth pages
    if (isAuthenticated && isPublicRoute) {
      const defaultRoute = isSystemAdminRequest(token, request) ? '/dashboard' : '/dashboard/home'
      return NextResponse.redirect(new URL(defaultRoute, request.url))
    }

    // The fleet overview (/dashboard) is for system group admins only
    if (pathname === '/dashboard' || pathname === '/dashboard/') {
      if (!isSystemAdminRequest(token, request)) {
        return NextResponse.redirect(new URL('/dashboard/home', request.url))
      }
    }
    
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: () => true, // Let the middleware function handle the routing logic
    },
    pages: {
      signIn: "/login",
    },
    secret: AUTH_SECRET,
  }
)

/**
 * Middleware configuration
 * Specifies which routes the middleware should run on
 */
export const config = {

  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, robots.txt (metadata files)
     * - public folder
     * - files with extensions (e.g., .png, .jpg)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|public|.*\\.).*)',
  ]
}

