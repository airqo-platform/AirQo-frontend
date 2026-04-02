'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { useMemo, useState } from 'react';
import { AppStoreSidebar } from '@/components/app-store-sidebar';
import ReusableButton from '@/components/shared/button/ReusableButton';

const authRoutes = ['/login', '/forgot-password'];

export function AppStoreShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));
  const isAuthenticated = !!session;

  const displayName = useMemo(() => {
    if (!session?.user) return 'User';
    const user = session.user as { name?: string; email?: string };
    return user.name || user.email || 'User';
  }, [session?.user]);

  const email = useMemo(() => {
    if (!session?.user) return '';
    const user = session.user as { email?: string };
    return user.email || '';
  }, [session?.user]);

  const initials = useMemo(() => {
    const parts = displayName.split(' ').filter(Boolean);
    if (parts.length === 0) return 'U';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
  }, [displayName]);

  if (isAuthRoute) {
    return <>{children}</>;
  }

  const handleSubmitApp = () => {
    if (isAuthenticated) {
      router.push('/developer');
    } else {
      router.push('/login?callbackUrl=/developer');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg">
              <Image src="/images/airqo_logo.svg" alt="AirQo" width={32} height={32} />
            </div>
            <span className="font-medium text-lg tracking-tight">App Store</span>
          </div>
          <div className="flex items-center gap-3">
            {!isAuthenticated && (
              <Link
                href="/login"
                className="text-sm font-semibold text-primary hover:underline"
              >
                Sign in
              </Link>
            )}
            <ReusableButton
              type="button"
              className="rounded-full px-4 py-2"
              onClick={handleSubmitApp}
            >
              Submit an App
            </ReusableButton>
            {isAuthenticated && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMenuOpen(open => !open)}
                  className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-border bg-card"
                  aria-label="Account menu"
                >
                  {session?.user && 'image' in session.user && session.user.image ? (
                    <Image
                      src={String(session.user.image)}
                      alt={displayName}
                      width={40}
                      height={40}
                    />
                  ) : (
                    <span className="text-xs font-semibold text-primary">{initials}</span>
                  )}
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-60 rounded-xl border border-border bg-card p-2 shadow-lg">
                    <div className="flex items-center gap-3 px-2 py-2">
                      <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-border bg-card">
                        {session?.user && 'image' in session.user && session.user.image ? (
                          <Image
                            src={String(session.user.image)}
                            alt={displayName}
                            width={40}
                            height={40}
                          />
                        ) : (
                          <span className="text-xs font-semibold text-primary">{initials}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {displayName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {email}
                        </p>
                      </div>
                    </div>
                    <div className="mt-1 border-t border-border" />
                    <ReusableButton
                      type="button"
                      variant="text"
                      className="w-full justify-start px-2 py-2"
                      onClick={() => signOut({ callbackUrl: '/' })}
                    >
                      Log out
                    </ReusableButton>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>
      <div className="mx-auto flex w-full max-w-6xl gap-6 px-6 py-8">
        <AppStoreSidebar />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}