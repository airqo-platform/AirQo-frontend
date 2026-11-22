import * as React from 'react';
import { cn } from '../lib/utils';
import { AqAlertCircle } from '@airqo/icons-react';
import { Button } from '../ui/button';

/*
 * Inline "couldn't load this" block with a retry button: the error twin of
 * ../page/empty-state (same box, destructive icon). Copied from
 * nexus/src/shared/components/ui/error-state.tsx. Beacon and Vertex draw these
 * inline, page by page.
 *
 * Change from Nexus's file: Nexus's own Button (filled/outlined/text/ghost,
 * sm/md) is swapped for the shared one, so `retryAction.variant` takes the shadcn
 * names (default "outline") and the full-size button is size "default" instead of "md".
 */
export interface ErrorStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  retryAction?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'ghost' | 'link';
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
            variant={retryAction.variant || 'outline'}
            size={compact ? 'sm' : 'default'}
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
