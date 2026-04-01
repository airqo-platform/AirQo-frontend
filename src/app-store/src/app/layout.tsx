import './globals.css';
import { getServerSession } from 'next-auth/next';
import { options } from '@/app/api/auth/[...nextauth]/options';
import ClientLayout from './client-layout';
import { AppStoreShell } from './app-store-shell';

export const metadata = {
  title: 'AirQo App Store',
  description: 'Discover and install apps for AirQo Analytics.',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(options);

  return (
    <html lang="en">
      <ClientLayout session={session}>
        <AppStoreShell>{children}</AppStoreShell>
      </ClientLayout>
    </html>
  );
}