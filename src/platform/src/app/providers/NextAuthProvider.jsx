'use client';

import { SessionProvider } from 'next-auth/react';

export default function NextAuthProvider({ children, session }) {
  // Use the single NextAuth endpoint for all authentication
  // Organization sessions will be handled through user auth with organization context
  return (
    <SessionProvider session={session} basePath="/api/auth">
      {children}
    </SessionProvider>
  );
}
