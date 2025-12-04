'use client';

import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
import { useEffect, Suspense, useRef } from 'react';
import { usePathname } from 'next/navigation';

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
            app_name: 'AirQo Platform',
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
        app_name: 'AirQo Platform', // Include app_name in pageviews
      });

      previousPathname.current = pathname;
    }
  }, [pathname]);

  return null;
}
