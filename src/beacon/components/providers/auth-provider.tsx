'use client';

import { SessionProvider, signIn, useSession } from 'next-auth/react';
import { useEffect, useState, ReactNode } from 'react';
import { consumeOAuthTokenHandoffFromUrl } from '@/lib/oauth-session';
import authService from '@/services/api-service';

function AuthEffect({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [handoffProcessed, setHandoffProcessed] = useState(false);
  const [isHandlingHandoff, setIsHandlingHandoff] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.location.hash.includes('token=');
    }
    return false;
  });

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
      
      if (isHandlingHandoff) {
        setIsHandlingHandoff(false);
      }
    } else if (status === 'unauthenticated') {
      authService.setToken(null);
      authService.setUserData(null);
    }
  }, [session, status, isHandlingHandoff]);

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
    } else {
      setIsHandlingHandoff(false);
    }
  }, [handoffProcessed]);

  if (isHandlingHandoff || (status === 'unauthenticated' && typeof window !== 'undefined' && window.location.hash.includes('token='))) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="w-16 h-16 border-4 border-blue-200 rounded-full mb-4 relative">
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <div className="text-gray-900 text-xl font-semibold mb-2">Completing sign in...</div>
      </div>
    );
  }

  return <>{children}</>;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AuthEffect>{children}</AuthEffect>
    </SessionProvider>
  );
}
