import CredentialsProvider from 'next-auth/providers/credentials';
import { jwtDecode } from 'jwt-decode';
import logger from '@/lib/logger';
import {
  getApiBaseUrl,
  getApiToken,
  getNextAuthSecret,
} from '@/lib/envConstants';

export const options = {
  // Add the secret configuration with validation
  secret: getNextAuthSecret() || 'fallback-secret-for-development',
  providers: [
    // Unified credentials provider for both user and organization access
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
          // Use centralized API base URL getter
          const baseUrl = getApiBaseUrl();

          if (!baseUrl) {
            const error =
              'API base URL is not configured. Please check your environment variables.';
            logger.error('[NextAuth] Environment Error:', error);
            throw new Error(error);
          }

          let url;

          try {
            url = new URL(`${baseUrl}/users/loginUser`);
          } catch (urlError) {
            const error = `Invalid API_BASE_URL format: ${baseUrl}. Error: ${urlError.message}`;
            logger.error('[NextAuth] URL Error:', error);
            throw new Error(error);
          }

          // Add API token if available
          const apiToken = getApiToken();
          if (apiToken) {
            url.searchParams.append('token', apiToken);
          }

          // Prepare headers
          const headers = {
            'Content-Type': 'application/json',
          };

          // Call your existing API endpoint
          const response = await fetch(url.toString(), {
            method: 'POST',
            headers,
            body: JSON.stringify({
              userName: credentials.userName,
              password: credentials.password,
            }),
          });

          if (!response.ok) {
            const errorBody = await response.text();
            const error = `Authentication failed: HTTP ${response.status}: ${errorBody}`;
            logger.error('[NextAuth] API Error:', error);
            throw new Error(error);
          }

          const data = await response.json();

          if (data && data.token) {
            // Decode the JWT to get user information
            let decodedToken;
            try {
              decodedToken = jwtDecode(data.token);
            } catch (jwtError) {
              logger.error('[NextAuth] JWT decode error:', jwtError.message);
              throw new Error('Invalid token received from API');
            }

            // For organization access, validate if user belongs to the organization
            if (credentials.orgSlug) {
              const tokenOrg = decodedToken.organization;
              const requestedOrg = credentials.orgSlug;

              // Check if user belongs to the requested organization
              const isValidOrganization =
                tokenOrg &&
                requestedOrg &&
                (tokenOrg === requestedOrg ||
                  tokenOrg.toLowerCase() === requestedOrg.toLowerCase() ||
                  tokenOrg.replace(/[\s-_]/g, '').toLowerCase() ===
                    requestedOrg.replace(/[\s-_]/g, '').toLowerCase());

              if (!isValidOrganization) {
                if (process.env.NODE_ENV === 'development') {
                  // eslint-disable-next-line no-console
                  console.warn('Organization validation failed:', {
                    tokenOrg,
                    requestedOrg,
                  });
                }
                throw new Error(
                  'User does not belong to the requested organization',
                );
              }
            }

            // Return unified user object - no session type distinction
            return {
              id: data._id,
              userName: data.userName,
              email: data.email,
              token: data.token,
              // Add decoded token data
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
              // Store organization slug if provided for context
              requestedOrgSlug: credentials.orgSlug || null,
              // Add flag to indicate this is an organization login
              isOrgLogin: !!credentials.orgSlug,
            };
          }

          return null;
        } catch (error) {
          // Authentication failed - throw the actual error for better debugging
          throw new Error(error.message || 'Authentication failed');
        }
      },
    }),
  ],

  pages: {
    signIn: '/user/login', // Default to user login - dynamic routing handled in components
    signOut: '/user/login', // Default to user login - will be overridden by custom logout logic
    error: '/user/login', // Error code passed in query string as ?error=
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Store user data in JWT token
        token.accessToken = user.token;
        token.id = user.id;
        token.userName = user.userName;
        token.email = user.email;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.organization = user.organization;
        token.long_organization = user.long_organization;
        token.privilege = user.privilege;
        token.country = user.country;
        token.profilePicture = user.profilePicture;
        token.phoneNumber = user.phoneNumber;
        token.createdAt = user.createdAt;
        token.updatedAt = user.updatedAt;
        token.rateLimit = user.rateLimit;
        token.lastLogin = user.lastLogin;
        token.iat = user.iat;

        // Store the organization slug if provided during login
        token.requestedOrgSlug = user.requestedOrgSlug;
        token.isOrgLogin = user.isOrgLogin;
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        // Transfer token data to session
        session.user.id = token.id;
        session.user.userName = token.userName;
        session.user.email = token.email;
        session.user.firstName = token.firstName;
        session.user.lastName = token.lastName;
        session.user.organization = token.organization;
        session.user.long_organization = token.long_organization;
        session.user.privilege = token.privilege;
        session.user.country = token.country;
        session.user.profilePicture = token.profilePicture;
        session.user.phoneNumber = token.phoneNumber;
        session.user.createdAt = token.createdAt;
        session.user.updatedAt = token.updatedAt;
        session.user.rateLimit = token.rateLimit;
        session.user.lastLogin = token.lastLogin;
        session.user.accessToken = token.accessToken; // Add accessToken to root level for compatibility
        session.accessToken = token.accessToken;
        session.iat = token.iat;

        // Store organization information for context switching
        session.user.requestedOrgSlug = token.requestedOrgSlug;
        session.user.isOrgLogin = token.isOrgLogin;
        session.orgSlug = token.requestedOrgSlug; // Add orgSlug to session root for easier access
        session.isOrgLogin = token.isOrgLogin; // Add isOrgLogin to session root
      }
      return session;
    },
  },
};

// Export authOptions for middleware compatibility
export const authOptions = options;
