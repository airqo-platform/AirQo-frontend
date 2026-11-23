import { NextAuthOptions } from 'next-auth';
import { normalizeOAuthAccessToken } from './access-token';
import { AUTH_SECRET, SESSION_COOKIE_NAME } from './auth-secret';
import { authProviders, prepareAuthEnvironment } from './integration/auth';

/**
 * NextAuth options. The providers come from lib/integration/auth.ts: the platform sign-in, or the
 * demo sign-in (`auth.provider: "none"`) that the mock backend and the exported template use.
 */

prepareAuthEnvironment();

const isProduction = process.env.NODE_ENV === 'production';

const isTokenExpired = (exp?: number): boolean => {
  if (!exp) return false;
  // Add a 5-minute (300 seconds) grace period for clock drift
  return Date.now() / 1000 > (exp + 300);
};

const configuredCookieDomain =
  process.env.NEXTAUTH_COOKIE_DOMAIN?.trim() || undefined;

const getCookieDomain = () => {
  if (!configuredCookieDomain) {
    return undefined;
  }

  const referenceUrl = process.env.NEXTAUTH_URL;
  if (!referenceUrl) {
    return configuredCookieDomain;
  }

  try {
    const host = new URL(referenceUrl).hostname.toLowerCase();
    const normalizedDomain = configuredCookieDomain.replace(/^\./, '').toLowerCase();
    const hostMatches =
      host === normalizedDomain || host.endsWith(`.${normalizedDomain}`);

    if (hostMatches) {
      return configuredCookieDomain;
    }

    return undefined;
  } catch {
    return undefined;
  }
};

const cookieDomain = getCookieDomain();
const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  path: '/',
  secure: isProduction,
  domain: cookieDomain,
};

export const authOptions: NextAuthOptions = {
  secret: AUTH_SECRET,
  useSecureCookies: isProduction,
  providers: authProviders(),

  cookies: {
    sessionToken: {
      name: SESSION_COOKIE_NAME,
      options: cookieOptions,
    },
  },

  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },

  jwt: {
    maxAge: 24 * 60 * 60, // 24 hours
  },

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token._id = (user as any)._id || user.id;
        token.accessToken = user.accessToken;
        token.userName = user.userName;
        token.organization = user.organization;
        token.privilege = user.privilege;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.country = user.country;
        token.timezone = user.timezone;
        token.phoneNumber = user.phoneNumber;
        token.image = user.image ?? undefined;
        token.accessTokenExp = (user as any).accessTokenExp ?? (user as any).exp;
        token.exp = (user as any).exp ?? (user as any).accessTokenExp;
        token.authMethods = user.authMethods;
      }

      if (trigger === 'update' && session) {
        if (typeof session.accessToken === 'string') {
          token.accessToken = normalizeOAuthAccessToken(session.accessToken) || undefined;
        }
        if (typeof session.expiresAt === 'string') {
          token.expiresAt = session.expiresAt;
        }
        if (session.authMethods) {
          token.authMethods = session.authMethods;
        }
      }

      return token;
    },

    async session({ session, token }) {
      const tokenExp = (token.accessTokenExp ?? token.exp) as number | undefined;
      if (isTokenExpired(tokenExp)) {
        return { ...session, user: null as any };
      }

      if (token) {
        session.accessToken = token.accessToken as string;
        session.authMethods = token.authMethods as any;
        
        session.user = {
          ...session.user,
          id: token.id as string,
          _id: (token._id as string) || (token.id as string),
          accessToken: token.accessToken as string,
          userName: token.userName as string,
          organization: token.organization as string,
          privilege: token.privilege as string,
          firstName: token.firstName as string,
          lastName: token.lastName as string,
          country: token.country as string,
          timezone: token.timezone as string,
          phoneNumber: token.phoneNumber as string,
          image: (token.image as string) || '',
          accessTokenExp: token.accessTokenExp ?? token.exp,
          exp: token.exp ?? token.accessTokenExp,
        } as any;
      }
      return session;
    },
  },

  pages: {
    signIn: '/login',
    error: '/auth-error',
  },

  debug: false,
};

