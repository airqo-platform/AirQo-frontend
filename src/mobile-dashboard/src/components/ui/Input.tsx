import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  hint?: string;
  error?: string;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  multiline?: boolean;
}

const Input = React.forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(
  ({
    className,
    type = 'text',
    label,
    hint,
    error,
    leadingIcon,
    trailingIcon,
    size = 'md',
    multiline = false,
    ...props
  }, ref) => {
    const inputClasses = cn(
      'flex w-full rounded-lg border border-[var(--airqo-border)] bg-[var(--airqo-background)] px-3 py-2 text-sm font-inter text-[var(--airqo-text-primary)] placeholder:text-[var(--airqo-text-placeholder)] focus:outline-none focus:ring-2 focus:ring-[var(--airqo-primary)] focus:border-[var(--airqo-primary)] disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
      {
        'pl-10': leadingIcon,
        'pr-10': trailingIcon,
        'h-8 px-2 text-xs': size === 'sm',
        'h-10 px-3 text-sm': size === 'md',
        'h-12 px-4 text-base': size === 'lg',
      },
      error && 'border-[var(--airqo-error)] focus:ring-[var(--airqo-error)]',
      className
    );

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-[var(--airqo-text-primary)] mb-1 font-inter">
            {label}
          </label>
        )}
        <div className="relative">
          {leadingIcon && !multiline && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {leadingIcon}
            </div>
          )}
          {multiline ? (
            <textarea
              className={inputClasses}
              ref={ref as React.Ref<HTMLTextAreaElement>}
              rows={3}
              {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
            />
          ) : (
            <input
              type={type}
              className={inputClasses}
              ref={ref as React.Ref<HTMLInputElement>}
              {...props}
            />
          )}
          {trailingIcon && !multiline && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {trailingIcon}
            </div>
          )}
        </div>
        {hint && !error && (
          <p className="mt-1 text-xs text-[var(--airqo-text-secondary)] font-inter">{hint}</p>
        )}
        {error && (
          <p className="mt-1 text-xs text-[var(--airqo-error)] font-inter">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };


