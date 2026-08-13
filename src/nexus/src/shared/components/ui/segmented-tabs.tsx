'use client';

import React from 'react';
import { cn } from '@/shared/lib/utils';

export interface SegmentedTabOption<T extends string> {
  value: T;
  label: string;
  disabled?: boolean;
  /** Optional leading icon rendered before the label */
  icon?: React.ReactNode;
}

interface SegmentedTabsProps<T extends string> {
  options: SegmentedTabOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
  className?: string;
  size?: 'sm' | 'md';
}

/**
 * The app's pill-style segmented control, extracted into a shared component
 * for consistency across tabs/radio toggles (analytics views, rankings
 * filters, picker source tabs). Keyboard-accessible via the radiogroup role.
 */
export const SegmentedTabs = <T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  className,
  size = 'sm',
}: SegmentedTabsProps<T>) => {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn(
        'flex gap-1 p-0.5 bg-gray-100 dark:bg-gray-800 rounded-lg w-fit',
        className
      )}
    >
      {options.map(option => {
        const isActive = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            disabled={option.disabled}
            onClick={() => onChange(option.value)}
            className={cn(
              'font-medium rounded-md transition-all duration-200 whitespace-nowrap',
              // "md" matches the SelectField button height (py-2.5 text-sm)
              size === 'sm' ? 'text-xs py-1.5 px-4' : 'text-sm py-2.5 px-4',
              isActive
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300',
              option.disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            <span className="inline-flex items-center gap-1.5">
              {option.icon && (
                <span className="inline-flex text-current [&>svg]:h-3.5 [&>svg]:w-3.5">
                  {option.icon}
                </span>
              )}
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default SegmentedTabs;
