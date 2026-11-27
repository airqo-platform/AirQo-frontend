'use client';

import { SessionProvider, useSession } from 'next-auth/react';
import { useEffect, ReactNode } from 'react';
import authService from '@/services/api-service';
import { AuthHandoff } from '@/components/integration';
import { startNetworkMonitor } from '@/lib/network-status';
import { keepSession } from '@/lib/session-fallback';

/** Mirrors the session into authService, which the API services read the token from. */
function AuthEffect({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();

  // The monitor's fetch observer answers a session check that can't reach the server with the
  // last session, so a dropped connection doesn't sign the user out (lib/session-fallback).
  useEffect(() => {
    startNetworkMonitor();
  }, []);

  useEffect(() => {
    if (status !== 'loading') keepSession(status === 'authenticated' ? session : null);
  }, [session, status]);

  useEffect(() => {
    if (status === 'authenticated' && session) {
      const rawToken = session.accessToken ? session.accessToken.replace(/^(JWT|Bearer)\s+/i, '') : '';
      authService.setToken(rawToken ? `JWT ${rawToken}` : null);

      const rawUser = session.user;
      if (rawUser) {
        authService.setUserData({
          id: (rawUser as any).id,
          _id: rawUser._id,
          first_name: rawUser.firstName,
          last_name: rawUser.lastName,
          firstName: rawUser.firstName,
          lastName: rawUser.lastName,
          email: rawUser.email,
          userName: rawUser.userName,
          phone: rawUser.phoneNumber,
          role: rawUser.privilege || 'user',
        });
      }
    } else if (status === 'unauthenticated') {
      authService.setToken(null);
      authService.setUserData(null);
    }
  }, [session, status]);

  return <>{children}</>;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AuthEffect>
        <AuthHandoff>{children}</AuthHandoff>
      </AuthEffect>
    </SessionProvider>
  );
}
