import { withAuth } from "next-auth/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { vertexConfig } from "@/vertex.config";

const isProduction = process.env.NODE_ENV === "production";
const sessionCookieName = isProduction
  ? "__Secure-next-auth.session-token"
  : "next-auth.session-token";

// With auth.provider "none" the app has no login flow: skip NextAuth
// entirely and only keep the root redirect into the dashboard.
function noAuthMiddleware(req: NextRequest) {
  if (req.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/home", req.url));
  }
  return NextResponse.next();
}

const authMiddleware = withAuth(
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

export default vertexConfig.auth.provider === "none"
  ? noAuthMiddleware
  : authMiddleware;

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
    '/((?!api(?:$|/)|_next/static(?:$|/)|_next/image(?:$|/)|favicon\\.ico$|login(?:$|/)|auth-error(?:$|/)|.*\\.).*)',
  ],
};
