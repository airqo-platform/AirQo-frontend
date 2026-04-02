'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useSession } from 'next-auth/react';
import { useUserAccess } from '@/core/hooks/useUserAccess';

const navItems = [
  { href: '/', label: 'Browse', requiresAuth: false },
  { href: '/my-apps', label: 'My Apps', requiresAuth: true },
  { href: '/developer', label: 'Developer', requiresAuth: true },
  { href: '/usage', label: 'Usage', requiresAuth: true },
];

export function AppStoreSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { isAdmin } = useUserAccess();
  const isAuthenticated = !!session;
  const showAdmin = isAdmin;

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
        {showAdmin && (
          <Link
            href="/admin/review"
            className={cn(
              'rounded-xl px-3 py-2 text-sm font-medium transition',
              pathname === '/admin/review'
                ? 'bg-primary text-primary-foreground'
                : 'text-foreground hover:bg-muted'
            )}
          >
            Admin Review
          </Link>
        )}
      </nav>
    </aside>
  );
}
