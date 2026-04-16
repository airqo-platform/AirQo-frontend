'use client';

import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
import { useEffect, Suspense, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useSelector } from 'react-redux';
import { usePageTracking } from '@/shared/hooks/usePageTracking';
import { selectActiveGroup, selectUser } from '@/shared/store/selectors';
import { AIRQO_APP_NAME } from '@/shared/utils/analyticsConstants';

function AnalyticsBridge() {
  const postHogClient = posthog;
  const { data: session, status } = useSession();
  const activeGroup = useSelector(selectActiveGroup);
  const user = useSelector(selectUser);
  const previousIdentityRef = useRef<string | null>(null);
  const previousGroupRef = useRef<string | null>(null);

  usePageTracking();

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      return;
    }

    const sessionUser = session?.user as {
      _id?: string;
      email?: string | null;
      name?: string | null;
      firstName?: string;
      lastName?: string;
    } | null;

    const userId = sessionUser?._id?.trim() || '';

    if (status !== 'authenticated' || !userId) {
      if (previousIdentityRef.current) {
        postHogClient.reset();
        previousIdentityRef.current = null;
        previousGroupRef.current = null;
      }
      return;
    }

    const identitySignature = [
      userId,
      sessionUser?.email || '',
      sessionUser?.name || '',
      sessionUser?.firstName || '',
      sessionUser?.lastName || '',
      user?.organization || '',
      user?.country || '',
      user?.jobTitle || '',
      activeGroup?.id || '',
    ].join('|');

    if (previousIdentityRef.current !== identitySignature) {
      postHogClient.identify(userId, {
        app_name: AIRQO_APP_NAME,
        email: sessionUser?.email || '',
        name:
          sessionUser?.name ||
          [sessionUser?.firstName, sessionUser?.lastName]
            .filter(Boolean)
            .join(' ') ||
          sessionUser?.email ||
          '',
        first_name: sessionUser?.firstName || user?.firstName || '',
        last_name: sessionUser?.lastName || user?.lastName || '',
        user_name: user?.userName || '',
        organization: user?.organization || '',
        country: user?.country || '',
        job_title: user?.jobTitle || '',
        verified: user?.verified,
        is_active: user?.isActive,
        active_group_id: activeGroup?.id || '',
        active_group_name: activeGroup?.title || '',
        active_group_slug: activeGroup?.organizationSlug || '',
      });
      previousIdentityRef.current = identitySignature;
    }
  }, [activeGroup, postHogClient, session, status, user]);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      return;
    }

    if (status !== 'authenticated' || !activeGroup?.id) {
      return;
    }

    const groupSignature = [
      activeGroup.id,
      activeGroup.title,
      activeGroup.organizationSlug,
    ].join('|');

    if (previousGroupRef.current === groupSignature) {
      return;
    }

    postHogClient.group('organization', activeGroup.id, {
      app_name: AIRQO_APP_NAME,
      name: activeGroup.title,
      slug: activeGroup.organizationSlug,
      status: activeGroup.status,
      user_type: activeGroup.userType,
    });
    previousGroupRef.current = groupSignature;
  }, [activeGroup, postHogClient, status]);

  return null;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const isInitialized = useRef(false);

  useEffect(() => {
    // Prevent multiple initializations (memory leak prevention)
    if (isInitialized.current) return;

    if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
        api_host:
          process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.posthog.com',
        capture_pageview: false, // Disable automatic pageview capture, as we capture manually
        capture_pageleave: true, // Enable pageleave capture
        property_denylist: [
          'site_id',
          'location_id',
          'site_name',
          'location_name',
        ], // Redact raw location identifiers for privacy
        loaded: posthog => {
          // Set super properties that will be sent with every event
          posthog.register({
            app_name: AIRQO_APP_NAME,
            app_version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
            environment: process.env.NODE_ENV || 'production',
          });
        },
        persistence: 'localStorage+cookie', // Use both for better reliability
        autocapture: false, // Disable autocapture to have more control
        disable_session_recording: true, // Disable session recording unless explicitly needed
      });

      isInitialized.current = true;
    }

    // Cleanup function to prevent memory leaks
    return () => {
      // Don't reset on unmount as PostHog should persist across the app
      // Only cleanup on actual app teardown
    };
  }, []);

  return (
    <PHProvider client={posthog}>
      <Suspense fallback={null}>
        <AnalyticsBridge />
        <PostHogPageView />
      </Suspense>
      {children}
    </PHProvider>
  );
}

function PostHogPageView() {
  const pathname = usePathname();
  const previousPathname = useRef<string>();

  useEffect(() => {
    if (pathname && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      // Avoid duplicate pageview events
      if (previousPathname.current === pathname) return;

      const url = window.location.origin + pathname;
      posthog.capture('$pageview', {
        $current_url: url,
        app_name: AIRQO_APP_NAME,
      });

      previousPathname.current = pathname;
    }
  }, [pathname]);

  return null;
}
