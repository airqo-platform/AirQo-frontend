'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { hasRole } from '@/lib/mock-auth';

const navItems = [
  { href: '/', label: 'Browse' },
  { href: '/my-apps', label: 'My Apps' },
  { href: '/developer', label: 'Developer' },
];

export function AppStoreNav() {
  const pathname = usePathname();
  const showAdmin = hasRole('SUPER_ADMIN');

  return (
    <nav className="flex flex-wrap items-center gap-2 text-sm">
      {navItems.map(item => {
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