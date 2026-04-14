/* eslint-disable @typescript-eslint/no-explicit-any */
import CredentialsProvider from 'next-auth/providers/credentials';
import { isTokenExpired } from './utils';
import { authService } from '../services/authService';
import { buildServerApiUrl } from '@/shared/lib/api-routing';
import { normalizeOAuthAccessToken } from './oauth-session';

const isProduction = process.env.NODE_ENV === 'production';
const sessionCookieName = isProduction
  ? '__Secure-next-auth.session-token'
  : 'analytics.next-auth.session-token';

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

interface OAuthProfilePayload {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
}

interface OAuthProfileResponse {
  success: boolean;
  message?: string;
  data?: OAuthProfilePayload;
}

const fetchOAuthProfile = async (
  accessToken: string
): Promise<OAuthProfilePayload | null> => {
  let profileUrl = '';

  try {
    profileUrl = buildServerApiUrl('/users/profile/enhanced');
  } catch {
    profileUrl = '';
  }

  if (!profileUrl) {
    return null;
  }

  try {
    const response = await fetch(profileUrl, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as OAuthProfileResponse;
    if (!payload?.success || !payload.data?._id) {
      return null;
    }

    return payload.data;
  } catch {
    return null;
  }
};

// Helper function to check token expiration and log
const isTokenInvalid = (
  accessToken: string | undefined,
  expiresAt?: string | null
): boolean => {
  if (!accessToken) {
    return true;
  }

  if (isExpiredAt(expiresAt)) {
    return true;
  }

  if (isJwtLikeToken(accessToken) && isTokenExpired(accessToken)) {
    return true;
  }

  return false;
};

export const authOptions: any = {
  secret: process.env.NEXTAUTH_SECRET,
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

          return {
            id: profile._id,
            email: profile.email,
            name: fullName || profile.email,
            firstName: profile.firstName,
            lastName: profile.lastName,
            image: profile.profilePicture,
            _id: profile._id,
            accessToken: oauthToken,
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

          // Return user object for NextAuth
          return {
            id: loginData._id,
            email: loginData.email,
            name: `${loginData.firstName} ${loginData.lastName}`,
            firstName: loginData.firstName,
            lastName: loginData.lastName,
            image: loginData.profilePicture,
            _id: loginData._id,
            accessToken: normalizeOAuthAccessToken(loginData.token),
            expiresAt: loginData.expiresAt,
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
  cookies: {
    sessionToken: {
      name: sessionCookieName,
      options: {
        httpOnly: true,
        sameSite: 'lax' as const,
        path: '/',
        secure: isProduction,
      },
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token._id = user._id;
        token.accessToken =
          typeof user.accessToken === 'string' ? user.accessToken : undefined;
        token.expiresAt =
          typeof user.expiresAt === 'string' ? user.expiresAt : undefined;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
      }

      return token;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, token }: any) {
      // Check if token is expired and invalidate session
      const accessToken =
        typeof (token as any)?.accessToken === 'string'
          ? normalizeOAuthAccessToken((token as any).accessToken as string) ||
            undefined
          : undefined;
      const expiresAt =
        typeof (token as any)?.expiresAt === 'string'
          ? ((token as any).expiresAt as string)
          : undefined;
      if (isTokenInvalid(accessToken, expiresAt)) {
        return { user: null };
      }

      // Add access token and user ID to session
      (session as any).accessToken = accessToken;
      (session as any).expiresAt = expiresAt;
      if (session.user) {
        (session.user as any)._id = (token as any)._id;
        (session.user as any).firstName = (token as any).firstName;
        (session.user as any).lastName = (token as any).lastName;
        (session.user as any).accessToken = accessToken;
        (session.user as any).expiresAt = expiresAt;
      }
      return session;
    },
  },
};
