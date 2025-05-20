import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get pathname from request
  const pathname = request.nextUrl.pathname;

  // Check if it's an organization route
  if (
    pathname.startsWith('/account/login/') ||
    pathname.startsWith('/account/register/')
  ) {
    const slug = pathname.split('/')[3]; // Get org slug from URL

    // If no slug provided, redirect to main login
    if (!slug) {
      return NextResponse.redirect(new URL('/account/login', request.url));
    }

    // Validate slug format (alphanumeric, hyphens allowed)
    const validSlug = /^[a-zA-Z0-9-]+$/.test(slug);
    if (!validSlug) {
      return NextResponse.redirect(new URL('/account/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/account/login/:org_slug*', '/account/register/:org_slug*'],
};
