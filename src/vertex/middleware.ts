import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const isProduction = process.env.NODE_ENV === "production";
const sessionCookieName = isProduction
  ? "__Secure-next-auth.session-token-v2"
  : "next-auth.session-token-v2";

export default withAuth(
  function middleware(req) {
    if (req.nextUrl.pathname === "/") {
      return NextResponse.redirect(new URL("/home", req.url));
    }
  },
  {
    callbacks: {
      authorized: () => {
        // Delegate route protection entirely to the client-side AuthWrapper.
        // This is strictly necessary because the OAuth flow relies on URL hash fragments (#token=...)
        // which the server-side middleware cannot read. If we block requests here, 
        // the Next.js server will strip the callback and force a redirect loop through /login.
        return true;
      },
    },
    pages: {
      signIn: "/login",
      error: "/auth-error",
    },
    cookies: {
      sessionToken: {
        name: sessionCookieName,
      },
    },
    secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files with extensions
     */
    '/((?!api(?:$|/)|_next/static(?:$|/)|_next/image(?:$|/)|favicon\\.ico$|login(?:$|/)|download(?:$|/)|auth-error(?:$|/)|.*\\.).*)',
  ],
};
