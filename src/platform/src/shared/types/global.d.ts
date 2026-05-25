declare module '*.css';

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    expiresAt?: string;
    authMethods?: {
      password: boolean;
      google: boolean;
      github: boolean;
      linkedin: boolean;
      microsoft: boolean;
      twitter: boolean;
      facebook: boolean;
      apple: boolean;
    };
  }

  interface User {
    accessToken?: string;
    expiresAt?: string;
    authMethods?: {
      password: boolean;
      google: boolean;
      github: boolean;
      linkedin: boolean;
      microsoft: boolean;
      twitter: boolean;
      facebook: boolean;
      apple: boolean;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    expiresAt?: string;
    authMethods?: {
      password: boolean;
      google: boolean;
      github: boolean;
      linkedin: boolean;
      microsoft: boolean;
      twitter: boolean;
      facebook: boolean;
      apple: boolean;
    };
  }
}
