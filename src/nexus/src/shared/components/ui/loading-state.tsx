import * as React from 'react';
import { cn } from '@/shared/lib/utils';
import { LoadingSpinner } from './loading-spinner';

export interface LoadingStateProps {
  size?: number;
  text?: string;
  className?: string;
}

const LoadingState = React.forwardRef<HTMLDivElement, LoadingStateProps>(
  ({ size = 24, text, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center py-12 px-4 text-center',
          className
        )}
        {...props}
      >
        <LoadingSpinner size={size} className="mb-4" />
        {text && <p className="text-sm text-muted-foreground">{text}</p>}
      </div>
    );
  }
);

LoadingState.displayName = 'LoadingState';

export { LoadingState };
