import '@/styles/globals.scss';

import localFont from 'next/font/local';
import { ReactNode } from 'react';

import EngagementDialog from '@/components/dialogs/EngagementDialog';
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

  return (
    <html lang="en" className={interFont.variable}>
      <body>
        <ErrorBoundary>
          <ReduxDataProvider>
            {maintenance.isActive ? (
              <MaintenancePage message={maintenance.message} />
            ) : (
              <>
                <EngagementDialog />
                {children}
              </>
            )}
          </ReduxDataProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
