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
    'AirQo is transforming air quality management in Africa by providing low-cost sensors, real-time data, and actionable insights to help communities and organizations improve air quality.';

  const keywords = [
    'AirQo',
    'air quality monitoring',
    'air pollution',
    'PM1',
    'PM2.5',
    'PM10',
    'NO2',
    'SO2',
    'CO',
    'O3',
    'air quality index',
    'AQI',
    'real-time air quality data',
    'low-cost air sensors',
    'urban air pollution',
    'environmental monitoring',
    'climate change',
    'air quality management',
    'clean air solutions',
    'air quality in Africa',
    'environmental health',
    'ambient air monitoring',
    'particulate matter',
    'air quality forecasting',
    'air quality analytics',
    'pollution mitigation',
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
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              "url": "${siteUrl}",
              "name": "${title}",
              "description": "${description}",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "${siteUrl}search?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            }
          `}
        </script>

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
