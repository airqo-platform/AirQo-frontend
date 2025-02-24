'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { useEffect } from 'react';

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

  console.info('gta', measurementId);

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      !measurementId ||
      typeof window.gtag === 'undefined'
    ) {
      return;
    }

    // Construct page path with query strings (if any)
    const pagePath = searchParams.toString()
      ? `${pathname}?${searchParams.toString()}`
      : pathname;

    window.gtag('config', measurementId, {
      page_path: pagePath,
    });
  }, [measurementId, pathname, searchParams]);

  if (!measurementId) {
    return null;
  }

  return (
    <>
      {/* Load the gtag script AFTER the page is interactive */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){ dataLayer.push(arguments); }
          gtag('js', new Date());
          gtag('config', '${measurementId}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
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
  if (typeof window !== 'undefined' && typeof window.gtag !== 'undefined') {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value,
    });
  }
}
