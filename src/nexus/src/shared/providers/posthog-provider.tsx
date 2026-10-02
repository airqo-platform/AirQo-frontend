'use client';

import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
import { useEffect, Suspense, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useSelector } from 'react-redux';
import { usePageTracking } from '@/shared/hooks/usePageTracking';
import { useUsageTracking } from '@/shared/hooks/useUsageTracking';
import { selectActiveGroup, selectUser } from '@/shared/store/selectors';
import { AIRQO_APP_NAME } from '@/shared/utils/analyticsConstants';
import { capturePostHogEvent } from '@/shared/utils/analytics';

function AnalyticsBridge() {
  const postHogClient = posthog;
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const activeGroup = useSelector(selectActiveGroup);
  const user = useSelector(selectUser);
  const previousIdentityRef = useRef<string | null>(null);
  const previousPersonPropertiesRef = useRef<string | null>(null);
  const previousGroupRef = useRef<string | null>(null);

  usePageTracking();
  useUsageTracking();

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      return;
    }

    const sessionUser = session?.user as { _id?: string } | null;

    if (status !== 'authenticated') {
      // Preserve the anonymous distinct ID while NextAuth is resolving. Reset
      // only after an authenticated user has actually signed out.
      if (status === 'unauthenticated' && previousIdentityRef.current) {
        postHogClient.reset();
        previousIdentityRef.current = null;
        previousPersonPropertiesRef.current = null;
        previousGroupRef.current = null;
      }
      return;
    }

    const userId = sessionUser?._id?.trim() || '';
    if (!userId) return;

    const personProperties = Object.fromEntries(
      Object.entries({
        app_name: AIRQO_APP_NAME,
        organization: user?.organization || undefined,
        country: user?.country || undefined,
        job_title: user?.jobTitle || undefined,
        verified: user?.verified,
        is_active: user?.isActive,
      }).filter(([, value]) => value !== undefined)
    );
    const personPropertiesSignature = JSON.stringify(personProperties);

    if (previousIdentityRef.current && previousIdentityRef.current !== userId) {
      // Do not merge events from two accounts if the account changes without
      // an intermediate signed-out render.
      postHogClient.reset();
      previousGroupRef.current = null;
    }

    if (previousIdentityRef.current !== userId) {
      postHogClient.identify(userId, personProperties);
    } else if (
      previousPersonPropertiesRef.current !== personPropertiesSignature
    ) {
      postHogClient.setPersonProperties(personProperties);
    }

    previousIdentityRef.current = userId;
    previousPersonPropertiesRef.current = personPropertiesSignature;
  }, [postHogClient, session, status, user]);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      return;
    }

    const routeOrganizationSlug = pathname?.match(/^\/org\/([^/]+)/)?.[1];
    let decodedRouteOrganizationSlug = routeOrganizationSlug;
    try {
      decodedRouteOrganizationSlug = routeOrganizationSlug
        ? decodeURIComponent(routeOrganizationSlug)
        : undefined;
    } catch {
      // Keep the encoded slug if the path contains malformed escaping.
    }
    const isMatchingOrganization =
      !!decodedRouteOrganizationSlug &&
      activeGroup?.organizationSlug?.trim().toLowerCase() ===
        decodedRouteOrganizationSlug.trim().toLowerCase();

    if (status !== 'authenticated') {
      if (previousGroupRef.current !== 'outside-organization-flow') {
        postHogClient.resetGroups();
        previousGroupRef.current = 'outside-organization-flow';
      }
      return;
    }

    if (!isMatchingOrganization || !activeGroup?.id) {
      if (previousGroupRef.current !== 'outside-organization-flow') {
        postHogClient.resetGroups();
      }
      previousGroupRef.current = 'outside-organization-flow';
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
  }, [activeGroup, pathname, postHogClient, session, status]);

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
          process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
        capture_pageview: false, // Disable automatic pageview capture, as we capture manually
        capture_pageleave: true, // Enable pageleave capture
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
      capturePostHogEvent(posthog, '$pageview', {
        $current_url: url,
      });

      previousPathname.current = pathname;
    }
  }, [pathname]);

  return null;
}
