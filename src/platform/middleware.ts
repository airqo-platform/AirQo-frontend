import { withAuth } from 'next-auth/middleware';

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
    secret: process.env.NEXTAUTH_SECRET,
  }
);

export const config = {
  matcher: ['/user/home', '/protected/:path*'],
};
