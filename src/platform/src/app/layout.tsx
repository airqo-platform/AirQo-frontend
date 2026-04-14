import './globals.css';
import type { Metadata } from 'next';
import Script from 'next/script';
import { Inter } from 'next/font/google';
import NextTopLoader from 'nextjs-toploader';
import { ReduxProvider } from '@/shared/providers/redux-provider';
import { AuthProvider } from '@/shared/providers/auth-provider';
import { PostHogProvider } from '@/shared/providers/posthog-provider';
import { GoogleAnalyticsProvider } from '@/shared/providers/google-analytics-provider';
import { Toaster } from '@/shared/components/ui';
import { ThemeProvider } from '@/modules/themes';
import { getThemeScript } from '@/modules/themes/utils/themeUtils';
import baseMetadata from '@/shared/lib/metadata';
import ErrorBoundary from '@/shared/components/ErrorBoundary';
import AppNetworkGate from '@/shared/components/AppNetworkGate';

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
      </head>
      <body className={`antialiased ${inter.className}`}>
        <NextTopLoader
          color="rgb(var(--primary))"
          height={3}
          showSpinner={false}
          crawl={true}
          crawlSpeed={220}
          speed={260}
          easing="ease"
          initialPosition={0.08}
          shadow="0 0 8px rgb(var(--primary) / 0.6)"
          zIndex={10000}
        />
        <ReduxProvider>
          <ErrorBoundary>
            <AuthProvider>
              <GoogleAnalyticsProvider>
                <PostHogProvider>
                  <AppNetworkGate>
                    <ThemeProvider>
                      {children}
                      <Toaster />
                    </ThemeProvider>
                  </AppNetworkGate>
                </PostHogProvider>
              </GoogleAnalyticsProvider>
            </AuthProvider>
          </ErrorBoundary>
        </ReduxProvider>
      </body>
    </html>
  );
}
