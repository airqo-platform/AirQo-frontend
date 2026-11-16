/* eslint-disable simple-import-sort/imports */
import './globals.css';

import { Metadata } from 'next';
import localFont from 'next/font/local';
import Script from 'next/script';
import { ReactNode, Suspense } from 'react';

import GlobalRouteChrome from '@/components/GlobalRouteChrome';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import NonBlockingFontLink from '@/components/NonBlockingFontLink';
import { ErrorBoundary } from '@/components/ui';
import { ReduxDataProvider } from '@/components/providers/ReduxProvider';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { generateViewport } from '@/lib/metadata';
import { getPrimarySiteUrl } from '@/lib/siteUrl';

const GOOGLE_ANALYTICS_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

const DEFAULT_OG_IMAGE = '/assets/images/seo/airqo-social-fallback.jpg';

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
  fallback: [
    'system-ui',
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'sans-serif',
  ],

  adjustFontFallback: 'Arial',
});

// Root layout metadata - static to preserve static generation.
// getPrimarySiteUrl() resolves at runtime: window.location.origin on client,
// env vars on server. Pages needing request-time host detection (e.g. blogs/[slug])
// should use their own generateMetadata() with headers().
export const metadata: Metadata = {
  metadataBase: new URL(getPrimarySiteUrl()),
  title: {
    default: 'AirQo | Bridging the Air Quality Data Gap in Africa',
    template: '%s | AirQo',
  },
  description:
    'AirQo works with African communities to measure air quality and make local data available for research, public awareness, and action.',

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
    siteName: 'AirQo',
    title: 'AirQo | Air quality data and research across Africa',
    description:
      'AirQo works with African communities to measure air quality and make local data available for research, public awareness, and action.',
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: 'AirQo team members working with air quality monitoring equipment',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@AirQoProject',
    creator: '@AirQoProject',
    title: 'AirQo | Air quality data and research across Africa',
    description:
      'AirQo works with African communities to measure air quality and make local data available for research, public awareness, and action.',
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        alt: 'AirQo team members working with air quality monitoring equipment',
        width: 1200,
        height: 630,
      },
    ],
  },
  icons: {
    icon: [
      {
        url: '/web-app-manifest-192x192.png',
        sizes: 'any',
        type: 'image/png',
      },
      {
        url: '/web-app-manifest-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
    ],
    apple: '/web-app-manifest-192x192.png',
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

export default function RootLayout({ children }: { children: ReactNode }) {
  const siteUrl = `${getPrimarySiteUrl()}/`;

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    url: siteUrl,
    name: 'AirQo',
    alternateName: 'Air Quality and Pollution Monitoring Organization',
    description:
      'AirQo works with African communities to measure air quality and make local data available for research, public awareness, and action.',
    logo: `${siteUrl}web-app-manifest-512x512.png`,
    sameAs: [
      'https://www.facebook.com/AirQo',
      'https://www.youtube.com/channel/UCx7YtV55TcqKGeKsDdT5_XQ',
      'https://www.linkedin.com/company/airqo/mycompany/',
      'https://x.com/AirQoProject',
    ],
    founder: {
      '@type': 'Person',
      name: 'Engineer Bainomugisha',
      jobTitle: 'Professor',
      affiliation: {
        '@type': 'Organization',
        name: 'Makerere University',
      },
    },
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'Uganda',
      addressLocality: 'Kampala',
      addressRegion: 'Central Region',
      streetAddress: 'Makerere University',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      url: `${siteUrl}contact`,
      areaServed: ['UG', 'KE', 'NG', 'GH', 'RW', 'TZ', 'Africa'],
      availableLanguage: ['English', 'Swahili'],
    },
    areaServed: [
      { '@type': 'Country', name: 'Uganda' },
      { '@type': 'Country', name: 'Kenya' },
      { '@type': 'Country', name: 'Nigeria' },
      { '@type': 'Country', name: 'Ghana' },
      { '@type': 'Country', name: 'Rwanda' },
      { '@type': 'Country', name: 'Tanzania' },
    ],
    knowsAbout: [
      'Air Quality Monitoring',
      'Environmental Data',
      'PM2.5 Measurement',
      'Pollution Mitigation',
      'African Environmental Solutions',
      'Urban Air Quality',
      'Low-cost Sensors',
      'Real-time Air Data',
    ],
  };

  return (
    <html lang="en" className={interFont.variable}>
      <head>
        {/* Performance optimizations - DNS prefetch and preconnect */}
        <link rel="dns-prefetch" href="//res.cloudinary.com" />
        <link rel="dns-prefetch" href="//www.googletagmanager.com" />
        <link
          rel="preconnect"
          href="//res.cloudinary.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="//www.googletagmanager.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="//translate.google.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="//translate.googleapis.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="//translate.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="//fonts.googleapis.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="//fonts.gstatic.com"
          crossOrigin="anonymous"
        />

        {/* DM Mono (used on the For Communities page) loaded non-blocking */}
        <NonBlockingFontLink href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500;700&display=swap" />

        <meta name="referrer" content="strict-origin-when-cross-origin" />

        {/* Structured data */}
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: Static JSON-LD data, not user input */}
        <Script
          id="ld-json"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body>
        <Suspense fallback={null}>
          <GoogleAnalytics measurementId={GOOGLE_ANALYTICS_MEASUREMENT_ID} />
        </Suspense>
        <ErrorBoundary>
          <ReduxDataProvider>
            <QueryProvider>
              {children}
              <GlobalRouteChrome />
            </QueryProvider>
          </ReduxDataProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}

// Centralized viewport export for all pages (accessible - generator removed maximumScale)
export const viewport = generateViewport();
