/* eslint-disable simple-import-sort/imports */
import './globals.css';

import { Metadata } from 'next';
import localFont from 'next/font/local';
import Script from 'next/script';
import { ReactNode, Suspense, lazy } from 'react';

import CookieConsent from '@/components/CookieConsent';
import ExternalLinkDecorator from '@/components/ExternalLinkDecorator';
import { ErrorBoundary } from '@/components/ui';
import { ReduxDataProvider } from '@/context/ReduxDataProvider';
import { SwrProvider } from '@/services/providers/SwrProvider';
import { generateViewport } from '@/lib/metadata';

// Lazy load non-critical components
const EngagementDialog = lazy(
  () => import('@/components/dialogs/EngagementDialog'),
);
const FloatingMiniBillboardWrapper = lazy(
  () => import('@/components/FloatingMiniBillboardWrapper'),
);
const GoogleTranslate = lazy(() => import('@/components/GoogleTranslate'));

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
    'AirQo empowers African communities with accurate, hyperlocal, and timely air quality data to drive pollution mitigation actions. Real-time monitoring in Uganda (Kampala), Kenya (Nairobi), Nigeria (Lagos), Ghana (Accra) and 16+ African cities. We deploy low-cost sensors and provide real-time insights where 9 out of 10 people breathe polluted air.',
  keywords: [
    'AirQo',
    // African countries - PRIMARY FOCUS
    'air quality Uganda',
    'air pollution Kenya',
    'Nigeria air quality',
    'Ghana air monitoring',
    'Rwanda air quality',
    'Tanzania pollution data',
    // Major African cities - HIGH PRIORITY
    'Kampala air quality',
    'Nairobi pollution',
    'Lagos air quality',
    'Accra PM2.5',
    'Kigali air monitoring',
    'Dar es Salaam pollution',
    'Jinja air quality',
    'Mombasa pollution',
    'Kisumu air quality',
    'Entebbe air monitoring',
    // Secondary African cities
    'Gulu air quality',
    'Mbarara pollution',
    'Nakuru air quality',
    'Eldoret pollution',
    'Port Harcourt air quality',
    'Abuja pollution',
    'Kano air quality',
    'Ibadan air monitoring',
    'Kumasi air quality',
    'Takoradi pollution',
    // Regional terms
    'East Africa air quality',
    'West Africa pollution',
    'Uganda environmental monitoring',
    'Kenya air sensors',
    'Nigeria pollution data',
    // Core technology terms
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
    // Organizational
    'Makerere University air quality',
    'Google.org Africa',
    'World Bank air quality',
    // Products
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
  alternates: {
    canonical:
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
      'https://airqo.net',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url:
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
      'https://airqo.net',
    siteName: 'AirQo',
    title:
      'AirQo | Air Quality Monitoring Uganda, Kenya, Nigeria - Real-time Data',
    description:
      'AirQo empowers African communities with accurate, hyperlocal, and timely air quality data to drive pollution mitigation actions. Real-time monitoring in Uganda (Kampala), Kenya (Nairobi), Nigeria (Lagos), Ghana (Accra). We deploy low-cost sensors and provide real-time insights where 9 out of 10 people breathe polluted air.',
    images: [
      {
        url: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132435/website/photos/AirQuality_meyioj.webp',
        width: 1200,
        height: 630,
        alt: 'AirQo - Clean Air for Uganda, Kenya, Nigeria, Ghana - African Cities Air Quality',
        type: 'image/webp',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@AirQoProject',
    creator: '@AirQoProject',
    title: 'AirQo | Air Quality Uganda, Kenya, Nigeria - Real-time Monitoring',
    description:
      'Track air quality in Kampala, Nairobi, Lagos, Accra. Real-time PM2.5 data from 200+ monitors across Uganda, Kenya, Nigeria, Ghana. Free mobile app.',
    images: [
      {
        url: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132435/website/photos/AirQuality_meyioj.webp',
        alt: 'AirQo - Air Quality Monitoring Across African Cities',
        width: 1200,
        height: 630,
      },
    ],
  },
  icons: {
    icon: '/web-app-manifest-192x192.png',
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

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const GA_ID = 'G-79ZVCLEDSG';
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
      'AirQo empowers African communities with accurate, hyperlocal, and timely air quality data to drive pollution mitigation actions. Operating in Uganda, Kenya, Nigeria, Ghana, Rwanda, Tanzania with 200+ monitors across 16+ cities including Kampala, Nairobi, Lagos, and Accra.',
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
      {
        '@type': 'Country',
        name: 'Uganda',
      },
      {
        '@type': 'Country',
        name: 'Kenya',
      },
      {
        '@type': 'Country',
        name: 'Nigeria',
      },
      {
        '@type': 'Country',
        name: 'Ghana',
      },
      {
        '@type': 'Country',
        name: 'Rwanda',
      },
      {
        '@type': 'Country',
        name: 'Tanzania',
      },
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
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}explore-data?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <html lang="en" className={interFont.variable}>
      <head>
        {/* Performance optimizations - DNS prefetch and preconnect */}
        <link rel="dns-prefetch" href="//res.cloudinary.com" />
        <link rel="dns-prefetch" href="//www.googletagmanager.com" />
        <link rel="dns-prefetch" href="//translate.google.com" />
        <link rel="dns-prefetch" href="//translate.googleapis.com" />
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

        {/* Preload critical resources */}
        <link
          rel="preload"
          as="image"
          href="https://res.cloudinary.com/dbibjvyhm/image/upload/v1728138368/website/Logos/logo_rus4my.png"
          type="image/png"
        />

        {/* Prefetch for next page navigation */}
        <link rel="prefetch" href="/explore-data" />
        <link rel="prefetch" href="/products/monitor" />

        {/* Structured data */}
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: Static JSON-LD data, not user input */}
        <Script
          id="ld-json"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />

        {/* Google Analytics */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){ dataLayer.push(arguments); }
            gtag('js', new Date());
            gtag('config', '${GA_ID}', {
              page_path: window.location.pathname,
              send_page_view: true
            });
          `}
        </Script>
      </head>
      <body>
        <Suspense fallback={null}>
          <GoogleTranslate />
        </Suspense>
        <ExternalLinkDecorator />
        <ErrorBoundary>
          <ReduxDataProvider>
            <SwrProvider>
              {children}
              <Suspense fallback={null}>
                <EngagementDialog />
              </Suspense>
            </SwrProvider>
          </ReduxDataProvider>
        </ErrorBoundary>
        <CookieConsent />
        <Suspense fallback={null}>
          <FloatingMiniBillboardWrapper />
        </Suspense>
      </body>
    </html>
  );
}

// Centralized viewport export for all pages (accessible - generator removed maximumScale)
export const viewport = generateViewport();
