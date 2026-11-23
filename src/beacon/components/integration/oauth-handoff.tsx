'use client';

import { signIn, useSession } from 'next-auth/react';
import { useEffect, useState, ReactNode } from 'react';
import { consumeOAuthTokenHandoffFromUrl, isSupportedSocialAuthProvider } from '@/lib/oauth-session';
import { markLoginStarted } from '@/lib/feedback-preferences';
import { LoadingOverlay } from '@/components/ui/loading-overlay';

/**
 * Finishes a social sign-in: the platform returns with `#token=…`, which is exchanged for a
 * session here. Shows an overlay until the session exists. Not part of the exported template.
 */
export function OAuthHandoff({ children }: { children: ReactNode }) {
  const { status } = useSession();
  const [handoffProcessed, setHandoffProcessed] = useState(false);
  const [isHandlingHandoff, setIsHandlingHandoff] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.location.hash.includes('token=');
    }
    return false;
  });

  useEffect(() => {
    if (status === 'authenticated' && isHandlingHandoff) {
      setIsHandlingHandoff(false);
    }
  }, [status, isHandlingHandoff]);

  useEffect(() => {
    if (handoffProcessed) return;

    const handoff = consumeOAuthTokenHandoffFromUrl();
    if (handoff) {
      setHandoffProcessed(true);

      const callbackUrl = handoff.callbackUrl || '/dashboard/home';
      // Lets the dashboard follow this sign-in with the login experience prompt
      // The provider comes from the URL: anything unrecognised is recorded as plain 'oauth'
      markLoginStarted(isSupportedSocialAuthProvider(handoff.provider) ? handoff.provider : 'oauth');

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
      <LoadingOverlay
        isVisible
        delayMs={0}
        title="Completing sign in..."
        description="Setting up your authenticated session..."
      />
    );
  }

  return <>{children}</>;
}
