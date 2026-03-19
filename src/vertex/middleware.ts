import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const isProduction = process.env.NODE_ENV === "production";
const sessionCookieName = isProduction
  ? "__Secure-next-auth.session-token"
  : "vertex.next-auth.session-token";

export default async function middleware(req: NextRequest) {
  if (req.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/home", req.url));
  }

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    cookieName: sessionCookieName,
  });

  if (!token) {
    const signInUrl = new URL("/login", req.url);
    signInUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

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
    '/((?!api|_next/static|_next/image|favicon.ico|login|forgot-password|.*\\.).*)',
  ],
};
