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
      authorized: ({ req, token }) => {
        // Bypass server-side protection for OAuth callbacks so the client can process the token hash.
        // Client-side AuthWrapper will still enforce protection if the token is invalid.
        if (req.nextUrl.searchParams.has('success')) {
          return true;
        }
        return Boolean(token);
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
