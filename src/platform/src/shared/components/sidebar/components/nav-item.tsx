'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/shared/lib/utils';
import { NavItemProps } from '../types';

export const NavItem = React.memo<NavItemProps>(
  ({ item, isCollapsed = false, onClick, className }) => {
    const pathname = usePathname();
    const isActive =
      pathname === item.href || pathname.startsWith(`${item.href}/`);
    const Icon = item.icon;

    const baseStyles = cn(
      'relative flex items-center transition-all duration-300 ease-in-out',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'
    );

    const textClass = isActive ? 'text-primary' : 'text-muted-foreground';
    const iconColor = isActive ? 'text-primary' : 'text-muted-foreground';
    const bgClass = isActive
      ? 'bg-primary/10'
      : 'hover:bg-muted dark:hover:text-foreground';

    if (isCollapsed) {
      return (
        <div className="relative flex items-center justify-center">
          <Link
            href={item.href}
            onClick={onClick}
            className={cn(
              baseStyles,
              'w-10 h-10 rounded-lg justify-center',
              bgClass,
              className
            )}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon className={cn('flex-shrink-0 w-5 h-5', iconColor)} />
            <span className="sr-only">{item.label}</span>
          </Link>
        </div>
      );
    }

    return (
      <div className="relative">
        {/* Active indicator - positioned outside the link container */}
        {isActive && (
          <div className="absolute top-0 bottom-0 flex items-center -left-2">
            <span
              className="w-1 bg-primary rounded-md h-1/2"
              aria-hidden="true"
            />
          </div>
        )}

        {/* Navigation Link */}
        <Link
          href={item.href}
          onClick={onClick}
          className={cn(
            baseStyles,
            'w-full gap-3 py-2.5 px-3 rounded-lg',
            bgClass,
            className
          )}
          aria-current={isActive ? 'page' : undefined}
        >
          {/* Icon */}
          <div className="flex items-center justify-center flex-shrink-0 w-5 h-5">
            <Icon className={cn('w-5 h-5', iconColor)} />
          </div>

          {/* Label */}
          <div className="flex-1 min-w-0">
            <h3
              className={cn('font-normal text-sm truncate', textClass)}
              title={item.label}
            >
              {item.label}
            </h3>
          </div>

          {/* Badge */}
          {item.badge && (
            <span
              className="flex items-center justify-center h-5 min-w-[20px] px-1.5 text-xs font-semibold text-white bg-red-500 rounded-full flex-shrink-0"
              aria-label={`${item.badge} notifications`}
            >
              {item.badge}
            </span>
          )}
        </Link>
      </div>
    );
  }
);

NavItem.displayName = 'NavItem';
