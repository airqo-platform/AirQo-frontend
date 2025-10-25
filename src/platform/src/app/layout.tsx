import './globals.css';
import type { Metadata } from 'next';
import Script from 'next/script';
import { Inter } from 'next/font/google';
import { ReduxProvider } from '@/shared/providers/redux-provider';
import { AuthProvider } from '@/shared/providers/auth-provider';
import { Toaster } from '@/shared/components/ui';
import { ThemeProvider } from '@/modules/themes';
import { getThemeScript } from '@/modules/themes/utils/themeUtils';
import baseMetadata from '@/shared/lib/metadata';
import { MobileSidebar } from '@/shared/components/ui/mobile-sidebar';
import ErrorBoundary from '@/shared/components/ErrorBoundary';

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
        <ReduxProvider>
          <ErrorBoundary>
            <AuthProvider>
              <ThemeProvider>
                {children}
                <MobileSidebar />
              </ThemeProvider>
            </AuthProvider>
          </ErrorBoundary>
        </ReduxProvider>
        <Toaster />
      </body>
    </html>
  );
}
