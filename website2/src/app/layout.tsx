// /app/layout.tsx

import '@/styles/globals.scss';

import localFont from 'next/font/local';
import { ReactNode } from 'react';

import EngagementDialog from '@/components/dialogs/EngagementDialog';
import { ErrorBoundary } from '@/components/ui';
import { ReduxDataProvider } from '@/context/ReduxDataProvider';
import { getMaintenances } from '@/services/externalService';

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

// Define a TypeScript interface for maintenance data used within the layout
interface MaintenanceStatus {
  isActive: boolean;
  message: string;
}

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  let maintenance: MaintenanceStatus = { isActive: false, message: '' };

  try {
    const response = await getMaintenances();

    if (response?.success && response.maintenance?.length > 0) {
      const activeMaintenance: any = response.maintenance[0];
      maintenance = {
        isActive: activeMaintenance.isActive,
        message: activeMaintenance.message,
      };
    }
  } catch (error) {
    console.error('Failed to fetch maintenance status:', error);
    maintenance = { isActive: false, message: '' };
  }

  return (
    <html lang="en">
      <body className={`${interFont.variable} antialiased`}>
        {maintenance.isActive ? (
          <MaintenancePage message={maintenance.message} />
        ) : (
          <ReduxDataProvider>
            <ErrorBoundary>{children}</ErrorBoundary>
            <EngagementDialog />
          </ReduxDataProvider>
        )}
      </body>
    </html>
  );
}
