import NextAuth, { DefaultSession, DefaultUser } from 'next-auth';
import { JWT, DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user?: ({
      id: string;
      _id?: string;
      accessToken: string;
      userName: string;
      organization: string;
      privilege: string;
      firstName: string;
      lastName: string;
      country: string;
      timezone: string;
      phoneNumber: string;
      image?: string;
      expiresAt?: string;
      exp?: number;
    } & DefaultSession['user']) | null;
  }

  interface User extends DefaultUser {
    _id?: string;
    accessToken: string;
    userName: string;
    organization: string;
    privilege: string;
    firstName: string;
    lastName: string;
    country: string;
    timezone: string;
    phoneNumber: string;
    expiresAt?: string;
    exp?: number;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    _id?: string;
    accessToken: string;
    userName: string;
    organization: string;
    privilege: string;
    firstName: string;
    lastName: string;
    country: string;
    timezone: string;
    phoneNumber: string;
    image?: string;
    expiresAt?: string;
    exp?: number;
  }
}
