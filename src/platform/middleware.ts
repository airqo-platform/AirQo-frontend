import { withAuth } from 'next-auth/middleware';

const isProduction = process.env.NODE_ENV === 'production';
const sessionCookieName = isProduction
  ? '__Secure-next-auth.session-token'
  : 'analytics.next-auth.session-token';

export default withAuth(
  function middleware() {
    // Custom middleware logic can be added here if needed
  },
  {
    callbacks: {
      authorized: () => true,
    },
    pages: {
      signIn: '/user/login',
    },
    cookies: {
      sessionToken: {
        name: sessionCookieName,
      },
    },
    secret: process.env.NEXTAUTH_SECRET,
  }
);

export const config = {
  matcher: ['/user/:path*', '/org/:path*', '/org-invite'],
};
