

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'


import { withAuth } from "next-auth/middleware"

// Routes that don't require authentication
const PUBLIC_ROUTES = [
  '/login',
  '/register', 
  '/forgot-password',
  '/reset-password'
]

// Static assets and system routes to skip
const SKIP_PATHS = [
  '/api/',
  '/_next/',
  '/static/',
  '/favicon.ico',
  '/public/'
]

export default withAuth(
  function middleware(request) {
    const { pathname } = request.nextUrl
    
    // Skip middleware for API routes and static assets
    if (SKIP_PATHS.some(path => pathname.startsWith(path))) {
      return NextResponse.next()
    }

    const token = request.nextauth.token
    const isAuthenticated = !!token
    
    const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route))
    
    // Redirect unauthenticated users to login
    if (!isAuthenticated && !isPublicRoute) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('from', pathname)
      return NextResponse.redirect(loginUrl)
    }
    
    // Redirect authenticated users away from auth pages
    if (isAuthenticated && isPublicRoute) {
      // Check privilege/organization or falls back to isAirqoAdmin cookie
      const isAirqoAdmin = (token?.organization?.toLowerCase() === 'airqo' && 
                            (token?.privilege?.toLowerCase()?.includes('admin') || 
                             token?.privilege?.toLowerCase() === 'super' || 
                             token?.privilege?.toLowerCase() === 'net admin')) ||
                           request.cookies.get('isAirqoAdmin')?.value === 'true'
                             
      const defaultRoute = isAirqoAdmin ? '/dashboard' : '/dashboard/devices'
      return NextResponse.redirect(new URL(defaultRoute, request.url))
    }

    // Restrict access to /dashboard to AirQo Admins only
    if (pathname === '/dashboard' || pathname === '/dashboard/') {
      const isAirqoAdmin = (token?.organization?.toLowerCase() === 'airqo' && 
                            (token?.privilege?.toLowerCase()?.includes('admin') || 
                             token?.privilege?.toLowerCase() === 'super' || 
                             token?.privilege?.toLowerCase() === 'net admin')) ||
                           request.cookies.get('isAirqoAdmin')?.value === 'true'
                             
      if (!isAirqoAdmin) {
        return NextResponse.redirect(new URL('/dashboard/devices', request.url))
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

