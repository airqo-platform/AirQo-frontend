import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { users } from '@/core/apis/users';
import { jwtDecode } from 'jwt-decode';
import type { LoginCredentials, LoginResponse, DecodedToken } from '@/app/types/users';
import { getApiErrorMessage } from '@/core/utils/getApiErrorMessage';
import logger from '@/lib/logger';

const isProduction = process.env.NODE_ENV === 'production';
const sharedCookieDomain = process.env.NEXTAUTH_COOKIE_DOMAIN?.trim();
const nextAuthUrl = process.env.NEXTAUTH_URL;
const sessionCookieName = isProduction
  ? '__Secure-next-auth.session-token'
  : 'next-auth.session-token';

const normalizeDomain = (domain: string): string => domain.replace(/^\./, '').toLowerCase();

const isHostCompatibleWithCookieDomain = (() => {
  if (!sharedCookieDomain || !nextAuthUrl) return false;
  try {
    const host = new URL(nextAuthUrl).hostname.toLowerCase();
    const normalized = normalizeDomain(sharedCookieDomain);
    return host === normalized || host.endsWith(`.${normalized}`);
  } catch {
    return false;
  }
})();

const shouldUseSharedCookieDomain =
  isProduction && !!sharedCookieDomain && isHostCompatibleWithCookieDomain;

export const options: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  useSecureCookies: isProduction,
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
          logger.warn('Authorize call with missing credentials.');
          throw new Error('Username and password are required.');
        }

        try {
          const loginResponse = await users.loginWithDetails({
            userName: credentials.userName,
            password: credentials.password
          } as LoginCredentials) as LoginResponse;

          if (loginResponse?.token) {
            const decoded = jwtDecode<DecodedToken>(loginResponse.token);
            
            return {
              id: decoded._id,
              email: decoded.email,
              name: `${decoded.firstName} ${decoded.lastName}`,
              userName: decoded.userName,
              accessToken: loginResponse.token,
              organization: decoded.organization,
              privilege: decoded.privilege,
              firstName: decoded.firstName,
              lastName: decoded.lastName,
              country: decoded.country || '',
              timezone: decoded.timezone || '',
              phoneNumber: decoded.phoneNumber || '',
              exp: decoded.exp,
            };
          }
          
          logger.warn('Login API returned success status but no token.', { userName: credentials.userName });
          throw new Error('Authentication server returned an invalid response.');
        } catch (error) {
          const errorMessage = getApiErrorMessage(error);
          logger.error('Authentication error during login', { 
            userName: credentials.userName,
            error: errorMessage,
          });
          throw new Error(errorMessage);
        }
      }
    })
  ],
  
  ...(shouldUseSharedCookieDomain
    ? {
        cookies: {
          sessionToken: {
            name: sessionCookieName,
            options: {
              httpOnly: true,
              sameSite: 'lax' as const,
              path: '/',
              secure: isProduction,
              domain: sharedCookieDomain,
            },
          },
        },
      }
    : {}),

  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  
  jwt: {
    maxAge: 24 * 60 * 60, // 24 hours
  },
  
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.accessToken = user.accessToken;
        token.userName = user.userName;
        token.organization = user.organization;
        token.privilege = user.privilege;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.country = user.country;
        token.timezone = user.timezone;
        token.phoneNumber = user.phoneNumber;
        token.exp = user.exp;
      }
      return token;
    },
    
    async session({ session, token }) {
      // Check if token is expired
      if (token.exp) {
        const expirationTime = (token.exp as number) * 1000;
        if (Date.now() >= expirationTime) {
          // Token expired, invalidate session
          return { ...session, user: null };
        }
      }

      if (token) {
        session.user = {
          ...session.user,
          id: token.id as string,
          accessToken: token.accessToken as string,
          userName: token.userName as string,
          organization: token.organization as string,
          privilege: token.privilege as string,
          firstName: token.firstName as string,
          lastName: token.lastName as string,
          country: token.country as string,
          timezone: token.timezone as string,
          phoneNumber: token.phoneNumber as string,
          exp: token.exp,
        };
      }
      return session;
    }
  },
  
  pages: {
    signIn: '/login',
    error: '/login',
  },
  
  debug: false,
};
