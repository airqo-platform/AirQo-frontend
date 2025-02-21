'use client';

import Script from 'next/script';

interface GoogleAnalyticsProps {
  measurementId: string;
}

export function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  if (!measurementId) return null;

  return (
    <>
      {/* Load the GA library after the page becomes interactive */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
        // Optionally, use strategy="lazyOnload" if you experience performance issues.
      />
      <Script id="ga-script" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){ dataLayer.push(arguments); }
          gtag('js', new Date());
          gtag('config', '${measurementId}');
        `}
      </Script>
    </>
  );
}
