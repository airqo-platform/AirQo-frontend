import './globals.css';

import localFont from 'next/font/local';
import { ReactNode, Suspense } from 'react';

import EngagementDialog from '@/components/dialogs/EngagementDialog';
import { GoogleAnalytics } from '@/components/GoogleAnalytics';
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
  const maintenance = await checkMaintenance();
  const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '';

  return (
    <html lang="en" className={interFont.variable}>
      <head>
        {GA_MEASUREMENT_ID && (
          <GoogleAnalytics measurementId={GA_MEASUREMENT_ID} />
        )}
      </head>
      <body>
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
