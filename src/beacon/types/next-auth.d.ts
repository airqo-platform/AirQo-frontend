import type { DefaultSession, DefaultUser } from 'next-auth';

type AuthMethods = {
  password: boolean;
  google: boolean;
  github: boolean;
  linkedin: boolean;
  microsoft: boolean;
  twitter: boolean;
  facebook: boolean;
  apple: boolean;
};

type SessionUser = NonNullable<DefaultSession['user']> & {
  _id?: string;
  firstName?: string;
  lastName?: string;
  userName?: string;
  organization?: string;
  privilege?: string;
  country?: string;
  timezone?: string;
  phoneNumber?: string;
};

declare module 'next-auth' {
  interface User extends DefaultUser {
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
    timezone?: string;
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
    timezone?: string;
    phoneNumber?: string;
    image?: string;
    exp?: number;
  }
}
