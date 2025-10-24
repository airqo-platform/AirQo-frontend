import * as React from 'react';
import { cn } from '@/shared/lib/utils';
import { AqAlertCircle } from '@airqo/icons-react';
import { Button } from './button';

export interface ErrorStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  retryAction?: {
    label: string;
    onClick: () => void;
    variant?: 'filled' | 'outlined' | 'text' | 'ghost';
  };
  className?: string;
  compact?: boolean;
}

const ErrorState = React.forwardRef<HTMLDivElement, ErrorStateProps>(
  (
    {
      title,
      description,
      icon,
      retryAction,
      className,
      compact = false,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center',
          'min-h-[200px] p-6',
          'bg-primary/10 rounded-md',
          'border border-primary/20',
          compact && 'min-h-[120px] p-4',
          className
        )}
        {...props}
      >
        <div className="mb-4 text-destructive">
          {icon || <AqAlertCircle size={compact ? 32 : 48} />}
        </div>
        <h3
          className={cn(
            'text-foreground mb-2 text-center',
            compact ? 'text-base' : 'text-lg'
          )}
        >
          {title}
        </h3>
        {description && (
          <p
            className={cn(
              'text-muted-foreground mb-6 max-w-md text-center',
              compact ? 'text-xs' : 'text-sm'
            )}
          >
            {description}
          </p>
        )}
        {retryAction && (
          <Button
            onClick={retryAction.onClick}
            variant={retryAction.variant || 'outlined'}
            size={compact ? 'sm' : 'md'}
          >
            {retryAction.label}
          </Button>
        )}
      </div>
    );
  }
);

ErrorState.displayName = 'ErrorState';

export { ErrorState };
