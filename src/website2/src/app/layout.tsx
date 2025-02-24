import './globals.css';

import dynamic from 'next/dynamic';
import localFont from 'next/font/local';
import { ReactNode, Suspense } from 'react';

import EngagementDialog from '@/components/dialogs/EngagementDialog';
import Loading from '@/components/loading';
import { ErrorBoundary } from '@/components/ui';
import { ReduxDataProvider } from '@/context/ReduxDataProvider';
import { checkMaintenance } from '@/lib/maintenance';

import MaintenancePage from './MaintenancePage';

// Load the GA component dynamically, disabling SSR so that it runs only on the client.
const GoogleAnalytics = dynamic(() => import('@/components/GoogleAnalytics'), {
  ssr: false,
});

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
  const maintenance = await checkMaintenance();
  const GA_MEASUREMENT_ID =
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-79ZVCLEDSG';

  return (
    <html lang="en" className={interFont.variable}>
      <body>
        <ErrorBoundary>
          <ReduxDataProvider>
            <Suspense fallback={<Loading />}>
              {/* Initialize & Track Google Analytics only on the client */}
              <GoogleAnalytics measurementId={GA_MEASUREMENT_ID} />

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
