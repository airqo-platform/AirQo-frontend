'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { useEffect, useMemo } from 'react';

import { getConfiguredSiteUrls } from '@/lib/siteUrl';

const FALLBACK_MEASUREMENT_ID = 'G-79ZVCLEDSG';

declare global {
  interface Window {
    dataLayer?: Record<string, any>[];
    gtag?: (...args: any[]) => void;
  }
}

interface GoogleAnalyticsProps {
  measurementId?: string;
}

/**
 * Single component to initialize Google Analytics and
 * track page views on route changes using the Next.js App Router.
 */
export default function GoogleAnalytics({
  measurementId,
}: GoogleAnalyticsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const resolvedMeasurementId =
    measurementId?.trim() || FALLBACK_MEASUREMENT_ID;
  const configuredLinkerDomains = useMemo(
    () =>
      getConfiguredSiteUrls()
        .map((siteUrl) => {
          try {
            return new URL(siteUrl).hostname;
          } catch {
            return null;
          }
        })
        .filter((domain): domain is string => Boolean(domain)),
    [],
  );

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.dataLayer = window.dataLayer || [];
    window.gtag =
      window.gtag ||
      ((...args: any[]) => {
        window.dataLayer?.push(args);
      });

    // Construct page path with query strings (if any)
    const pagePath = searchParams.toString()
      ? `${pathname}?${searchParams.toString()}`
      : pathname;

    window.gtag('event', 'page_view', {
      page_location: window.location.href,
      page_path: pagePath,
      page_title: document.title,
      send_to: resolvedMeasurementId,
    });
  }, [pathname, resolvedMeasurementId, searchParams]);

  if (!resolvedMeasurementId) {
    return null;
  }

  return (
    <>
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          window.gtag = window.gtag || function(){ window.dataLayer.push(arguments); };
          window.gtag('js', new Date());
          window.gtag('config', '${resolvedMeasurementId}', {
            send_page_view: false,
            allow_linker: true,
            cookie_domain: 'auto',
            linker: {
              domains: ${JSON.stringify(configuredLinkerDomains)},
            },
          });
        `}
      </Script>
      {/* Load the gtag script AFTER the page is interactive */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${resolvedMeasurementId}`}
        strategy="afterInteractive"
      />
    </>
  );
}

/**
 * helper function to track custom GA events.
 */
export function trackEvent({
  action,
  category,
  label,
  value,
}: {
  action: string;
  category: string;
  label: string;
  value?: number;
}) {
  if (typeof window === 'undefined') {
    return;
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    ((...args: any[]) => {
      window.dataLayer?.push(args);
    });

  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value,
  });
}
