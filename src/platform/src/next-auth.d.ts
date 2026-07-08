import type { DefaultSession, DefaultUser } from 'next-auth';
import type { AuthMethods } from '@/shared/types/api';

type SessionUser = NonNullable<DefaultSession['user']> & {
  _id?: string;
  firstName?: string;
  lastName?: string;
  userName?: string;
  organization?: string;
  privilege?: string;
  country?: string;
  phoneNumber?: string;
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
    userName?: string;
    organization?: string;
    privilege?: string;
    country?: string;
    phoneNumber?: string;
    exp?: number;
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
    id?: string;
    _id?: string;
    firstName?: string;
    lastName?: string;
    accessToken?: string;
    expiresAt?: string;
    authMethods?: AuthMethods;
    userName?: string;
    organization?: string;
    privilege?: string;
    country?: string;
    phoneNumber?: string;
    image?: string;
    exp?: number;
  }
}
