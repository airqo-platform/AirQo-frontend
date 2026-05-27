import type { DefaultSession, DefaultUser } from 'next-auth';
import type { AuthMethods } from '@/shared/types/api';

type SessionUser = NonNullable<DefaultSession['user']> & {
  _id?: string;
  firstName?: string;
  lastName?: string;
};

declare module 'next-auth' {
  interface User extends DefaultUser {
    _id?: string;
    firstName?: string;
    lastName?: string;
    accessToken?: string;
    expiresAt?: string;
    email?: string | null;
    name?: string | null;
    image?: string | null;
    authMethods?: AuthMethods;
  }

  interface Session extends DefaultSession {
    accessToken?: string;
    expiresAt?: string;
    authMethods?: AuthMethods;
    user: SessionUser | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    _id?: string;
    firstName?: string;
    lastName?: string;
    accessToken?: string;
    expiresAt?: string;
    authMethods?: AuthMethods;
  }
}
