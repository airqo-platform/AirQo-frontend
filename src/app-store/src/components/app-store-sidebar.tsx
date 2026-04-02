'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Browse', requiresAuth: false },
  { href: '/my-apps', label: 'My Apps', requiresAuth: true },
  { href: '/developer', label: 'Developer', requiresAuth: true },
  { href: '/usage', label: 'Usage', requiresAuth: true },
];

export function AppStoreSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAuthenticated = !!session;
  const privilege =
    session?.user && 'privilege' in session.user ? session.user.privilege : undefined;
  const email =
    session?.user && 'email' in session.user ? session.user.email : undefined;
  const isAirqoEmail =
    typeof email === 'string' && email.toLowerCase().endsWith('@airqo.net');
  const showAdmin =
    isAirqoEmail && (privilege === 'SUPER_ADMIN' || privilege === 'SYSTEM_ADMIN');

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
