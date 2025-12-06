import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // If user is authenticated and hitting root /, redirect to /home
    // The 'authorized' callback below ensures we only get here if authenticated
    if (req.nextUrl.pathname === "/") {
      return NextResponse.redirect(new URL("/home", req.url));
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, // User needs a token to pass
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: ["/"],
};
