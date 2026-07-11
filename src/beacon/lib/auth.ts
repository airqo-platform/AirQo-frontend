import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { jwtDecode } from 'jwt-decode';
import {
  normalizeOAuthAccessToken,
  fetchEnhancedUserProfile,
} from './oauth-session';
import config, { buildPlatformApiUrl } from './config';

// Fallback defaults and environment-specific self-correction for NEXTAUTH_URL
const normalizeNextAuthUrl = () => {
  const currentEnv = config.environment;
  const rawUrl = process.env.NEXTAUTH_URL;

  // Check if NEXTAUTH_URL is missing, localhost, or incorrectly set to production on staging
  const isLocalhostUrl = !rawUrl || rawUrl.includes('localhost') || rawUrl.includes('127.0.0.1');
  const isProdUrlOnStaging = rawUrl === 'https://beacon.airqo.net' && currentEnv === 'staging';

  if (currentEnv === 'staging') {
    if (isLocalhostUrl || isProdUrlOnStaging) {
      process.env.NEXTAUTH_URL = 'https://staging-beacon.airqo.net';
    }
  } else if (currentEnv === 'production') {
    if (isLocalhostUrl || rawUrl === 'https://staging-beacon.airqo.net') {
      process.env.NEXTAUTH_URL = 'https://beacon.airqo.net';
    }
  } else {
    // Development / Localhost
    if (!rawUrl) {
      process.env.NEXTAUTH_URL = 'http://localhost:3000';
    }
  }
};

normalizeNextAuthUrl();


const isProduction = process.env.NODE_ENV === 'production';

const isTokenExpired = (exp?: number): boolean => {
  if (!exp) return false;
  return Date.now() / 1000 > exp;
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
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
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
      },
      async authorize(credentials) {
        const oauthToken = normalizeOAuthAccessToken(
          typeof credentials?.oauthToken === 'string' ? credentials.oauthToken : ''
        );

        if (oauthToken) {
          const profile = await fetchEnhancedUserProfile({ accessToken: oauthToken });

          if (!profile) {
            return null;
          }

          let decoded: any = null;
          try {
            decoded = jwtDecode(oauthToken);
          } catch {
            decoded = null;
          }

          let organization = profile.organization || decoded?.organization || '';
          let privilege = profile.privilege || decoded?.privilege || '';

          // Fetch user profile from AirQo Platform API to get groups and determine organization/privilege if missing
          try {
            const userId = profile._id || decoded?._id || decoded?.id;
            const profileResponse = await fetch(buildPlatformApiUrl(`users/${userId}`), {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `JWT ${oauthToken}`,
              },
            });

            if (profileResponse.ok) {
              const profileData = await profileResponse.json();
              const user = profileData?.users?.[0];
              const groups = user?.groups ?? [];
              
              const airqoGroup = groups.find((g: any) => g.grp_title?.toLowerCase() === 'airqo');
              if (airqoGroup) {
                organization = 'AirQo';
                privilege = airqoGroup.role?.role_name || '';
              } else if (groups.length > 0) {
                organization = groups[0].grp_title || '';
                privilege = groups[0].role?.role_name || '';
              }
            }
          } catch (profileError) {
            console.error('Error fetching user groups during OAuth authorize:', profileError);
          }

          return {
            id: profile._id,
            email: profile.email,
            name: `${profile.firstName} ${profile.lastName}`.trim() || profile.email,
            image: profile.profilePicture || decoded?.profilePicture || '',
            userName: profile.userName || decoded?.userName || profile.email,
            accessToken: oauthToken,
            organization,
            privilege,
            firstName: profile.firstName,
            lastName: profile.lastName,
            country: decoded?.country || '',
            timezone: decoded?.timezone || '',
            phoneNumber: decoded?.phoneNumber || '',
            airqoExp: decoded?.exp,
            authMethods: profile.authMethods,
          };
        }

        if (!credentials?.userName || !credentials?.password) {
          throw new Error('Username and password are required.');
        }

        try {
          const response = await fetch(buildPlatformApiUrl('users/loginUser'), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userName: credentials.userName,
              password: credentials.password,
            }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || 'Authentication failed');
          }

          if (data.token) {
            const decoded: any = jwtDecode(data.token);
            const token = normalizeOAuthAccessToken(data.token);

            let organization = decoded.organization || '';
            let privilege = decoded.privilege || '';

            // Fetch user profile from AirQo Platform API to get groups and determine organization/privilege
            try {
              const userId = decoded._id || decoded.id;
              const profileResponse = await fetch(buildPlatformApiUrl(`users/${userId}`), {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `JWT ${token}`,
                },
              });

              if (profileResponse.ok) {
                const profileData = await profileResponse.json();
                const user = profileData?.users?.[0];
                const groups = user?.groups ?? [];
                
                const airqoGroup = groups.find((g: any) => g.grp_title?.toLowerCase() === 'airqo');
                if (airqoGroup) {
                  organization = 'AirQo';
                  privilege = airqoGroup.role?.role_name || '';
                } else if (groups.length > 0) {
                  organization = groups[0].grp_title || '';
                  privilege = groups[0].role?.role_name || '';
                }
              }
            } catch (profileError) {
              console.error('Error fetching user groups during credentials authorize:', profileError);
            }

            return {
              id: decoded._id,
              email: decoded.email,
              name: `${decoded.firstName} ${decoded.lastName}`.trim() || decoded.email,
              image: decoded.profilePicture || '',
              userName: decoded.userName,
              accessToken: token,
              organization,
              privilege,
              firstName: decoded.firstName,
              lastName: decoded.lastName,
              country: decoded.country || '',
              timezone: decoded.timezone || '',
              phoneNumber: decoded.phoneNumber || '',
              airqoExp: decoded.exp,
            };
          }

          throw new Error('Authentication server returned an invalid response.');
        } catch (error: any) {
          throw new Error(error.message || 'Authentication error during login');
        }
      },
    }),
  ],

  // cookies: {
  //   sessionToken: {
  //     name: isProduction
  //       ? '__Secure-next-auth.session-token'
  //       : 'next-auth.session-token',
  //     options: cookieOptions,
  //   },
  // },

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
        token.airqoExp = (user as any).airqoExp;
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
      if (isTokenExpired(token.airqoExp as number | undefined)) {
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
          airqoExp: token.airqoExp,
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
