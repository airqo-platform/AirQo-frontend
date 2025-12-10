'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export interface NavItemType {
  href: string;
  icon: React.ElementType;
  label: string;
  disabled?: boolean;
  badge?: string | number;
  activeOverride?: boolean;
  endIcon?: React.ElementType;
}

export interface NavItemProps {
  item: NavItemType;
  isCollapsed?: boolean;
  onClick?: (e?: React.MouseEvent) => void;
  className?: string;
}

export const NavItem = React.memo<NavItemProps>(
  ({ item, isCollapsed = false, onClick, className }) => {
    const pathname = usePathname();
    const isActive =
      typeof item.activeOverride === 'boolean'
        ? item.activeOverride
        : pathname === item.href || (item.href !== '/' && pathname.startsWith(`${item.href}/`));
    const Icon = item.icon;

    const baseStyles = cn(
      'relative flex items-center transition-all duration-300 ease-in-out',
      'focus-visible:outline-none'
    );

    const textClass = isActive ? 'text-blue-700' : 'text-foreground';
    const iconColor = isActive ? 'text-blue-700' : 'text-foreground';
    const bgClass = isActive
      ? 'bg-blue-50'
      : 'hover:bg-muted dark:hover:text-foreground';

    // Handle disabled state
    const isDisabled = item.disabled;
    const disabledStyles = isDisabled
      ? 'opacity-50 cursor-not-allowed pointer-events-none'
      : '';

    if (isCollapsed) {
      return (
        <div className="relative flex items-center justify-center">
          <Link
            href={item.href}
            onClick={(e) => onClick && onClick(e)}
            className={cn(
              baseStyles,
              'w-10 h-10 rounded-lg justify-center',
              bgClass,
              disabledStyles,
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
        {isActive && (
          <div className="absolute top-0 bottom-0 flex items-center -left-2">
            <span
              className="w-1 bg-blue-600 rounded-md h-1/2"
              aria-hidden="true"
            />
          </div>
        )}

        <Link
          href={item.href}
          onClick={(e) => onClick && onClick(e)}
          className={cn(
            baseStyles,
            'w-full gap-3 py-2.5 px-3 rounded-lg',
            bgClass,
            disabledStyles,
            className
          )}
          aria-current={isActive ? 'page' : undefined}
        >
          <div className="flex items-center justify-center flex-shrink-0 w-5 h-5">
            <Icon className={cn('w-5 h-5', iconColor)} />
          </div>

          <div className="flex-1 min-w-0">
            <h3
              className={cn('font-normal text-sm truncate', textClass, isActive && 'font-semibold')}
              title={item.label}
            >
              {item.label}
            </h3>
          </div>

          {item.endIcon && (
            <div className={cn("flex items-center justify-center w-5 h-5 ml-auto", iconColor)}>
              <item.endIcon className="w-4 h-4" />
            </div>
          )}

          {item.badge && (
            <span className="flex items-center justify-center h-5 min-w-[20px] px-1.5 text-xs text-white bg-red-500 rounded-full flex-shrink-0 ml-2">
              {item.badge}
            </span>
          )}
        </Link>
      </div>
    );
  }
);

NavItem.displayName = 'NavItem';