import * as React from 'react';
import { cn } from '@/shared/lib/utils';
import { AqSearchRefraction } from '@airqo/icons-react';
import { Button } from './button';

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'filled' | 'outlined' | 'text' | 'ghost';
  };
  className?: string;
  compact?: boolean;
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    { title, description, icon, action, className, compact = false, ...props },
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
        <div className="mb-4 text-primary/70">
          {icon || <AqSearchRefraction size={compact ? 32 : 48} />}
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
        {action && (
          <Button
            onClick={action.onClick}
            variant={action.variant || 'outlined'}
            size={compact ? 'sm' : 'md'}
          >
            {action.label}
          </Button>
        )}
      </div>
    );
  }
);

EmptyState.displayName = 'EmptyState';

export { EmptyState };
