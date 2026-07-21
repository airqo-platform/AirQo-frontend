import { withAuth } from 'next-auth/middleware';

const isProduction = process.env.NODE_ENV === 'production';
const sessionCookieName = isProduction
  ? '__Secure-next-auth.session-token'
  : 'next-auth.session-token';

export default withAuth(
  function middleware() {
    // Custom middleware logic can be added here if needed
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
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

// Protect all routes except public/auth, static assets, and API routes.
// Public routes match the list in src/shared/lib/public-routes.ts — keep
// both in sync when adding new public routes.
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|user/login|user/creation|user/forgotPwd|user/delete/confirm|org-invite|request-organization|.*\\.(?:svg|png|jpg|jpeg|webp|ico)$).*)',
  ],
};
