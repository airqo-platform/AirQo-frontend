'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Browse', requiresAuth: false },
  { href: '/my-apps', label: 'My Apps', requiresAuth: true },
  { href: '/developer', label: 'Developer', requiresAuth: true },
];

export function AppStoreNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const privilege =
    session?.user && 'privilege' in session.user ? session.user.privilege : undefined;
  const showAdmin = privilege === 'SUPER_ADMIN' || privilege === 'SYSTEM_ADMIN';
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
      {showAdmin && (
        <Link
          href="/admin/review"
          className={cn(
            'rounded-full px-4 py-2 text-sm font-medium transition',
            pathname === '/admin/review'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-muted'
          )}
        >
          Admin Review
        </Link>
      )}
    </nav>
  );
}
