import CredentialsProvider from 'next-auth/providers/credentials';
import jwtDecode from 'jwt-decode';
import logger from '@/lib/logger';
import { getNextAuthSecret, getApiBaseUrl } from '@/lib/envConstants';
import axios from 'axios';

// Use the central helper to get a normalized API base URL (handles fallbacks)
const API_BASE_URL = getApiBaseUrl();

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

// Map API error/status to a friendly user-facing message with status codes
const getFriendlyAuthErrorMessage = (error) => {
  // Axios-style errors
  const status = error?.response?.status;

  // Detect JSON parse / unexpected HTML errors
  const message = (error && error.message) || '';

  // If axios returned a response and that response body looks like HTML,
  // treat it as an upstream service error (502)
  const respData = error?.response?.data;
  const respContentType = error?.response?.headers?.['content-type'] || '';
  const responseLooksLikeHtml =
    (typeof respData === 'string' && respData.trim().startsWith('<')) ||
    (typeof respData === 'string' && respData.includes('<html')) ||
    respContentType.includes('text/html');

  if (
    message.includes('JSON') ||
    message.includes('Unexpected token') ||
    message.includes('Unexpected end of JSON input') ||
    message.includes('SyntaxError') ||
    responseLooksLikeHtml
  ) {
    return {
      message:
        'Authentication service returned an unexpected response. Please try again later.',
      statusCode: 502,
    };
  }

  if (error?.request && !error?.response) {
    // No response received
    return {
      message:
        'Network error: please check your internet connection and try again.',
      statusCode: 503,
    };
  }

  switch (status) {
    case 400:
      return {
        message:
          'Invalid request. Please check the information you provided and try again.',
        statusCode: 400,
      };
    case 401:
      return {
        message: 'Incorrect email or password. Please try again.',
        statusCode: 401,
      };
    case 403:
      return {
        message: 'You do not have permission to access this resource.',
        statusCode: 403,
      };
    case 404:
      return {
        message: 'User not found. Please check your credentials.',
        statusCode: 404,
      };
    case 422:
      return {
        message: 'Provided data is invalid. Please check and try again.',
        statusCode: 422,
      };
    case 502:
      return {
        message:
          'Authentication service is temporarily unavailable. Please try again in a few minutes.',
        statusCode: 502,
      };
    case 503:
      return {
        message:
          'Authentication service is temporarily unavailable. Please try again later.',
        statusCode: 503,
      };
    case 500:
    default:
      return {
        message:
          'Authentication failed. Please try again or contact support if the problem persists.',
        statusCode: 500,
      };
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

          // Direct axios call to the authentication endpoint
          const url = `${API_BASE_URL.replace(/\/$/, '')}/users/loginUser`;
          logger.info('[NextAuth] Calling auth endpoint:', url);

          const resp = await axios.post(url, loginData, {
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            timeout: 15000,
            responseType: 'json',
            // Do not follow redirects automatically in case the upstream returns HTML login pages
            maxRedirects: 0,
          });

          // Ensure we received a JSON response; if not, throw a controlled error so
          // the outer catch will translate it into a friendly message.
          const respContentType = (
            resp?.headers?.['content-type'] || ''
          ).toLowerCase();
          if (!respContentType.includes('application/json')) {
            logger.error(
              '[NextAuth] Unexpected content-type from auth endpoint:',
              respContentType,
            );
            const htmlError = new Error(
              'Unexpected non-JSON response from authentication service',
            );
            // Attach the response so getFriendlyAuthErrorMessage can inspect headers/body
            htmlError.response = resp;
            throw htmlError;
          }

          const data = resp?.data || {};

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
            // Some backends prefix the token with 'JWT ' or 'Bearer ' — strip that if present
            const rawToken = String(data.token || '');
            const tokenString = rawToken
              .replace(/^\s*(JWT|Bearer)\s+/i, '')
              .trim();
            decodedToken = jwtDecode(tokenString);
            // Normalize token for downstream usage
            data.token = tokenString;
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
          const errorInfo = getFriendlyAuthErrorMessage(error);
          throw new Error(errorInfo.message);
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
