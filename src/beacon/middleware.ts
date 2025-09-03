

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'


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

/**
 * Middleware function to protect routes
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Skip middleware for API routes and static assets
  if (SKIP_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Check authentication token
  const token = request.cookies.get('token')?.value
  const isAuthenticated = !!token
  
  // Check if route is public
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route))
  
  // Redirect unauthenticated users to login
  if (!isAuthenticated && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url)
    // Preserve the original destination for redirect after login
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)

  }
  
  // Redirect authenticated users away from auth pages
  if (isAuthenticated && isPublicRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  return NextResponse.next()
}

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

