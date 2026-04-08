import type { DefaultSession, DefaultUser } from 'next-auth';

declare module 'next-auth' {
  interface User extends DefaultUser {
    _id?: string;
    firstName?: string;
    lastName?: string;
    accessToken?: string;
    email?: string | null;
    name?: string | null;
    image?: string | null;
  }

  interface Session extends DefaultSession {
    accessToken?: string;
    user: (DefaultSession['user'] & User) | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    _id?: string;
    firstName?: string;
    lastName?: string;
    accessToken?: string;
  }
}
