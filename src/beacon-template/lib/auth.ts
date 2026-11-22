import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { beaconConfig } from '@/beacon.config';
import { DEMO_USER, createDemoAccessToken } from '@/lib/mock/identity';
import { AUTH_SECRET } from '@/lib/auth-secret';

/**
 * Sign-in for the template.
 *
 * v1 supports one auth provider, `none` (see beacon.config.ts): a single "demo" credentials
 * provider that signs everyone in as the demo user without asking for anything. The rest of
 * the app reads the session exactly as it would with a real provider, so adding one later
 * means adding a provider here and returning the same session fields.
 */

if (beaconConfig.auth.provider !== 'none') {
  throw new Error(`Unsupported auth provider "${beaconConfig.auth.provider}". v1 supports "none" only.`);
}

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Without NEXTAUTH_URL, NextAuth v4 assumes http://localhost:3000 and sends sign-in and sign-out
 * redirects there. Trusting the request's host instead keeps them on whatever address the demo is
 * served from. Set NEXTAUTH_URL (and drop this) once a real auth provider is added.
 */
if (!process.env.NEXTAUTH_URL && !process.env.AUTH_TRUST_HOST) {
  process.env.AUTH_TRUST_HOST = 'true';
}

const isTokenExpired = (exp?: number): boolean => {
  if (!exp) return false;
  // 5-minute grace period for clock drift
  return Date.now() / 1000 > exp + 300;
};

export const authOptions: NextAuthOptions = {
  secret: AUTH_SECRET,
  useSecureCookies: isProduction,
  providers: [
    CredentialsProvider({
      id: 'demo',
      name: 'Demo',
      credentials: {},
      async authorize() {
        const { token, exp } = createDemoAccessToken();
        return {
          id: DEMO_USER._id,
          _id: DEMO_USER._id,
          email: DEMO_USER.email,
          name: `${DEMO_USER.firstName} ${DEMO_USER.lastName}`,
          image: '',
          userName: DEMO_USER.userName,
          accessToken: token,
          organization: DEMO_USER.organization,
          privilege: DEMO_USER.privilege,
          firstName: DEMO_USER.firstName,
          lastName: DEMO_USER.lastName,
          country: DEMO_USER.country,
          timezone: DEMO_USER.timezone,
          phoneNumber: DEMO_USER.phoneNumber,
          exp,
        };
      },
    }),
  ],

  cookies: {
    sessionToken: {
      name: isProduction ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: isProduction,
      },
    },
  },

  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60,
  },

  jwt: {
    maxAge: 24 * 60 * 60,
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token._id = user._id || user.id;
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
        token.exp = user.exp;
      }
      return token;
    },

    async session({ session, token }) {
      if (isTokenExpired(token.exp as number | undefined)) {
        return { ...session, user: null };
      }

      session.accessToken = token.accessToken as string;
      session.user = {
        ...session.user,
        id: token.id as string,
        _id: (token._id as string) || (token.id as string),
        userName: token.userName as string,
        organization: token.organization as string,
        privilege: token.privilege as string,
        firstName: token.firstName as string,
        lastName: token.lastName as string,
        country: token.country as string,
        timezone: token.timezone as string,
        phoneNumber: token.phoneNumber as string,
        image: (token.image as string) || '',
      } as any;
      return session;
    },
  },

  pages: {
    signIn: '/login',
  },

  debug: false,
};
