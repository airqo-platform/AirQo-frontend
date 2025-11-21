/* eslint-disable simple-import-sort/imports */
import './globals.css';

import { Metadata } from 'next';
import localFont from 'next/font/local';
import Script from 'next/script';
import { ReactNode, Suspense } from 'react';

import CookieConsent from '@/components/CookieConsent';
import EngagementDialog from '@/components/dialogs/EngagementDialog';
import ExternalLinkDecorator from '@/components/ExternalLinkDecorator';
import Loading from '@/components/loading';
import { ErrorBoundary } from '@/components/ui';
import { ReduxDataProvider } from '@/context/ReduxDataProvider';
import { SwrProvider } from '@/services/providers/SwrProvider';
import { generateViewport } from '@/lib/metadata';

const interFont = localFont({
  src: [
    {
      path: '../../public/fonts/Inter-VariableFont_opsz,wght.ttf',
      style: 'normal',
      weight: '100 900',
    },
    {
      path: '../../public/fonts/Inter-Italic-VariableFont_opsz,wght.ttf',
      style: 'italic',
      weight: '100 900',
    },
  ],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
});

// Default metadata - will be overridden by page-specific metadata
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://airqo.net',
  ),
  title: {
    default: 'AirQo | Bridging the Air Quality Data Gap in Africa',
    template: '%s | AirQo',
  },
  description:
    'AirQo empowers African communities with accurate, hyperlocal, and timely air quality data to drive pollution mitigation actions. We deploy low-cost sensors and provide real-time insights where 9 out of 10 people breathe polluted air.',
  keywords: [
    'AirQo',
    'air quality monitoring Africa',
    'air pollution data',
    'hyperlocal air quality',
    'African cities air quality',
    'real-time pollution data',
    'low-cost air sensors',
    'clean air Africa',
    'air quality analytics',
    'pollution mitigation',
    'environmental monitoring Africa',
    'PM2.5 Africa',
    'air quality index',
    'CLEAN-Air Forum',
    'CLEAN-Air Network',
    'Binos Monitor',
    'AirQalibrate',
    'mobile air quality app',
    'air quality API',
  ],
  authors: [{ name: 'AirQo' }],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url:
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
      'https://airqo.net',
    siteName: 'AirQo',
    title: 'AirQo | Bridging the Air Quality Data Gap in Africa',
    description:
      'AirQo empowers African communities with accurate, hyperlocal, and timely air quality data to drive pollution mitigation actions. We deploy low-cost sensors and provide real-time insights where 9 out of 10 people breathe polluted air.',
    images: [
      {
        url: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132435/website/photos/AirQuality_meyioj.webp',
        width: 1200,
        height: 630,
        alt: 'AirQo - Clean Air for All African Cities',
        type: 'image/webp',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@AirQoProject',
    creator: '@AirQoProject',
    title: 'AirQo | Bridging the Air Quality Data Gap in Africa',
    description:
      'AirQo empowers African communities with accurate, hyperlocal, and timely air quality data to drive pollution mitigation actions.',
    images: [
      {
        url: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132435/website/photos/AirQuality_meyioj.webp',
        alt: 'AirQo - Clean Air for All African Cities',
        width: 1200,
        height: 630,
      },
    ],
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
  other: {
    'apple-mobile-web-app-title': 'AirQo',
    'theme-color': '#145DFF',
    'msapplication-TileColor': '#145DFF',
  },
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const ENABLE_GA =
    process.env.NODE_ENV === 'production' &&
    // process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true' &&
    !!GA_ID;
  const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://airqo.net/';
  const siteUrl = rawSiteUrl.replace(/\/$/, '') + '/';

  // Maintenance check removed to avoid hydration and chunk loading issues

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    url: siteUrl,
    name: 'AirQo',
    alternateName: 'Air Quality and Pollution Monitoring Organization',
    description:
      'AirQo empowers African communities with accurate, hyperlocal, and timely air quality data to drive pollution mitigation actions. We deploy low-cost sensors and provide real-time insights where 9 out of 10 people breathe polluted air.',
    logo: `${siteUrl}icon.png`,
    sameAs: [
      'https://www.facebook.com/AirQo',
      'https://www.youtube.com/channel/UCx7YtV55TcqKGeKsDdT5_XQ',
      'https://www.linkedin.com/company/airqo/mycompany/',
      'https://x.com/AirQoProject',
    ],
    founder: {
      '@type': 'Person',
      name: 'Engineer Bainomugisha',
    },
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'Uganda',
      addressLocality: 'Kampala',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      url: `${siteUrl}contact`,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}explore-data?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <html lang="en" className={interFont.variable}>
      <head>
        {/* Performance optimizations */}
        <link rel="dns-prefetch" href="//res.cloudinary.com" />
        <link rel="dns-prefetch" href="//www.googletagmanager.com" />
        <link
          rel="preconnect"
          href="//res.cloudinary.com"
          crossOrigin="anonymous"
        />

        {/* Preload critical images */}
        <link
          rel="preload"
          as="image"
          href="https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132435/website/photos/AirQuality_meyioj.webp"
        />
        <link
          rel="preload"
          as="image"
          href="https://res.cloudinary.com/dbibjvyhm/image/upload/v1728138368/website/Logos/logo_rus4my.png"
        />

        {/* Structured data */}
        <Script
          id="ld-json"
          type="application/ld+json"
          strategy="afterInteractive"
        >
          {JSON.stringify(structuredData)}
        </Script>

        {/* GA snippet is conditionally loaded based on user consent */}
        {/* Actual loading is handled by GoogleAnalytics component in body */}
        {ENABLE_GA && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){ dataLayer.push(arguments); }
                gtag('js', new Date());
                // GA config is called by GoogleAnalytics component after consent
              `}
            </Script>
          </>
        )}
      </head>
      <body>
        <ExternalLinkDecorator />
        <ErrorBoundary>
          <ReduxDataProvider>
            <SwrProvider>
              <Suspense fallback={<Loading />}>
                <EngagementDialog />
                {children}
              </Suspense>
            </SwrProvider>
          </ReduxDataProvider>
        </ErrorBoundary>
        <CookieConsent />
      </body>
    </html>
  );
}

// Centralized viewport export for all pages (accessible - generator removed maximumScale)
export const viewport = generateViewport();
