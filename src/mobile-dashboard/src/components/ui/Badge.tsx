import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'success' | 'error' | 'warning';
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
          {
            'bg-gray-100 text-gray-800': variant === 'default',
            'bg-gray-200 text-gray-700': variant === 'secondary',
            'bg-green-100 text-green-800': variant === 'success',
            'bg-red-100 text-red-800': variant === 'error',
            'bg-yellow-100 text-yellow-800': variant === 'warning',
          },
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = 'Badge';

export { Badge };


