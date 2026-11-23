/**
 * Sign-in against the AirQo platform: email and password (users/loginUser) or a social sign-in token
 * handed back by the platform. Used when `auth.provider` is "platform" (lib/integration/auth.ts).
 * Not part of the exported template.
 */
import CredentialsProvider from 'next-auth/providers/credentials';
import { jwtDecode } from 'jwt-decode';
import {
  normalizeOAuthAccessToken,
  fetchEnhancedUserProfile,
} from './oauth-session';
import config, { buildPlatformApiUrl } from './config';

// Fallback defaults and environment-specific self-correction for NEXTAUTH_URL
export const normalizeNextAuthUrl = () => {
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


export function platformCredentialsProvider() {
  return CredentialsProvider({
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
          accessTokenExp: decoded?.exp,
          exp: decoded?.exp,
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
            accessTokenExp: decoded.exp,
            exp: decoded.exp,
          };
        }

        throw new Error('Authentication server returned an invalid response.');
      } catch (error: any) {
        throw new Error(error.message || 'Authentication error during login');
      }
    },
  });
}
