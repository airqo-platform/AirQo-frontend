'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Home', requiresAuth: false },
  { href: '/docs/getting-started', label: 'Getting Started', requiresAuth: false },
  { href: '/data-apps', label: 'Browse Data Apps', requiresAuth: true },
  { href: '/my-apps', label: 'My Apps', requiresAuth: true },
  { href: '/publish', label: 'Publish', requiresAuth: true },
];

export function AppStoreNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAuthenticated = !!session;

  return (
    <nav className="flex flex-wrap items-center gap-2 text-sm">
      {navItems
        .filter(item => (item.requiresAuth ? isAuthenticated : true))
        .map(item => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'rounded-full px-4 py-2 text-sm font-medium transition',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-muted'
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
