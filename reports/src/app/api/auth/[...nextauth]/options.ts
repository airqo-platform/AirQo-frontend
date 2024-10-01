import axios from 'axios';
import { NextAuthOptions, User as NextAuthUser } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

// Define types for credentials, user, and token
interface Credentials {
  email?: string;
  password?: string;
}

interface CustomUser extends NextAuthUser {
  _id: string;
  userName: string;
  token: string;
}

export const options: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {},
      async authorize(credentials: Credentials | undefined) {
        if (!credentials || !credentials.email || !credentials.password) {
          throw new Error('Please provide both email and password.');
        }

        const { email: userName, password } = credentials;

        try {
          const url = `${process.env.NEXT_PUBLIC_API_URL}/users/loginUser`;
          const { data: response } = await axios.post(url, {
            userName,
            password,
          });

          if (response) {
            return {
              _id: response._id,
              userName: response.userName,
              email: response.email,
              token: response.token,
            } as CustomUser;
          }

          return null;
        } catch (error: any) {
          throw new Error(
            error?.response?.data?.message || 'An error occurred during login. Please try again.',
          );
        }
      },
    }),
  ],
  pages: {
    signIn: '/reports/login',
    signOut: '/reports/login',
    error: '/reports/error',
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        const customUser = user as CustomUser;
        token.id = customUser._id;
        token.userName = customUser.userName;
        token.email = customUser.email;
        token.accessToken = customUser.token;
      }
      return token;
    },
    session: async ({ session, token }) => {
      return {
        ...session,
        user: {
          id: token.id as string,
          userName: token.userName as string,
          email: token.email as string,
        },
        accessToken: token.accessToken as string,
      };
    },
  },
};
