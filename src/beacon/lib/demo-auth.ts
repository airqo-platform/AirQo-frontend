import CredentialsProvider from 'next-auth/providers/credentials';
import { DEMO_USER, createDemoAccessToken } from '@/lib/mock/identity';

/**
 * `auth.provider: "none"`: one "demo" credentials provider that signs everyone in as the demo user
 * without asking for anything. The session carries the same fields a real sign-in does.
 */
export function demoCredentialsProvider() {
  return CredentialsProvider({
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
        accessTokenExp: exp,
      };
    },
  });
}

/**
 * Without NEXTAUTH_URL, NextAuth v4 assumes http://localhost:3000 and sends sign-in and sign-out
 * redirects there. Trusting the request's host keeps them on whatever address the demo is served
 * from. Set NEXTAUTH_URL before adding a real auth provider.
 */
export function trustRequestHostWithoutNextAuthUrl() {
  if (!process.env.NEXTAUTH_URL && !process.env.AUTH_TRUST_HOST) {
    process.env.AUTH_TRUST_HOST = 'true';
  }
}
