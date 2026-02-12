import './globals.css';
import type { Metadata } from 'next';
import Script from 'next/script';
import { Inter } from 'next/font/google';
import { ReduxProvider } from '@/shared/providers/redux-provider';
import { AuthProvider } from '@/shared/providers/auth-provider';
import { PostHogProvider } from '@/shared/providers/posthog-provider';
import { GoogleAnalyticsProvider } from '@/shared/providers/google-analytics-provider';
import { Toaster } from '@/shared/components/ui';
import { ThemeProvider } from '@/modules/themes';
import { getThemeScript } from '@/modules/themes/utils/themeUtils';
import baseMetadata from '@/shared/lib/metadata';
import ErrorBoundary from '@/shared/components/ErrorBoundary';

// Google Analytics Measurement ID (from environment variable)
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = baseMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script
          id="theme-script"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: getThemeScript() }}
        />
        {GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}');
              `}
            </Script>
          </>
        )}
      </head>
      <body className={`antialiased ${inter.className}`}>
        <ReduxProvider>
          <ErrorBoundary>
            <AuthProvider>
              <GoogleAnalyticsProvider>
                <PostHogProvider>
                  <ThemeProvider>{children}</ThemeProvider>
                </PostHogProvider>
              </GoogleAnalyticsProvider>
            </AuthProvider>
          </ErrorBoundary>
        </ReduxProvider>
        <Toaster />
      </body>
    </html>
  );
}
