'use client';

import { SessionProvider } from 'next-auth/react';

export default function NextAuthProvider({ children, session }) {
  return <SessionProvider session={session}>{children}</SessionProvider>;
}
