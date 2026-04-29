'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { useEffect, useState } from 'react';

import { hasAnalyticsConsent } from '@/utils/cookieConsent';

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
 * Only loads after user consent is granted.
 */
export default function GoogleAnalytics({
  measurementId,
}: GoogleAnalyticsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [hasConsent, setHasConsent] = useState(false);
  const resolvedMeasurementId =
    measurementId?.trim() || FALLBACK_MEASUREMENT_ID;

  // Check for consent on mount and when consent changes
  useEffect(() => {
    const checkConsent = () => {
      setHasConsent(hasAnalyticsConsent());
    };

    checkConsent();

    // Listen for consent changes
    window.addEventListener('cookieConsentChanged', checkConsent);
    return () => {
      window.removeEventListener('cookieConsentChanged', checkConsent);
    };
  }, []);

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      !hasConsent ||
      typeof window.gtag === 'undefined'
    ) {
      return;
    }

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
  }, [pathname, resolvedMeasurementId, searchParams, hasConsent]);

  if (!resolvedMeasurementId || !hasConsent) {
    return null;
  }

  return (
    <>
      {/* Load the gtag script AFTER the page is interactive */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${resolvedMeasurementId}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){ dataLayer.push(arguments); }
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${resolvedMeasurementId}', {
            send_page_view: false,
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
