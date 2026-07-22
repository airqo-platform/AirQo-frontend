import CredentialsProvider from 'next-auth/providers/credentials';
import type { AuthOptions } from 'next-auth';
import { authService } from '../services/authService';
import {
  fetchEnhancedUserProfile,
  normalizeOAuthAccessToken,
  type BackendOAuthProfile,
} from './oauth-session';
import type { AuthMethods } from '@/shared/types/api';

const isProduction = process.env.NODE_ENV === 'production';
const configuredCookieDomain =
  process.env.NEXTAUTH_COOKIE_DOMAIN?.trim() || undefined;

if (isProduction && !process.env.NEXTAUTH_URL && !process.env.AUTH_TRUST_HOST) {
  process.env.AUTH_TRUST_HOST = 'true';
  console.warn(
    '[NextAuth] WARNING: NEXTAUTH_URL is missing. Dynamic host detection will be used.'
  );
}

const getCookieDomain = () => {
  if (!configuredCookieDomain) {
    return undefined;
  }

  const referenceUrl =
    process.env.NEXTAUTH_URL || process.env.NEXTAUTH_URL_INTERNAL;
  if (!referenceUrl) {
    return configuredCookieDomain;
  }

  try {
    const host = new URL(referenceUrl).hostname.toLowerCase();
    const normalizedDomain = configuredCookieDomain
      .replace(/^\./, '')
      .toLowerCase();
    const hostMatches =
      host === normalizedDomain || host.endsWith(`.${normalizedDomain}`);

    if (hostMatches) {
      return configuredCookieDomain;
    }

    console.warn(
      '[NextAuth] NEXTAUTH_COOKIE_DOMAIN does not match NEXTAUTH_URL host; disabling cookie domain override.',
      { configuredCookieDomain, host }
    );
    return undefined;
  } catch {
    console.warn(
      '[NextAuth] Invalid NEXTAUTH_URL while validating cookie domain; using configured cookie domain.',
      { configuredCookieDomain, referenceUrl }
    );
    return configuredCookieDomain;
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

const sessionCookieName = isProduction
  ? '__Secure-next-auth.session-token'
  : 'next-auth.session-token';

const isJwtLikeToken = (token: string): boolean =>
  token.split('.').length === 3;

const isExpiredAt = (value: unknown): boolean => {
  if (typeof value !== 'string' || !value.trim()) {
    return false;
  }

  const expiresAt = new Date(value).getTime();
  if (Number.isNaN(expiresAt)) {
    return false;
  }

  return expiresAt <= Date.now();
};

const fetchOAuthProfile = async (
  accessToken: string
): Promise<BackendOAuthProfile | null> => {
  return fetchEnhancedUserProfile({ accessToken });
};

// Helper function to check token expiration and log
const isTokenInvalid = (
  accessToken: string | undefined,
  expiresAt?: string | null
): boolean => {
  if (!accessToken) {
    return true;
  }

  if (isJwtLikeToken(accessToken)) {
    return false;
  }

  return isExpiredAt(expiresAt);
};

const AUTH_METHOD_KEYS = [
  'password',
  'google',
  'github',
  'linkedin',
  'microsoft',
  'twitter',
  'facebook',
  'apple',
] as const;

const normalizeAuthMethods = (value: unknown): AuthMethods | undefined => {
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  const candidate = value as Partial<
    Record<(typeof AUTH_METHOD_KEYS)[number], unknown>
  >;
  const hasKnownKey = AUTH_METHOD_KEYS.some(key => key in candidate);

  if (!hasKnownKey) {
    return undefined;
  }

  return {
    password: Boolean(candidate.password),
    google: Boolean(candidate.google),
    github: Boolean(candidate.github),
    linkedin: Boolean(candidate.linkedin),
    microsoft: Boolean(candidate.microsoft),
    twitter: Boolean(candidate.twitter),
    facebook: Boolean(candidate.facebook),
    apple: Boolean(candidate.apple),
  };
};

export const authOptions: AuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
  useSecureCookies: isProduction,
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        oauthToken: { label: 'OAuth token', type: 'text' },
        oauthProvider: { label: 'OAuth provider', type: 'text' },
      },
      async authorize(credentials) {
        const oauthToken = normalizeOAuthAccessToken(
          typeof credentials?.oauthToken === 'string'
            ? credentials.oauthToken
            : ''
        );

        if (oauthToken) {
          const profile = await fetchOAuthProfile(oauthToken);

          if (!profile) {
            return null;
          }

          const fullName = [profile.firstName, profile.lastName]
            .filter(Boolean)
            .join(' ')
            .trim();

          let decoded: Record<string, unknown> | null = null;
          try {
            const parts = oauthToken.split('.');
            if (parts.length === 3) {
              const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
              const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
              decoded = JSON.parse(
                Buffer.from(padded, 'base64').toString('utf-8')
              );
            }
          } catch {
            decoded = null;
          }

          return {
            id: profile._id,
            email: profile.email,
            name: fullName || profile.email,
            image: profile.profilePicture,
            _id: profile._id,
            accessToken: oauthToken,
            authMethods: normalizeAuthMethods(profile.authMethods),
            firstName: profile.firstName,
            lastName: profile.lastName,
            userName: (decoded?.userName as string) || profile.email,
            organization: (decoded?.organization as string) || '',
            privilege: (decoded?.privilege as string) || '',
            country: (decoded?.country as string) || '',
            phoneNumber: (decoded?.phoneNumber as string) || '',
            expiresAt: (decoded?.expiresAt as string) || '',
            exp: (decoded?.exp as number) || 0,
          };
        }

        const email =
          typeof credentials?.email === 'string'
            ? credentials.email.trim()
            : '';
        const password =
          typeof credentials?.password === 'string' ? credentials.password : '';

        if (!email || !password) {
          return null;
        }

        try {
          // Use the auth service to login
          const loginData = await authService.login({
            userName: email,
            password,
          });

          // Return user object for NextAuth with all fields for cross-app SSO
          return {
            id: loginData._id,
            _id: loginData._id,
            email: loginData.email,
            name: `${loginData.firstName} ${loginData.lastName}`,
            image: loginData.profilePicture,
            accessToken: normalizeOAuthAccessToken(loginData.token),
            expiresAt: loginData.expiresAt,
            authMethods: normalizeAuthMethods(loginData.authMethods),
            firstName: loginData.firstName,
            lastName: loginData.lastName,
            userName: loginData.userName,
            organization: loginData.organization,
            privilege: loginData.privilege,
            country: loginData.country,
            phoneNumber: loginData.phoneNumber || '',
            exp: 0,
          };
        } catch (error: unknown) {
          // Enhanced error handling to include status and full response data
          const err = error as Record<string, unknown>;
          const errorData = {
            message: error instanceof Error ? error.message : 'Login failed',
            status: typeof err?.status === 'number' ? err.status : 500,
            data: err?.data ?? null,
            success: false,
          };

          // Log the full error server-side for debugging
          console.error('[NextAuth] Login failed:', JSON.stringify(errorData));

          // Throw a generic error — do not leak backend details to the client
          throw new Error('CredentialsSignin');
        }
      },
    }),
  ],
  cookies: {
    sessionToken: {
      name: sessionCookieName,
      options: cookieOptions,
    },
  },
  pages: {
    signIn: '/user/login',
    signOut: '/user/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token._id = user._id;
        token.accessToken =
          typeof user.accessToken === 'string' ? user.accessToken : undefined;
        token.expiresAt =
          typeof user.expiresAt === 'string' ? user.expiresAt : undefined;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.authMethods = normalizeAuthMethods(user.authMethods);
        token.userName = user.userName || user.email || undefined;
        token.organization = user.organization || '';
        token.privilege = user.privilege || '';
        token.country = user.country || '';
        token.phoneNumber = user.phoneNumber || '';
        token.image = user.image || undefined;
        token.exp = user.exp || 0;
      }

      if (trigger === 'update' && session) {
        if (typeof session.accessToken === 'string') {
          const normalizedAccessToken = normalizeOAuthAccessToken(
            session.accessToken
          );
          token.accessToken = normalizedAccessToken || undefined;
        }
        if (typeof session.expiresAt === 'string') {
          token.expiresAt = session.expiresAt;
        }
        if (session.authMethods) {
          token.authMethods =
            normalizeAuthMethods(session.authMethods) || token.authMethods;
        }
      }

      return token;
    },
    async session({ session, token }) {
      // Only invalidate if token is missing or malformed; expired JWTs can be refreshed
      const accessToken =
        typeof token?.accessToken === 'string'
          ? normalizeOAuthAccessToken(token.accessToken) || undefined
          : undefined;
      const expiresAt =
        typeof token?.expiresAt === 'string' ? token.expiresAt : undefined;
      const authMethods = normalizeAuthMethods(token?.authMethods);
      if (isTokenInvalid(accessToken, expiresAt)) {
        return { user: null, expires: new Date().toISOString() };
      }

      // Add access token and user ID to session
      session.accessToken = accessToken;
      session.expiresAt = expiresAt;
      session.authMethods = authMethods;
      if (session.user) {
        session.user._id = token._id || token.id;
        session.user.firstName = token.firstName;
        session.user.lastName = token.lastName;
        session.user.userName =
          token.userName || session.user.email || undefined;
        session.user.organization = token.organization || '';
        session.user.privilege = token.privilege || '';
        session.user.country = token.country || '';
        session.user.phoneNumber = token.phoneNumber || '';
        if (token.image) {
          session.user.image = token.image;
        }
      }
      return session;
    },
  },
};
