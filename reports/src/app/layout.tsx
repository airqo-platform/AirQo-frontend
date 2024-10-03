import '../styles/globals.scss';

import { Inter } from 'next/font/google';

import AppProvider from './AppProvider';

import type { Metadata } from 'next';

import NetworkStatus from '@/app/NetworkStatus';
import { Toaster } from '@/components/ui/sonner';

// Set up the Inter font
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AirQo | Reporting',
  description: 'AirQo AQ Reporting',
};

// Define the RootLayout component
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} dark:bg-[#1a202c]`}
        suppressHydrationWarning={true}
      >
        <NetworkStatus>
          <AppProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </AppProvider>
        </NetworkStatus>
        <Toaster />
      </body>
    </html>
  );
}
