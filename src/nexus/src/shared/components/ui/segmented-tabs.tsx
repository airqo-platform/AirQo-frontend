'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/shared/lib/utils';

export interface SegmentedTabOption<T extends string> {
  value: T;
  label: string;
  disabled?: boolean;
  /** Optional leading icon rendered before the label */
  icon?: React.ReactNode;
}

type SegmentedTabsBaseProps<T extends string> = {
  options: SegmentedTabOption<T>[];
  value: T;
  ariaLabel: string;
  className?: string;
  size?: 'sm' | 'md';
};

/**
 * Either a controlled filter (`onChange`) or a navigation set (`getHref`).
 * When `getHref` is supplied the options render as links with
 * `aria-current="page"` instead of radio buttons, so the same control can be
 * used for section navigation without duplicating the pill styling.
 */
export type SegmentedTabsProps<T extends string> = SegmentedTabsBaseProps<T> &
  (
    | { onChange: (value: T) => void; getHref?: never }
    | { getHref: (value: T) => string; onChange?: never }
  );

/**
 * The app's pill-style segmented control, extracted into a shared component
 * for consistency across tabs/radio toggles (analytics views, rankings
 * filters, picker source tabs, section navigation). Keyboard-accessible via the
 * radiogroup role in filter mode.
 */
export const SegmentedTabs = <T extends string>({
  options,
  value,
  onChange,
  getHref,
  ariaLabel,
  className,
  size = 'sm',
}: SegmentedTabsProps<T>) => {
  const isNavigation = Boolean(getHref);

  return (
    <div
      role={isNavigation ? undefined : 'radiogroup'}
      aria-label={ariaLabel}
      className={cn(
        'flex gap-1 p-0.5 bg-gray-100 dark:bg-gray-800 rounded-lg w-fit',
        className
      )}
    >
      {options.map(option => {
        const isActive = value === option.value;
        return (
          <OptionElement
            key={option.value}
            isActive={isActive}
            isNavigation={isNavigation}
            disabled={option.disabled}
            size={size}
            label={option.label}
            icon={option.icon}
            href={getHref?.(option.value)}
            onSelect={() => onChange?.(option.value)}
          />
        );
      })}
    </div>
  );
};

type OptionElementProps = {
  isActive: boolean;
  isNavigation: boolean;
  disabled?: boolean;
  size: 'sm' | 'md';
  label: string;
  icon?: React.ReactNode;
  href?: string;
  onSelect: () => void;
};

function OptionElement({
  isActive,
  isNavigation,
  disabled,
  size,
  label,
  icon,
  href,
  onSelect,
}: OptionElementProps) {
  // "md" matches the SelectField button height (py-2.5 text-sm)
  const className = cn(
    'font-medium rounded-md transition-all duration-200 whitespace-nowrap',
    size === 'sm' ? 'text-xs py-1.5 px-4' : 'text-sm py-2.5 px-4',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
    isActive
      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300',
    disabled && 'opacity-50 cursor-not-allowed'
  );

  const content = (
    <span className="inline-flex items-center gap-1.5">
      {icon && (
        <span className="inline-flex text-current [&>svg]:h-3.5 [&>svg]:w-3.5">
          {icon}
        </span>
      )}
      {label}
    </span>
  );

  if (isNavigation && href) {
    return (
      <Link
        href={href}
        aria-current={isActive ? 'page' : undefined}
        className={cn(className, 'inline-flex items-center')}
        onClick={disabled ? event => event.preventDefault() : undefined}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      role="radio"
      aria-checked={isActive}
      disabled={disabled}
      onClick={onSelect}
      className={className}
    >
      {content}
    </button>
  );
}

export default SegmentedTabs;
