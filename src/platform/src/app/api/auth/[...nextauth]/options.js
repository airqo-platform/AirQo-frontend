import CredentialsProvider from 'next-auth/providers/credentials';
import jwtDecode from 'jwt-decode';
import logger from '@/lib/logger';
import { getNextAuthSecret, getApiBaseUrl } from '@/lib/envConstants';

// Configuration constants
const CONFIG = Object.freeze({
  API_BASE_URL: getApiBaseUrl()?.replace(/\/$/, '') || '',
  REQUEST_TIMEOUT: 15000,
  TOKEN_MAX_AGE: 24 * 60 * 60, // 24 hours
});

// HTTP error messages mapping
const HTTP_ERRORS = Object.freeze({
  400: 'Invalid request - check your credentials',
  401: 'Invalid email or password',
  403: 'Access denied',
  404: 'User not found',
  422: 'Invalid data provided',
  429: 'Too many attempts - please try again later',
  500: 'Server error - please try again',
  502: 'Service temporarily unavailable',
  503: 'Service temporarily unavailable',
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

// Enhanced error class for authentication
class AuthError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.name = 'AuthError';
    this.statusCode = statusCode;
  }
}

// Token service with validation and security checks
const TokenService = {
  /**
   * Cleans JWT token by removing prefixes
   */
  sanitize(token) {
    if (!token) throw new AuthError('Token is required', 400);
    return String(token)
      .replace(/^\s*(JWT|Bearer)\s+/i, '')
      .trim();
  },

  /**
   * Decodes JWT token and validates structure
   */
  decode(token) {
    try {
      const sanitizedToken = this.sanitize(token);
      const decoded = jwtDecode(sanitizedToken);

      // Validate token structure
      if (!decoded || typeof decoded !== 'object') {
        throw new Error('Invalid token payload');
      }

      // Check token expiration
      const now = Math.floor(Date.now() / 1000);
      if (decoded.exp && decoded.exp < now) {
        throw new Error('Token has expired');
      }

      return { decoded, token: sanitizedToken };
    } catch (error) {
      logger.error('[NextAuth] Token processing failed:', {
        error: error.message,
        tokenExists: !!token,
      });
      throw new AuthError('Invalid authentication token', 401);
    }
  },
};

// HTTP client for authentication requests
class AuthHttpClient {
  constructor() {
    this.baseURL = CONFIG.API_BASE_URL;
    this.timeout = CONFIG.REQUEST_TIMEOUT;
  }

  /**
   * Makes authenticated POST request with proper error handling
   */
  async post(endpoint, payload) {
    const url = `${this.baseURL}${endpoint}`;
    let controller;
    let timeoutId;

    try {
      // Setup abort controller for timeout
      controller = new AbortController();
      timeoutId = setTimeout(() => controller.abort(), this.timeout);

      logger.info('[NextAuth] Making authentication request:', {
        url,
        hasPayload: !!payload,
      });

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      return await this._processResponse(response);
    } catch (error) {
      return this._handleRequestError(error);
    } finally {
      // Cleanup resources
      if (timeoutId) clearTimeout(timeoutId);
    }
  }

  /**
   * Processes HTTP response with validation
   */
  async _processResponse(response) {
    // Validate content type to prevent parsing errors
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      logger.error('[NextAuth] Invalid response format:', {
        contentType,
        status: response.status,
        url: response.url,
      });
      throw new AuthError('Server returned invalid response format', 502);
    }

    // Parse response data
    const data = await response.json();

    // Handle HTTP errors with context
    if (!response.ok) {
      const message =
        data?.message ||
        data?.error ||
        HTTP_ERRORS[response.status] ||
        'Request failed';
      logger.warn('[NextAuth] HTTP error response:', {
        status: response.status,
        message,
      });
      throw new AuthError(message, response.status);
    }

    return data;
  }

  /**
   * Handles request-level errors
   */
  _handleRequestError(error) {
    if (error instanceof AuthError) {
      throw error;
    }

    // Handle specific error types
    const errorHandlers = {
      AbortError: () =>
        new AuthError('Request timeout - please try again', 408),
      TypeError: () =>
        error.message.includes('fetch')
          ? new AuthError('Network error - check your connection', 503)
          : new AuthError('Request failed', 500),
      SyntaxError: () => new AuthError('Server returned invalid response', 502),
    };

    const handler = errorHandlers[error.name];
    if (handler) {
      throw handler();
    }

    logger.error('[NextAuth] Unexpected request error:', {
      name: error.name,
      message: error.message,
    });

    throw new AuthError('Authentication service unavailable', 500);
  }
}

// User data factory with comprehensive validation
const UserFactory = {
  /**
   * Creates user object from API data and credentials
   */
  create(apiData, credentials) {
    // Validate API response
    if (!apiData?._id || !apiData?.email || !apiData?.token) {
      throw new AuthError(
        'Invalid API response - missing required fields',
        500,
      );
    }

    // Process and validate token
    const { decoded: tokenPayload, token: cleanToken } = TokenService.decode(
      apiData.token,
    );

    // Build user object with safe defaults
    return {
      // Core identifiers (required)
      id: apiData._id,
      email: apiData.email,
      userName: apiData.userName || apiData.email,

      // Profile data from token (with fallbacks)
      firstName: tokenPayload.firstName || '',
      lastName: tokenPayload.lastName || '',
      profilePicture: tokenPayload.profilePicture || null,
      phoneNumber: tokenPayload.phoneNumber || null,

      // Organization data
      organization: tokenPayload.organization || '',
      long_organization: tokenPayload.long_organization || '',
      privilege: tokenPayload.privilege || 'user',
      country: tokenPayload.country || '',

      // Authentication metadata
      token: cleanToken,
      rateLimit: tokenPayload.rateLimit || null,
      lastLogin: tokenPayload.lastLogin || new Date().toISOString(),
      createdAt: tokenPayload.createdAt || null,
      updatedAt: tokenPayload.updatedAt || null,
      iat: tokenPayload.iat || Math.floor(Date.now() / 1000),

      // Session context
      requestedOrgSlug: credentials.orgSlug || null,
      isOrgLogin: Boolean(credentials.orgSlug),
    };
  },
};

// Session management utilities
const SessionManager = {
  /**
   * Creates user session data
   */
  createUser(token) {
    return {
      id: token.id,
      email: token.email,
      userName: token.userName,
      firstName: token.firstName || token.email?.split('@')[0] || 'User',
      lastName: token.lastName || '',
      profilePicture: token.profilePicture,
      phoneNumber: token.phoneNumber,
      organization: token.organization,
      long_organization: token.long_organization,
      privilege: token.privilege,
      country: token.country,
      rateLimit: token.rateLimit,
      lastLogin: token.lastLogin,
      createdAt: token.createdAt,
      updatedAt: token.updatedAt,
    };
  },

  /**
   * Enriches session with additional properties
   */
  enrichSession(session, token) {
    return {
      ...session,
      accessToken: token.accessToken,
      requestedOrgSlug: token.requestedOrgSlug,
      orgSlug: token.requestedOrgSlug,
      isOrgLogin: token.isOrgLogin,
    };
  },
};

// Initialize services
const httpClient = new AuthHttpClient();

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
        // Validate input
        if (!credentials?.userName?.trim() || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        try {
          // Authenticate with backend API
          const apiData = await httpClient.post('/users/loginUser', {
            userName: credentials.userName.trim(),
            password: credentials.password,
          });

          // Create user object
          const user = UserFactory.create(apiData, credentials);

          logger.info('[NextAuth] Authentication successful:', {
            userId: user.id,
            email: user.email,
            organization: user.organization,
            hasOrgSlug: !!user.requestedOrgSlug,
          });

          return user;
        } catch (error) {
          logger.error('[NextAuth] Authorization failed:', {
            error: error.message,
            statusCode: error.statusCode || 500,
            userName: credentials.userName,
          });

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
      // Merge user data into token on sign in
      if (user) {
        const { token: rawToken, ...safeUser } = user;
        return {
          ...token,
          ...safeUser,
          accessToken: rawToken,
        };
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        // Create user session
        session.user = SessionManager.createUser(token);

        // Enrich session with additional data
        session = SessionManager.enrichSession(session, token);
      }

      return session;
    },
  },

  // Session configuration
  session: {
    strategy: 'jwt',
    maxAge: CONFIG.TOKEN_MAX_AGE,
    updateAge: 24 * 60 * 60, // Update session every 24 hours
  },

  // JWT configuration
  jwt: {
    maxAge: CONFIG.TOKEN_MAX_AGE,
  },

  // Enable debug in development
  debug: process.env.NODE_ENV === 'development',
};

// Export for compatibility
export const options = authOptions;
