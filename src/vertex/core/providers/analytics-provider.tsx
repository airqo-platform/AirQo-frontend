'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useAppSelector } from '@/core/redux/hooks';
import {
  consumePendingSignIn,
  identifyUser,
  resetAnalytics,
  setActiveOrganization,
  trackEvent,
  trackPageview,
} from '@/lib/analytics';

type SessionUser = { _id?: string; id?: string };

/**
 * Sends a pageview on every route change, ties events to the signed-in user and keeps PostHog's
 * `organization` group in step with the active organisation. Renders nothing; does nothing when
 * NEXT_PUBLIC_POSTHOG_KEY isn't set.
 */
export function AnalyticsProvider() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const userDetails = useAppSelector(state => state.user.userDetails);
  const activeGroup = useAppSelector(state => state.user.activeGroup);
  const userContext = useAppSelector(state => state.user.userContext);
  const identifiedId = useRef<string | null>(null);
  const viewedPathname = useRef<string | null>(null);
  const organizationSignature = useRef<string | null>(null);
  // The login page reloads straight after signing in; report the sign-in from the page it lands on
  const onLoginPage = pathname === '/login';

  const sessionUser = session?.user as SessionUser | undefined;
  const userId = (sessionUser?._id || sessionUser?.id || userDetails?._id || '').trim();
  // Persisted details can belong to the previous account for a moment after a switch
  const details = userDetails?._id === userId ? userDetails : null;
  const privilege = details?.privilege;
  const country = details?.country ?? undefined;

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'authenticated' && userId) {
      identifyUser({ id: userId, privilege, country });
      identifiedId.current = userId;

      // Every sign-in method notes itself first, so this reports each sign-in once
      const signIn = onLoginPage ? null : consumePendingSignIn();
      if (signIn) {
        trackEvent('user_signed_in', {
          method: signIn.method,
          login_duration_ms: signIn.duration_ms,
        });
      }
      return;
    }

    // Signed out in this tab (the session expired or was ended elsewhere)
    if (identifiedId.current) {
      resetAnalytics();
      identifiedId.current = null;
    }
  }, [status, userId, privilege, country, onLoginPage]);

  const groupId = activeGroup?._id;
  const groupTitle = activeGroup?.grp_title;

  useEffect(() => {
    if (status !== 'authenticated') return;
    // Effects can run twice for one render (React StrictMode in development)
    const signature = [groupId, groupTitle, userContext].join('|');
    if (organizationSignature.current === signature) return;
    organizationSignature.current = signature;
    setActiveOrganization(groupId ? { id: groupId, title: groupTitle } : null, userContext);
  }, [status, groupId, groupTitle, userContext]);

  useEffect(() => {
    // Once per page: effects can run twice for one render (React StrictMode in development)
    if (!pathname || viewedPathname.current === pathname) return;
    viewedPathname.current = pathname;
    trackPageview(pathname);
  }, [pathname]);

  return null;
}
