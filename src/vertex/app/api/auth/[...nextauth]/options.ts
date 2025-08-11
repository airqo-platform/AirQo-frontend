import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { users } from '@/core/apis/users';
import { jwtDecode } from 'jwt-decode';
import type { LoginCredentials, LoginResponse, DecodedToken } from '@/app/types/users';

export const options: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'credentials',
      credentials: {
        userName: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.userName || !credentials?.password) {
          return null;
        }

        try {
          // Use your existing login API
          const loginResponse = await users.loginUser({
            userName: credentials.userName,
            password: credentials.password
          } as LoginCredentials) as LoginResponse;

          if (loginResponse?.token) {
            // Decode the JWT token to get user info
            const decoded = jwtDecode<DecodedToken>(loginResponse.token);
            
            return {
              id: decoded._id,
              email: decoded.email,
              name: `${decoded.firstName} ${decoded.lastName}`,
              userName: decoded.userName,
              accessToken: loginResponse.token,
              organization: decoded.organization,
              privilege: decoded.privilege,
              // Include other fields you need
              firstName: decoded.firstName,
              lastName: decoded.lastName,
              country: decoded.country || '',
              timezone: decoded.timezone || '',
              phoneNumber: decoded.phoneNumber || '',
            };
          }
          
          return null;
        } catch (error) {
          console.error('Authentication error:', error);
          return null;
        }
      }
    })
  ],
  
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  
  jwt: {
    maxAge: 24 * 60 * 60, // 24 hours
  },
  
  callbacks: {
    async jwt({ token, user }) {
      // Persist user data in the JWT token
      if (user) {
        token.accessToken = user.accessToken;
        token.userName = user.userName;
        token.organization = user.organization;
        token.privilege = user.privilege;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.country = user.country;
        token.timezone = user.timezone;
        token.phoneNumber = user.phoneNumber;
      }
      return token;
    },
    
    async session({ session, token }) {
      // Send properties to the client
      if (token) {
        session.user.accessToken = token.accessToken as string;
        session.user.userName = token.userName as string;
        session.user.organization = token.organization as string;
        session.user.privilege = token.privilege as string;
        session.user.firstName = token.firstName as string;
        session.user.lastName = token.lastName as string;
        session.user.country = token.country as string;
        session.user.timezone = token.timezone as string;
        session.user.phoneNumber = token.phoneNumber as string;
      }
      return session;
    }
  },
  
  pages: {
    signIn: '/login',
    error: '/login',
  },
  
  events: {
    async signOut() {
      // Clean up any additional data on logout
    }
  },
  
  debug: process.env.NODE_ENV === 'development',
};
