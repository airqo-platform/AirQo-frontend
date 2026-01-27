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
          pathname === '/user/creation/individual/register' ||
          pathname === '/user/creation/individual/verify-email' ||
          pathname.match(
            /^\/user\/creation\/individual\/interest\/[^\/]+\/[^\/]+$/
          ) ||
          pathname === '/user/forgotPwd' ||
          pathname.match(/^\/user\/forgotPwd\/reset/) ||
          pathname.match(/^\/user\/delete\/confirm\/[^\/]+$/) ||
          pathname.match(/^\/org\/[^\/]+\/login$/) ||
          pathname.match(/^\/org\/[^\/]+\/register$/) ||
          pathname === '/org-invite'
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
  matcher: ['/user/:path*', '/org/:path*', '/org-invite'],
};
