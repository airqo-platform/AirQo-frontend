import CredentialsProvider from 'next-auth/providers/credentials';
import jwtDecode from 'jwt-decode';
import logger from '@/lib/logger';
import { getNextAuthSecret } from '@/lib/envConstants';
import { postUserLoginDetails } from '@/core/apis/Account';

// Centralized login redirect logic
export const getLoginRedirectPath = (pathname, orgSlug = null) => {
  if (pathname?.includes('/org/')) {
    const extractedSlug =
      orgSlug || pathname.match(/^\/org\/([^/]+)/)?.[1] || 'airqo';
    // Special case: if orgSlug is 'airqo', redirect to user login
    return extractedSlug === 'airqo'
      ? '/user/login'
      : `/org/${extractedSlug}/login`;
  }
  return '/user/login';
};

// Centralized user object creation
const createUserObject = (data, decodedToken, credentials) => ({
  id: data._id,
  userName: data.userName,
  email: data.email,
  token: data.token,
  firstName: decodedToken.firstName,
  lastName: decodedToken.lastName,
  organization: decodedToken.organization,
  long_organization: decodedToken.long_organization,
  privilege: decodedToken.privilege,
  country: decodedToken.country,
  profilePicture: decodedToken.profilePicture,
  phoneNumber: decodedToken.phoneNumber,
  createdAt: decodedToken.createdAt,
  updatedAt: decodedToken.updatedAt,
  rateLimit: decodedToken.rateLimit,
  lastLogin: decodedToken.lastLogin,
  iat: decodedToken.iat,
  requestedOrgSlug: credentials.orgSlug || null,
  isOrgLogin: !!credentials.orgSlug,
});

// Map API error/status to a friendly user-facing message
const getFriendlyAuthErrorMessage = (error) => {
  // Axios-style errors
  const status = error?.response?.status;

  // Detect JSON parse / unexpected HTML errors
  const message = (error && error.message) || '';
  if (
    message.includes('JSON') ||
    message.includes('Unexpected token') ||
    message.includes('Unexpected end of JSON input') ||
    message.includes('<html') ||
    message.includes('SyntaxError')
  ) {
    return 'Authentication service returned an unexpected response. Please try again later.';
  }

  if (error?.request && !error?.response) {
    // No response received
    return 'Network error: please check your internet connection and try again.';
  }

  switch (status) {
    case 400:
      return 'Invalid request. Please check the information you provided and try again.';
    case 401:
      return 'Incorrect email or password. Please try again.';
    case 403:
      return 'You do not have permission to access this resource.';
    case 404:
      return 'User not found. Please check your credentials.';
    case 422:
      return 'Provided data is invalid. Please check and try again.';
    case 502:
      return 'Authentication service is temporarily unavailable. Please try again in a few minutes.';
    case 503:
      return 'Authentication service is temporarily unavailable. Please try again later.';
    case 500:
    default:
      return 'Authentication failed. Please try again or contact support if the problem persists.';
  }
};

// Centralized token transfer logic - optimized to prevent duplications
const transferTokenDataToSession = (target, source) => {
  // Core user fields that should only be in session.user
  const userFields = [
    'id',
    'userName',
    'email',
    'firstName',
    'lastName',
    'organization',
    'long_organization',
    'privilege',
    'country',
    'profilePicture',
    'phoneNumber',
    'createdAt',
    'updatedAt',
    'rateLimit',
    'lastLogin',
    'iat',
  ];

  // Session-level fields that should be at the root
  const sessionFields = ['requestedOrgSlug', 'isOrgLogin', 'accessToken'];

  // If target is a user object, only add user fields
  if (target && typeof target === 'object') {
    if (target.hasOwnProperty('name') || target.hasOwnProperty('email')) {
      // This is likely a user object
      userFields.forEach((field) => {
        if (source[field] !== undefined) {
          target[field] = source[field];
        }
      });
    } else {
      // This is likely a session object, add session fields
      sessionFields.forEach((field) => {
        if (source[field] !== undefined) {
          target[field] = source[field];
        }
      });

      // Also set orgSlug for compatibility
      if (source.requestedOrgSlug !== undefined) {
        target.orgSlug = source.requestedOrgSlug;
      }
    }
  }

  return target;
};

export const options = {
  secret: getNextAuthSecret() || 'fallback-secret-for-development',
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
        if (!credentials?.userName || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        try {
          logger.info('[NextAuth] Using optimized API client for login');

          const loginData = {
            userName: credentials.userName,
            password: credentials.password,
          };

          logger.info('[NextAuth] Request payload:', {
            userName: credentials.userName,
            password: '***HIDDEN***',
          });

          const data = await postUserLoginDetails(loginData);

          logger.info('[NextAuth] API Response data:', {
            hasToken: !!data.token,
            userId: data._id,
            userName: data.userName,
            email: data.email,
          });

          if (!data?.token) {
            logger.error('[NextAuth] No token received from API');
            // Provide a friendly message instead of raw API output
            throw new Error('Authentication failed. Please try again.');
          }

          let decodedToken;
          try {
            decodedToken = jwtDecode(data.token);
          } catch (jwtError) {
            logger.error('[NextAuth] JWT decode error:', jwtError.message);
            throw new Error('Invalid token received from API');
          }

          return createUserObject(data, decodedToken, credentials);
        } catch (error) {
          // Log full error server-side for diagnostics
          logger.error(
            '[NextAuth] Authentication error:',
            error?.message || error,
          );

          // Translate to a friendly, non-verbose message for the client
          const friendlyMessage = getFriendlyAuthErrorMessage(error);
          throw new Error(friendlyMessage);
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
      if (user) {
        // Store all user data in the token for persistence
        Object.assign(token, user);
        token.accessToken = user.token;

        // Ensure firstName is available for the home page
        if (user.firstName) {
          token.firstName = user.firstName;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        // Only populate user-specific fields in session.user
        transferTokenDataToSession(session.user, token);

        // Only populate session-level fields at session root
        transferTokenDataToSession(session, token);

        // Ensure firstName is always available in session.user for home page
        if (token.firstName) {
          session.user.firstName = token.firstName;
        }

        // Fallback to email if firstName is not available
        if (!session.user.firstName && session.user.email) {
          session.user.firstName = session.user.email.split('@')[0];
        }
      }
      return session;
    },
  },
};

export const authOptions = options;
