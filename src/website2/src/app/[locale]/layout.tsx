import '../globals.css';

import localFont from 'next/font/local';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { ReactNode, Suspense } from 'react';

import EngagementDialog from '@/components/dialogs/EngagementDialog';
import Loading from '@/components/loading';
import { ErrorBoundary } from '@/components/ui';
import { ReduxDataProvider } from '@/context/ReduxDataProvider';
import { checkMaintenance } from '@/lib/maintenance';

import MaintenancePage from './MaintenancePage';

const interFont = localFont({
  src: [
    {
      path: '../../../public/fonts/Inter-VariableFont_opsz,wght.ttf',
      style: 'normal',
      weight: '100 900',
    },
    {
      path: '../../../public/fonts/Inter-Italic-VariableFont_opsz,wght.ttf',
      style: 'italic',
      weight: '100 900',
    },
  ],
  variable: '--font-inter',
});

type Props = {
  children: ReactNode;
  params: { locale: string };
};

export default async function RootLayout({
  children,
  params: { locale },
}: Props) {
  const maintenance = await checkMaintenance();
  const messages = await getMessages();

  return (
    <html lang={locale} className={interFont.variable}>
      <body>
        <ErrorBoundary>
          <ReduxDataProvider>
            <Suspense fallback={<Loading />}>
              {maintenance.isActive ? (
                <MaintenancePage message={maintenance.message} />
              ) : (
                <>
                  <NextIntlClientProvider messages={messages}>
                    <EngagementDialog />
                    {children}
                  </NextIntlClientProvider>
                </>
              )}
            </Suspense>
          </ReduxDataProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
