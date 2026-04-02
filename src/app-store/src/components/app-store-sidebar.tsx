'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useSession } from 'next-auth/react';

const navItems = [
  { href: '/', label: 'Home', requiresAuth: false },
  { href: '/docs/getting-started', label: 'Getting Started', requiresAuth: false },
  { href: '/data-apps', label: 'Browse Data Apps', requiresAuth: true },
  { href: '/publish', label: 'Publish', requiresAuth: true },
  { href: '/my-apps', label: 'My Apps', requiresAuth: true },
];

export function AppStoreSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAuthenticated = !!session;

  return (
    <aside className="w-64 shrink-0 rounded-2xl border border-border bg-card p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Navigation
      </p>
      <nav className="mt-4 flex flex-col gap-1">
        {navItems
          .filter(item => (item.requiresAuth ? isAuthenticated : true))
          .map(item => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'rounded-xl px-3 py-2 text-sm font-medium transition',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-muted'
                )}
              >
                {item.label}
              </Link>
            );
          })}
      </nav>
    </aside>
  );
}
