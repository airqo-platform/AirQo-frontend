'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { AppStoreSidebar } from '@/components/app-store-sidebar';

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
            <div className="flex h-9 w-9 items-center justify-center rounded-lg">
              <Image src="/images/airqo_logo.svg" alt="AirQo" width={32} height={32} />
            </div>
            <p className="text-lg font-semibold text-heading mb-0">App Store</p>
          </div>
          <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            apps.airqo.net
          </Link>
        </div>
      </header>
      <div className="mx-auto flex w-full max-w-6xl gap-6 px-6 py-8">
        <AppStoreSidebar />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}