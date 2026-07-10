'use client';

import { SessionProvider, signIn, useSession } from 'next-auth/react';
import { useEffect, useState, ReactNode } from 'react';
import { consumeOAuthTokenHandoffFromUrl } from '@/lib/oauth-session';
import authService from '@/services/api-service';

function AuthEffect({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [handoffProcessed, setHandoffProcessed] = useState(false);

  useEffect(() => {
    if (status === 'authenticated' && session) {
      const rawToken = session.accessToken ? session.accessToken.replace(/^(JWT|Bearer)\s+/i, '') : '';
      authService.setToken(rawToken ? `JWT ${rawToken}` : null);
      
      const rawUser = session.user;
      if (rawUser) {
        authService.setUserData({
          id: (rawUser as any).id,
          _id: (rawUser as any)._id,
          first_name: rawUser.firstName,
          last_name: rawUser.lastName,
          firstName: rawUser.firstName,
          lastName: rawUser.lastName,
          email: rawUser.email,
          userName: (rawUser as any).userName,
          phone: (rawUser as any).phoneNumber,
          role: (rawUser as any).privilege || 'user',
        });
      }
    } else if (status === 'unauthenticated') {
      authService.setToken(null);
      authService.setUserData(null);
    }
  }, [session, status]);

  useEffect(() => {
    if (handoffProcessed) return;

    const handoff = consumeOAuthTokenHandoffFromUrl();
    if (handoff) {
      setHandoffProcessed(true);
      
      const callbackUrl = handoff.callbackUrl || '/dashboard/devices';
      
      signIn('credentials', {
        oauthToken: handoff.token,
        oauthProvider: handoff.provider,
        redirect: true,
        callbackUrl: callbackUrl,
      });
    }
  }, [handoffProcessed]);

  return <>{children}</>;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AuthEffect>{children}</AuthEffect>
    </SessionProvider>
  );
}
