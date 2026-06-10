import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none font-inter',
          {
            'bg-[var(--airqo-primary)] text-white hover:bg-[var(--airqo-primary-dark)] focus-visible:ring-[var(--airqo-primary)] shadow-sm': variant === 'default',
            'border border-[var(--airqo-border)] bg-[var(--airqo-background)] text-[var(--airqo-text-primary)] hover:bg-[var(--airqo-background-light)] focus-visible:ring-[var(--airqo-primary)]': variant === 'outline',
            'text-[var(--airqo-text-primary)] hover:bg-[var(--airqo-background-light)] focus-visible:ring-[var(--airqo-primary)]': variant === 'ghost',
            'bg-[var(--airqo-error)] text-white hover:bg-red-600 focus-visible:ring-[var(--airqo-error)] shadow-sm': variant === 'destructive',
            'bg-[var(--airqo-background)] text-[var(--airqo-text-primary)] border border-[var(--airqo-border)] hover:bg-[var(--airqo-background-light)] focus-visible:ring-[var(--airqo-primary)]': variant === 'secondary',
          },
          {
            'h-8 px-3 text-sm font-medium': size === 'sm',
            'h-10 px-4 py-3 text-sm font-medium': size === 'md',
            'h-12 px-6 py-4 text-base font-medium': size === 'lg',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };


