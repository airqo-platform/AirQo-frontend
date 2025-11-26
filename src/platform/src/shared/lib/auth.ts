/* eslint-disable @typescript-eslint/no-explicit-any */
import CredentialsProvider from 'next-auth/providers/credentials';
import { isTokenExpired } from './utils';
import { authService } from '../services/authService';

// Helper function to check token expiration and log
const isTokenInvalid = (accessToken: string | undefined): boolean => {
  if (!accessToken || isTokenExpired(accessToken)) {
    return true;
  }
  return false;
};

export const authOptions: any = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Use the auth service to login
          const loginData = await authService.login({
            userName: credentials.email,
            password: credentials.password,
          });

          // Return user object for NextAuth
          return {
            id: loginData._id,
            email: loginData.email,
            name: `${loginData.firstName} ${loginData.lastName}`,
            firstName: loginData.firstName,
            lastName: loginData.lastName,
            image: loginData.profilePicture,
            _id: loginData._id,
            accessToken: loginData.token.startsWith('JWT ')
              ? loginData.token.substring(4)
              : loginData.token,
          };
        } catch (error: any) {
          // Enhanced error handling to include status and full response data
          const errorData = {
            message: error?.message || 'Login failed',
            status: error?.status || 500,
            data: error?.data || null,
            success: false,
          };

          // Throw a structured error that includes all the details
          throw new Error(JSON.stringify(errorData));
        }
      },
    }),
  ],
  pages: {
    signIn: '/user/login',
    signOut: '/user/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token._id = user._id;
        token.accessToken = (user as any).accessToken;
        token.firstName = (user as any).firstName;
        token.lastName = (user as any).lastName;
      }

      return token;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, token }: any) {
      // Check if token is expired and invalidate session
      const accessToken =
        typeof (token as any)?.accessToken === 'string'
          ? ((token as any).accessToken as string)
          : undefined;
      if (isTokenInvalid(accessToken)) {
        return { user: null };
      }

      // Add access token and user ID to session
      (session as any).accessToken = (token as any).accessToken as string;
      if (session.user) {
        (session.user as any)._id = (token as any)._id;
        (session.user as any).firstName = (token as any).firstName;
        (session.user as any).lastName = (token as any).lastName;
      }
      return session;
    },
  },
};
