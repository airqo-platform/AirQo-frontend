import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { users } from '@/core/apis/users';
import { jwtDecode } from 'jwt-decode';
import type {
  LoginCredentials,
  LoginResponse,
  DecodedToken,
} from '@/app/types/users';
import { getApiErrorMessage } from '@/core/utils/getApiErrorMessage';
import { resolveCookieDomain } from '@/core/utils/authCookieDomain';
import logger from '@/lib/logger';
import { isHCaptchaEnabled } from '@/lib/envConstants';
import { buildServerApiUrl } from '@/lib/api-routing';
import { normalizeOAuthAccessToken } from '@/core/auth/oauth-session';

const isProduction = process.env.NODE_ENV === 'production';

const isTokenExpired = (exp?: number): boolean => {
  if (!exp) return false;
  return Date.now() / 1000 > exp;
};

const getValidUrl = (value?: string) => {
  const url = value?.trim();

  if (!url) {
    return null;
  }

  try {
    return new URL(url).toString().replace(/\/$/, '');
  } catch {
    return null;
  }
};

const getAzureContainerAppsUrl = () => {
  const appName = process.env.CONTAINER_APP_NAME;
  const dnsSuffix = process.env.CONTAINER_APP_ENV_DNS_SUFFIX;

  if (!appName || !dnsSuffix || !appName.endsWith('-vertex-preview')) {
    return null;
  }

  return `https://${appName}.${dnsSuffix}`;
};

const azureContainerAppsUrl = getAzureContainerAppsUrl();
const nextAuthUrl = getValidUrl(process.env.NEXTAUTH_URL);
const nextAuthUrlInternal = getValidUrl(process.env.NEXTAUTH_URL_INTERNAL);

if (nextAuthUrl) {
  process.env.NEXTAUTH_URL = nextAuthUrl;
} else {
  delete process.env.NEXTAUTH_URL;
}

if (nextAuthUrlInternal) {
  process.env.NEXTAUTH_URL_INTERNAL = nextAuthUrlInternal;
} else {
  delete process.env.NEXTAUTH_URL_INTERNAL;
}

if (!process.env.NEXTAUTH_URL && azureContainerAppsUrl) {
  process.env.NEXTAUTH_URL = azureContainerAppsUrl;
  process.env.NEXTAUTH_URL_INTERNAL =
    process.env.NEXTAUTH_URL_INTERNAL || azureContainerAppsUrl;
  process.env.AUTH_TRUST_HOST = process.env.AUTH_TRUST_HOST || 'true';
}

const authSecret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET;
const configuredCookieDomain =
  process.env.NEXTAUTH_COOKIE_DOMAIN?.trim() || undefined;
/**
 * Resolved lazily, per request. NEXTAUTH_URL is frequently unset at module
 * load and only filled in by setRuntimeAuthUrls once the first request
 * arrives, so evaluating this once up front would either miss the localhost
 * guard entirely or pin a production domain onto local logins. Memoised on
 * the reference URL so the warnings are logged once per distinct value.
 */
let cachedCookieDomainFor: string | undefined;
let cachedCookieDomain: string | undefined;
const getCookieDomain = () => {
  const referenceUrl = process.env.NEXTAUTH_URL || process.env.NEXTAUTH_URL_INTERNAL;
  const cacheKey = referenceUrl ?? '';
  if (cachedCookieDomainFor === cacheKey) {
    return cachedCookieDomain;
  }
  cachedCookieDomainFor = cacheKey;
  cachedCookieDomain = resolveCookieDomain(configuredCookieDomain, referenceUrl, (warning) => {
    if (warning.kind === 'host-mismatch') {
      logger.warn(
        '[NextAuth] NEXTAUTH_COOKIE_DOMAIN does not match NEXTAUTH_URL host; disabling cookie domain override.',
        { configuredCookieDomain: warning.configuredCookieDomain, host: warning.host }
      );
    } else {
      logger.warn(
        '[NextAuth] Invalid NEXTAUTH_URL while validating cookie domain; disabling cookie domain override.',
        { configuredCookieDomain: warning.configuredCookieDomain, referenceUrl: warning.referenceUrl }
      );
    }
  });
  return cachedCookieDomain;
};
const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  path: '/',
  secure: isProduction,
  // Getter rather than a captured value: NextAuth reads cookie options while
  // handling a request, which is after setRuntimeAuthUrls has run.
  get domain() {
    return getCookieDomain();
  },
};

if (isProduction && !authSecret) {
  logger.error('[NextAuth] CRITICAL: NEXTAUTH_SECRET is missing in production environment!');
}

if (isProduction && !process.env.NEXTAUTH_URL && !process.env.AUTH_TRUST_HOST) {
  process.env.AUTH_TRUST_HOST = 'true';
  logger.warn('[NextAuth] WARNING: NEXTAUTH_URL is missing. Dynamic host detection will be used.');
}

interface OAuthProfilePayload {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  userName?: string;
  organization?: string;
  privilege?: string;
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
  try {
    const profileUrl = buildServerApiUrl('/users/profile/enhanced');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    const normalizedAccessToken = normalizeOAuthAccessToken(accessToken);

    const response = await fetch(profileUrl, {
      method: 'GET',
      cache: 'no-store',
      credentials: 'include',
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...(normalizedAccessToken ? { Authorization: `JWT ${normalizedAccessToken}` } : {}),
      },
    }).finally(() => clearTimeout(timeoutId));

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as OAuthProfileResponse;
    if (!payload?.success || !payload.data?._id) {
      return null;
    }

    return payload.data;
  } catch (error) {
    const errorName = (error as { name?: string })?.name;
    if (errorName === 'AbortError') {
      return null;
    }
    logger.error('Error fetching OAuth profile', { error });
    return null;
  }
};

export const options: NextAuthOptions = {
  secret: authSecret,
  useSecureCookies: isProduction,
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'credentials',
      credentials: {
        userName: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
        oauthToken: { label: 'OAuth Token', type: 'text' },
        oauthProvider: { label: 'OAuth Provider', type: 'text' },
        captchaToken: { label: 'Captcha Token', type: 'text' },
      },
      async authorize(credentials) {
        const oauthToken = normalizeOAuthAccessToken(
          typeof credentials?.oauthToken === 'string' ? credentials.oauthToken : ''
        );

        if (oauthToken) {
          const profile = await fetchOAuthProfile(oauthToken);

          if (!profile) {
            logger.warn('OAuth authorization failed: profile fetch returned null.');
            return null;
          }

          // Use JWT decode to get extra fields if the profile doesn't have them
          let decoded: DecodedToken | null = null;
          try {
            decoded = jwtDecode<DecodedToken>(oauthToken);
          } catch {
            decoded = null;
          }

          return {
            id: profile._id,
            email: profile.email,
            name: `${profile.firstName} ${profile.lastName}`.trim() || profile.email,
            image: profile.profilePicture || decoded?.profilePicture || '',
            userName: profile.userName || decoded?.userName || profile.email,
            accessToken: oauthToken,
            organization: profile.organization || decoded?.organization || '',
            privilege: profile.privilege || decoded?.privilege || '',
            firstName: profile.firstName,
            lastName: profile.lastName,
            country: decoded?.country || '',
            timezone: decoded?.timezone || '',
            phoneNumber: decoded?.phoneNumber || '',
            exp: decoded?.exp,
          };
        }

        if (!credentials?.userName || !credentials?.password) {
          logger.warn('Authorize call with missing credentials.');
          throw new Error('Username and password are required.');
        }

        const hcaptchaEnabled = isHCaptchaEnabled();
        const captchaToken =
          typeof credentials.captchaToken === 'string'
            ? credentials.captchaToken.trim()
            : '';

        if (hcaptchaEnabled && !captchaToken) {
          logger.warn('Authorize call with missing CAPTCHA token.');
          throw new Error('CAPTCHA validation is required.');
        }

        try {
          const loginResponse = (await users.loginWithDetails({
            userName: credentials.userName,
            password: credentials.password,
            captchaToken: hcaptchaEnabled ? captchaToken : undefined,
          } as LoginCredentials)) as LoginResponse;

          if (loginResponse?.token) {
            const decoded = jwtDecode<DecodedToken>(loginResponse.token);

            return {
              id: decoded._id,
              email: decoded.email,
              name: `${decoded.firstName} ${decoded.lastName}`,
              image: decoded.profilePicture || '',
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

          logger.warn('Login API returned success status but no token.', {
            userName: credentials.userName,
          });
          throw new Error(
            'Authentication server returned an invalid response.'
          );
        } catch (error) {
          const errorMessage = getApiErrorMessage(error);
          logger.error('Authentication error during login', {
            userName: credentials.userName,
            error: errorMessage,
          });
          throw new Error(errorMessage);
        }
      },
    }),
  ],

  cookies: {
    sessionToken: {
      name: isProduction
        ? '__Secure-next-auth.session-token'
        : 'next-auth.session-token',
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
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token._id = (user._id as string | undefined) || user.id;
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
        token.exp = user.exp;
      }
      return token;
    },

    async session({ session, token }) {
      if (isTokenExpired(token.exp as number | undefined)) {
        return { ...session, user: null };
      }

      if (token) {
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
          exp: token.exp,
        };
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
