'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { AppStoreNav } from '@/components/app-store-nav';

const authRoutes = ['/login', '/forgot-password'];

export function AppStoreShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  if (isAuthRoute) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-card">
              <Image
                src="/images/airqo_logo.svg"
                alt="AirQo"
                width={28}
                height={28}
              />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">AirQo</p>
              <p className="text-lg font-semibold text-heading">App Store</p>
            </div>
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
      <main className="mx-auto w-full max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}