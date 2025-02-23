'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { useEffect } from 'react';

declare global {
  interface Window {
    gtag: (
      option: string,
      gaTrackingId: string,
      options: Record<string, unknown>,
    ) => void;
    dataLayer: Record<string, unknown>[];
  }
}

interface GoogleAnalyticsProps {
  measurementId: string;
}

// Validate measurement ID format
const isValidMeasurementId = (id: string): boolean => {
  return /^G-[A-Z0-9]+$/.test(id);
};

export function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!measurementId || !isValidMeasurementId(measurementId)) return;

    const url = pathname + searchParams.toString();

    window.gtag?.('config', measurementId, {
      page_path: url,
    });
  }, [pathname, searchParams, measurementId]);

  if (!measurementId || !isValidMeasurementId(measurementId)) {
    console.warn('Invalid or missing Google Analytics Measurement ID');
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
        onError={(e) => {
          console.error('Error loading Google Analytics:', e);
        }}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        onError={(e) => {
          console.error('Error initializing Google Analytics:', e);
        }}
      >
        {`
          window.dataLayer = window.dataLayer || [];
          window.gtag = function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
    </>
  );
}

// Safe event tracking utility with input validation
export const trackEvent = (
  action: string,
  category: string,
  label: string,
  value?: number,
) => {
  // Validate inputs
  if (!action || typeof action !== 'string') return;
  if (!category || typeof category !== 'string') return;
  if (!label || typeof label !== 'string') return;
  if (value !== undefined && typeof value !== 'number') return;

  // Sanitize inputs
  const sanitizedAction = action.slice(0, 100);
  const sanitizedCategory = category.slice(0, 100);
  const sanitizedLabel = label.slice(0, 100);

  if (typeof window.gtag !== 'undefined') {
    try {
      window.gtag('event', sanitizedAction, {
        event_category: sanitizedCategory,
        event_label: sanitizedLabel,
        value: value,
      });
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }
};
