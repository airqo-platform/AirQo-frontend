import NextAuth, { DefaultSession, DefaultUser } from 'next-auth';
import { JWT, DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      accessToken: string;
      userName: string;
      organization: string;
      privilege: string;
      firstName: string;
      lastName: string;
      country: string;
      timezone: string;
      phoneNumber: string;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    accessToken: string;
    userName: string;
    organization: string;
    privilege: string;
    firstName: string;
    lastName: string;
    country: string;
    timezone: string;
    phoneNumber: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    accessToken: string;
    userName: string;
    organization: string;
    privilege: string;
    firstName: string;
    lastName: string;
    country: string;
    timezone: string;
    phoneNumber: string;
  }
}
