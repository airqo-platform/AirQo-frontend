import './globals.css';

import localFont from 'next/font/local';
import Script from 'next/script';
import { ReactNode, Suspense } from 'react';

import EngagementDialog from '@/components/dialogs/EngagementDialog';
import ExternalLinkDecorator from '@/components/ExternalLinkDecorator';
import Loading from '@/components/loading';
import { ErrorBoundary } from '@/components/ui';
import { ReduxDataProvider } from '@/context/ReduxDataProvider';
import { checkMaintenance } from '@/lib/maintenance';

import MaintenancePage from './MaintenancePage';

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
});

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-79ZVCLEDSG';
  const siteUrl = 'https://airqo.net/';
  const title = 'AirQo | Bridging the Air Quality Data Gap in Africa';
  const description =
    'AirQo empowers African communities with accurate, hyperlocal, and timely air quality data to drive pollution mitigation actions. We deploy low-cost sensors and provide real-time insights where 9 out of 10 people breathe polluted air.';

  const keywords = [
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
    'African environmental health',
    'ambient air monitoring',
    'particulate matter',
    'air quality forecasting',
    'urban air pollution',
    'climate change',
    'air quality management',
    'clean air solutions',
    'environmental data',
    'sustainable cities',
    'public health',
    'respiratory health',
    'environmental policy',
    'air quality research',
    'air quality standards',
    'air quality compliance',
    'air pollution control',
    'air quality education',
  ].join(', ');

  const maintenance = await checkMaintenance();

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    url: siteUrl,
    name: 'AirQo',
    alternateName: 'Air Quality and Pollution Monitoring Organization',
    description: description,
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
        {/* Primary SEO */}
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <meta name="author" content="AirQo" />
        <meta name="robots" content="index, follow" />
        <meta name="apple-mobile-web-app-title" content="AirQo" />
        <meta name="theme-color" content="#145DFF" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={siteUrl} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={`${siteUrl}icon.png`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={siteUrl} />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={`${siteUrl}icon.png`} />

        {/* Structured data */}
        <Script
          id="ld-json"
          type="application/ld+json"
          strategy="afterInteractive"
        >
          {JSON.stringify(structuredData)}
        </Script>

        {/* Canonical URL */}
        <link rel="canonical" href={siteUrl} />

        {/* GA snippet must appear in <head> for Search Console verification */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="beforeInteractive"
        />
        <Script id="ga-init" strategy="beforeInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){ dataLayer.push(arguments); }
            gtag('js', new Date());
            gtag('config', '${GA_ID}', {
              page_path: window.location.pathname,
            });
          `}
        </Script>
      </head>
      <body>
        <ExternalLinkDecorator />
        <ErrorBoundary>
          <ReduxDataProvider>
            <Suspense fallback={<Loading />}>
              {maintenance.isActive ? (
                <MaintenancePage message={maintenance.message} />
              ) : (
                <>
                  <EngagementDialog />
                  {children}
                </>
              )}
            </Suspense>
          </ReduxDataProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
