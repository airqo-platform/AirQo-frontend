declare module 'next-auth' {
  interface User {
    _id?: string;
    firstName?: string;
    lastName?: string;
  }

  interface Session {
    accessToken?: string;
    user: User;
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
