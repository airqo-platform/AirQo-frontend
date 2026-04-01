import './globals.css';
import Image from 'next/image';
import Link from 'next/link';
import { AppStoreNav } from '@/components/app-store-nav';

export const metadata = {
  title: 'AirQo App Store',
  description: 'Discover and install apps for AirQo Analytics.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-background text-foreground">
          <header className="border-b border-border bg-background/80 backdrop-blur">
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg">
                  <Image
                    src="/images/airqo_logo.svg"
                    alt="AirQo"
                    width={32}
                    height={32}
                  />
                </div>
                <p className="text-lg font-semibold text-heading mb-0">App Store</p>
              </div>
              <Link
                href="/"
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                apps.airqo.net
              </Link>
            </div>
            <div className="mx-auto w-full max-w-6xl px-6 pb-4">
              <AppStoreNav />
            </div>
          </header>
          <main className="mx-auto w-full max-w-6xl px-6 py-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
