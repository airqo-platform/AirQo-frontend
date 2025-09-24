import CredentialsProvider from 'next-auth/providers/credentials';
import logger from '@/lib/logger';
import { getNextAuthSecret, getApiBaseUrl } from '@/lib/envConstants';

// Configuration constants
const CONFIG = Object.freeze({
  API_BASE_URL: getApiBaseUrl()?.replace(/\/$/, '') || '',
  REQUEST_TIMEOUT: 15000,
  TOKEN_MAX_AGE: 24 * 60 * 60, // 24 hours in seconds
});

// Login redirect utility
export const getLoginRedirectPath = (pathname, orgSlug = null) => {
  if (!pathname?.includes('/org/')) return '/user/login';

  const extractedSlug =
    orgSlug || pathname.match(/^\/org\/([^/]+)/)?.[1] || 'airqo';
  return extractedSlug === 'airqo'
    ? '/user/login'
    : `/org/${extractedSlug}/login`;
};

// Authenticate user with external API
async function authenticateUser(userName, password) {
  const url = `${CONFIG.API_BASE_URL}/users/loginUser`;

  try {
    logger.info('[NextAuth] Authenticating user:', { userName, url });

    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      CONFIG.REQUEST_TIMEOUT,
    );

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ userName: userName.trim(), password }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await response.json();

    if (!response.ok) {
      logger.warn('[NextAuth] Authentication failed:', {
        status: response.status,
        message: data?.message || 'Authentication failed',
      });
      return null;
    }

    if (!data?._id || !data?.email || !data?.token) {
      logger.error('[NextAuth] Invalid API response - missing required fields');
      return null;
    }

    logger.info('[NextAuth] Authentication successful:', {
      userId: data._id,
      email: data.email,
    });

    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      logger.error('[NextAuth] Authentication timeout');
    } else {
      logger.error('[NextAuth] Authentication error:', error.message);
    }
    return null;
  }
}

// NextAuth configuration
export const authOptions = {
  secret: getNextAuthSecret(),

  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        userName: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        orgSlug: { label: 'Organization', type: 'text', required: false },
      },

      async authorize(credentials) {
        if (!credentials?.userName?.trim() || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        try {
          const apiData = await authenticateUser(
            credentials.userName.trim(),
            credentials.password,
          );

          if (!apiData) {
            return null;
          }

          // Clean token (remove prefixes if any)
          const cleanToken = String(apiData.token)
            .replace(/^\s*(JWT|Bearer)\s+/i, '')
            .trim();

          // Return user object with required fields
          return {
            id: apiData._id,
            email: apiData.email,
            userName: apiData.userName || apiData.email,
            firstName: apiData.firstName || '',
            lastName: apiData.lastName || '',
            name:
              apiData.firstName && apiData.lastName
                ? `${apiData.firstName} ${apiData.lastName}`
                : apiData.firstName || apiData.email?.split('@')[0] || 'User',
            image: apiData.profilePicture || null,
            organization: apiData.organization || '',
            long_organization: apiData.long_organization || '',
            privilege: apiData.privilege || 'user',
            country: apiData.country || '',
            profilePicture: apiData.profilePicture || null,
            phoneNumber: apiData.phoneNumber || null,
            createdAt: apiData.createdAt || null,
            updatedAt: apiData.updatedAt || null,

            // Token data
            accessToken: cleanToken,
            accessTokenExpires: Date.now() + CONFIG.TOKEN_MAX_AGE * 1000,

            // Organization context
            requestedOrgSlug: credentials.orgSlug || null,
            isOrgLogin: Boolean(credentials.orgSlug),
          };
        } catch (error) {
          logger.error('[NextAuth] Authorization failed:', error.message);
          throw new Error(error.message);
        }
      },
    }),
  ],

  pages: {
    signIn: '/user/login',
    signOut: '/user/login',
    error: '/user/login',
  },

  callbacks: {
    async jwt({ token, user }) {
      // Initial sign-in: merge user data into token
      if (user) {
        return {
          ...token,
          id: user.id,
          email: user.email,
          userName: user.userName,
          firstName: user.firstName,
          lastName: user.lastName,
          name: user.name,
          image: user.image,
          organization: user.organization,
          long_organization: user.long_organization,
          privilege: user.privilege,
          country: user.country,
          profilePicture: user.profilePicture,
          phoneNumber: user.phoneNumber,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          accessToken: user.accessToken,
          accessTokenExpires: user.accessTokenExpires,
          requestedOrgSlug: user.requestedOrgSlug,
          isOrgLogin: user.isOrgLogin,
        };
      }

      // Token hasn't expired yet, return it as-is
      if (Date.now() < token.accessTokenExpires) {
        return token;
      }

      // Token expired - for now, just return the token
      // In production, you'd implement token refresh here
      logger.warn(
        '[NextAuth] Token expired, user will need to re-authenticate',
      );
      return token;
    },

    async session({ session, token }) {
      // Send properties to the client
      session.user = {
        id: token.id,
        email: token.email,
        userName: token.userName,
        firstName: token.firstName || token.email?.split('@')[0] || 'User',
        lastName: token.lastName || '',
        name: token.name,
        image: token.image,
        organization: token.organization,
        long_organization: token.long_organization,
        privilege: token.privilege,
        country: token.country,
        profilePicture: token.profilePicture,
        phoneNumber: token.phoneNumber,
        createdAt: token.createdAt,
        updatedAt: token.updatedAt,
      };

      // Add additional session properties
      session.accessToken = token.accessToken;
      session.requestedOrgSlug = token.requestedOrgSlug;
      session.orgSlug = token.requestedOrgSlug;
      session.isOrgLogin = token.isOrgLogin;

      return session;
    },

    async redirect({ url, baseUrl }) {
      // Allow relative callback URLs
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }

      // Allow callback URLs on the same origin
      if (new URL(url).origin === baseUrl) {
        return url;
      }

      // Default redirect to home
      return `${baseUrl}/user/Home`;
    },
  },

  session: {
    strategy: 'jwt',
    maxAge: CONFIG.TOKEN_MAX_AGE,
    updateAge: 24 * 60 * 60, // Update session every 24 hours
  },

  jwt: {
    maxAge: CONFIG.TOKEN_MAX_AGE,
  },

  // Disable debug in production
  debug: process.env.NODE_ENV === 'development',
};

// Export for compatibility
export const options = authOptions;
