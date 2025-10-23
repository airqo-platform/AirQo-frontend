import './globals.css';
import type { Metadata } from 'next';
import { ReduxProvider } from '@/shared/providers/redux-provider';
import { AuthProvider } from '@/shared/providers/auth-provider';
import { Toaster } from '@/shared/components/ui';
import { ThemeProvider } from '@/modules/themes';
import { injectThemeScript } from '@/modules/themes/utils/themeUtils';
import baseMetadata from '@/shared/lib/metadata';
import { MobileSidebar } from '@/shared/components/ui/mobile-sidebar';

export const metadata: Metadata = baseMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Inject theme script for immediate theme application
  if (typeof window !== 'undefined') {
    injectThemeScript();
  }

  return (
    <html lang="en">
      <body className="antialiased">
        <ReduxProvider>
          <AuthProvider>
            <ThemeProvider>
              {children}
              <MobileSidebar />
            </ThemeProvider>
          </AuthProvider>
        </ReduxProvider>
        <Toaster />
      </body>
    </html>
  );
}
