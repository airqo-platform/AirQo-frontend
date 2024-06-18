import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import jwt from "jsonwebtoken";

// Define an interface for the token
interface Token {
  exp: number;
  [key: string]: any;
}

export const config = {
  matcher: ["/", "/settings", "/report/:path*", "/report"],
};

export async function middleware(req: NextRequest) {
  // Use getToken to access the session on the server side
  const token = (await getToken({
    req,
    secret: process.env.NEXT_AUTH_SECRET,
  })) as Token;

  // Remove "JWT " from the start of the access token
  const accessToken = token?.accessToken.replace("JWT ", "");

  // Decode the access token
  const decodedToken = jwt.decode(accessToken);

  const { pathname } = req.nextUrl;

  // Allow access to the API authentication routes or if the user is authenticated
  if (pathname.includes("/api/auth") || token) {
    return NextResponse.next();
  }

  // Redirect them to login page if they are not authenticated
  if (!token && pathname !== "/login") {
    // Use an absolute URL for the redirect
    return NextResponse.redirect(`${req.nextUrl.origin}/login`);
  }

  // If none of the conditions are met, continue to the next middleware or route handler
  return NextResponse.next();
}
