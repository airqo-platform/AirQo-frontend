import * as React from 'react';
import { cn } from '../lib/utils';
import { AqSearchRefraction } from '@airqo/icons-react';

/*
 * Copied from nexus/src/shared/components/ui/empty-state.tsx. Vertex's
 * components/ui/empty-state.tsx has the same parts in a plain bordered card;
 * Beacon draws its empty states inline. Nexus's `action` took an object rendered
 * with Nexus's own Button; it is now any node, e.g. a Button from ../ui.
 */
export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
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
        {action}
      </div>
    );
  }
);

EmptyState.displayName = 'EmptyState';

export { EmptyState };
