import { withAuth } from 'next-auth/middleware';

export default withAuth(
  function middleware() {
    // Custom middleware logic can be added here if needed
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;
        // Allow public auth routes
        if (
          pathname === '/user/login' ||
          pathname === '/user/register' ||
          pathname.match(/^\/org\/[^\/]+\/login$/) ||
          pathname.match(/^\/org\/[^\/]+\/register$/)
        ) {
          return true;
        }
        return !!token;
      },
    },
    pages: {
      signIn: '/user/login',
    },
    secret: process.env.NEXTAUTH_SECRET,
  }
);

export const config = {
  matcher: ['/user/:path*', '/org/:path*'],
};
