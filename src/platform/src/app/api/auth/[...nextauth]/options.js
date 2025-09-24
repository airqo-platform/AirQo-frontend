import CredentialsProvider from 'next-auth/providers/credentials';
import logger from '@/lib/logger';
import { getNextAuthSecret, getApiBaseUrl } from '@/lib/envConstants';

// Configuration constants
const CONFIG = Object.freeze({
  API_BASE_URL: getApiBaseUrl()?.replace(/\/$/, '') || '',
  REQUEST_TIMEOUT: 15000,
  TOKEN_MAX_AGE: 24 * 60 * 60, // 24 hours in seconds
});

// Status code to user-friendly message mapping
const AUTH_ERROR_MESSAGES = {
  400: 'Invalid request. Please check your credentials.',
  401: 'Invalid email or password. Please try again.',
  403: 'Access denied. Your account may be suspended.',
  404: 'Account not found. Please check your email address.',
  408: 'Request timed out. Please try again.',
  409: 'Account conflict. Please contact support.',
  422: 'Invalid email or password format.',
  429: 'Too many login attempts. Please wait and try again.',
  500: 'Server error. Please try again later.',
  502: 'Service temporarily unavailable. Please try again.',
  503: 'Service temporarily unavailable. Please try again.',
  504: 'Request timed out. Please try again.',
  default: 'Login failed. Please try again.',
};

// Get user-friendly error message based on status code
const getAuthErrorMessage = (statusCode, apiMessage = null) => {
  // Use API message if it's user-friendly, otherwise use predefined message
  if (
    apiMessage &&
    typeof apiMessage === 'string' &&
    apiMessage.length > 0 &&
    apiMessage.length < 100
  ) {
    return apiMessage;
  }
  return AUTH_ERROR_MESSAGES[statusCode] || AUTH_ERROR_MESSAGES.default;
};

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
      const errorMessage = getAuthErrorMessage(response.status, data?.message);
      logger.warn('[NextAuth] Authentication failed:', {
        status: response.status,
        message: errorMessage,
        originalMessage: data?.message,
      });

      // Create a structured error that includes both status code and message
      const error = new Error(errorMessage);
      error.status = response.status;
      error.statusCode = response.status;
      throw error;
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
      const timeoutError = new Error(getAuthErrorMessage(408));
      timeoutError.status = 408;
      timeoutError.statusCode = 408;
      throw timeoutError;
    } else if (error.status || error.statusCode) {
      // Re-throw structured errors from API response
      throw error;
    } else {
      logger.error('[NextAuth] Authentication error:', error.message);
      const networkError = new Error(
        getAuthErrorMessage(
          503,
          'Connection failed. Please check your internet and try again.',
        ),
      );
      networkError.status = 503;
      networkError.statusCode = 503;
      throw networkError;
    }
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
          const error = new Error(
            getAuthErrorMessage(422, 'Email and password are required'),
          );
          error.status = 422;
          error.statusCode = 422;
          throw error;
        }

        try {
          const apiData = await authenticateUser(
            credentials.userName.trim(),
            credentials.password,
          );

          if (!apiData) {
            const error = new Error(getAuthErrorMessage(401));
            error.status = 401;
            error.statusCode = 401;
            throw error;
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
          logger.error('[NextAuth] Authorization failed:', {
            message: error.message,
            status: error.status || error.statusCode,
          });

          // Create a structured error for NextAuth
          const authError = new Error(
            error.message || getAuthErrorMessage(500),
          );
          authError.status = error.status || error.statusCode || 500;
          authError.statusCode = error.status || error.statusCode || 500;
          throw authError;
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

      // DO NOT auto-redirect - let our root page handle it after full session setup
      // This prevents NextAuth from interfering with our controlled flow
      return `${baseUrl}/`;
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
