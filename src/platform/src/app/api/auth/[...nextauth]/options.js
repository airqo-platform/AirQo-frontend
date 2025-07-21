import CredentialsProvider from 'next-auth/providers/credentials';
import jwtDecode from 'jwt-decode';
import logger from '@/lib/logger';
import {
  getApiBaseUrl,
  getApiToken,
  getNextAuthSecret,
} from '@/lib/envConstants';

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

// Centralized error handling for API calls
const handleApiError = async (response) => {
  let errorMessage = 'Authentication failed';

  try {
    const errorBody = await response.text();
    logger.info('[NextAuth] Error response body:', errorBody);

    try {
      const errorData = JSON.parse(errorBody);
      errorMessage =
        errorData?.message || `HTTP ${response.status}: ${errorBody}`;
    } catch {
      errorMessage = `HTTP ${response.status}: ${errorBody}`;
    }
  } catch {
    errorMessage = `HTTP ${response.status}: Failed to read error response`;
  }

  logger.error('[NextAuth] API Error:', errorMessage);
  return errorMessage;
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

// Centralized token transfer logic
const transferTokenDataToSession = (target, token) => {
  const tokenFields = [
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
    'requestedOrgSlug',
    'isOrgLogin',
  ];

  tokenFields.forEach((field) => {
    if (token[field] !== undefined) {
      target[field] = token[field];
    }
  });

  // Handle special fields for session
  if (target !== token) {
    target.accessToken = token.accessToken;
    if (target.user) {
      target.orgSlug = token.requestedOrgSlug;
      target.isOrgLogin = token.isOrgLogin;
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
          const baseUrl = getApiBaseUrl();
          if (!baseUrl) {
            logger.error(
              '[NextAuth] Environment Error: API base URL not configured',
            );
            throw new Error(
              'Authentication service is temporarily unavailable. Please try again later.',
            );
          }

          let url;
          try {
            url = new URL(`${baseUrl}/users/loginUser`);
          } catch (urlError) {
            logger.error(
              '[NextAuth] URL Error:',
              `Invalid API_BASE_URL format: ${baseUrl}. Error: ${urlError.message}`,
            );
            throw new Error(
              'Authentication service configuration error. Please try again later.',
            );
          }

          const apiToken = getApiToken();
          if (apiToken) {
            url.searchParams.append('token', apiToken);
          }

          const headers = { 'Content-Type': 'application/json' };

          logger.info('[NextAuth] Making API request to:', url.toString());
          logger.info('[NextAuth] Request payload:', {
            userName: credentials.userName,
            password: '***HIDDEN***',
          });

          const response = await fetch(url.toString(), {
            method: 'POST',
            headers,
            body: JSON.stringify({
              userName: credentials.userName,
              password: credentials.password,
            }),
          });

          logger.info('[NextAuth] API Response status:', response.status);

          if (!response.ok) {
            const errorMessage = await handleApiError(response);
            throw new Error(errorMessage);
          }

          const data = await response.json();
          logger.info('[NextAuth] API Response data:', {
            hasToken: !!data.token,
            userId: data._id,
            userName: data.userName,
            email: data.email,
          });

          if (!data?.token) {
            logger.error('[NextAuth] No token received from API');
            throw new Error('No authentication token received from server');
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
          throw new Error(error.message || 'Authentication failed');
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
        transferTokenDataToSession(token, user);
        token.accessToken = user.token;
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        transferTokenDataToSession(session.user, token);
        transferTokenDataToSession(session, token);
      }
      return session;
    },
  },
};

export const authOptions = options;
