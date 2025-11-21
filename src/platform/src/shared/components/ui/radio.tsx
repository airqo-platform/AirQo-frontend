import React from 'react';
import { cn } from '@/shared/lib/utils';

interface RadioProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
  error?: string;
  className?: string;
  labelClassName?: string;
  descriptionClassName?: string;
}

const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  (
    {
      label,
      description,
      error,
      className,
      labelClassName,
      descriptionClassName,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    // Generate stable ID for accessibility
    const radioId = React.useMemo(
      () => id || `radio-${Math.random().toString(36).substring(2, 11)}`,
      [id]
    );

    const descriptionId = description ? `${radioId}-description` : undefined;
    const errorId = error ? `${radioId}-error` : undefined;

    return (
      <div className="flex items-start gap-3">
        <div className="relative flex items-center h-5">
          <input
            ref={ref}
            type="radio"
            id={radioId}
            disabled={disabled}
            aria-describedby={
              [descriptionId, errorId].filter(Boolean).join(' ') || undefined
            }
            className={cn(
              // Base styles - custom radio appearance
              'appearance-none h-4 w-4 shrink-0 cursor-pointer',
              'rounded-full border-2 border-input bg-background transition-all',
              // Hover states
              'hover:border-primary',
              // Checked state - solid fill
              'checked:border-primary checked:bg-primary',
              'checked:hover:border-primary checked:hover:bg-primary',
              // Inner dot using background-image for checked state
              'checked:bg-[radial-gradient(circle,white_0%,white_35%,transparent_40%,transparent_100%)]',
              // Focus visible (keyboard navigation)
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              // Error state
              error &&
                'border-destructive checked:border-destructive checked:bg-destructive',
              // Disabled state
              disabled && 'cursor-not-allowed opacity-50 hover:border-input',
              className
            )}
            {...props}
          />
        </div>

        {/* Label and description container */}
        {(label || description || error) && (
          <div className="flex flex-1 flex-col gap-1 min-w-0">
            {label && (
              <label
                htmlFor={radioId}
                className={cn(
                  'text-sm font-medium leading-none cursor-pointer select-none',
                  'text-foreground',
                  disabled && 'cursor-not-allowed opacity-50',
                  error && 'text-destructive',
                  labelClassName
                )}
              >
                {label}
              </label>
            )}

            {description && (
              <p
                id={descriptionId}
                className={cn(
                  'text-xs leading-relaxed',
                  'text-muted-foreground',
                  disabled && 'opacity-50',
                  descriptionClassName
                )}
              >
                {description}
              </p>
            )}

            {error && (
              <p id={errorId} className="text-xs text-destructive" role="alert">
                {error}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Radio.displayName = 'Radio';

export { Radio };
export default Radio;
