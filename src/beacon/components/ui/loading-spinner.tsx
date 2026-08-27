import * as React from 'react';
import { cn } from '@/lib/utils';
import { AqLoading02 } from '@airqo/icons-react';

export interface LoadingSpinnerProps {
  size?: number;
  color?: string;
  className?: string;
}

const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ size = 24, color = 'currentColor', className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('inline-flex items-center justify-center text-primary', className)}
        {...props}
      >
        <AqLoading02 size={size} color={color} className="animate-spin" />
      </div>
    );
  }
);

LoadingSpinner.displayName = 'LoadingSpinner';

export { LoadingSpinner };
