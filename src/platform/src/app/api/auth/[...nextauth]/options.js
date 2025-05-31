import CredentialsProvider from 'next-auth/providers/credentials';
import jwtDecode from 'jwt-decode';

export const options = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        userName: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.userName || !credentials?.password) {
          throw new Error('Email and password are required');
        }
        try {
          // Use server-side API_BASE_URL for NextAuth (server-side context)
          const API_BASE_URL =
            process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL;
          if (!API_BASE_URL) {
            throw new Error(
              'Neither API_BASE_URL nor NEXT_PUBLIC_API_BASE_URL environment variable is defined',
            );
          }

          // Remove trailing slash and properly construct URL
          const baseUrl = API_BASE_URL.replace(/\/$/, '');
          const url = new URL(`${baseUrl}/users/loginUser`);

          // Add API token if available (some endpoints might require it)
          const API_TOKEN = process.env.API_TOKEN;
          if (API_TOKEN) {
            url.searchParams.append('token', API_TOKEN);
          }

          // Call your existing API endpoint
          const response = await fetch(url.toString(), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userName: credentials.userName,
              password: credentials.password,
            }),
          });

          // Check if response is JSON before parsing
          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            // Get response text to see what was actually returned
            const responseText = await response.text();

            throw new Error(
              `API returned ${response.status} ${response.statusText}. Expected JSON but got ${contentType}. Response: ${responseText.substring(0, 200)}...`,
            );
          }

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || 'Authentication failed');
          }

          if (data && data.token) {
            // Decode the JWT to get user information
            const decodedToken = jwtDecode(data.token);

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
            };
          }

          throw new Error('Invalid credentials');
        } catch (error) {
          throw new Error(error.message || 'Authentication failed');
        }
      },
    }),
  ],
  pages: {
    signIn: '/account/login',
    signOut: '/account/login',
    error: '/account/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      // Persist the OAuth access_token and user data to the token right after signin
      if (user) {
        token.id = user.id;
        token.userName = user.userName;
        token.email = user.email;
        token.accessToken = user.token;
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
      }

      // Check if token is expired
      if (token.iat && Date.now() / 1000 > token.iat + 24 * 60 * 60) {
        // Token is expired, return null to force logout
        return null;
      }

      return token;
    },
    async session({ session, token }) {
      // Send properties to the client
      if (token) {
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
        session.accessToken = token.accessToken;
        session.iat = token.iat;
      }
      return session;
    },
  },
};

// Export authOptions for middleware compatibility
export const authOptions = options;
