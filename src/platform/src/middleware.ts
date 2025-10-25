import { withAuth } from 'next-auth/middleware';

export default withAuth(
  // Removed custom middleware function to avoid duplication with AuthProvider
  function middleware() {},
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Define auth routes that don't require authentication
        const authRoutes = [
          '/user/login',
          '/user/creation/individual/register',
          '/user/creation/individual/verify-email',
          '/user/creation/individual/interest',
          '/user/forgotPwd',
          '/user/forgotPwd/reset',
        ];

        // Allow access to auth routes without authentication
        // Check if pathname starts with any auth route
        if (authRoutes.some(route => pathname.startsWith(route))) {
          return true;
        }

        // For all other pages, require authentication
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
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files with extensions
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)',
  ],
};
