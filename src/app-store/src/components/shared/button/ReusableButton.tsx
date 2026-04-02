'use client';

import React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';

interface ReusableButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'filled' | 'outlined' | 'text';
  loading?: boolean;
  asChild?: boolean;
}

const ReusableButton = React.forwardRef<HTMLButtonElement, ReusableButtonProps>(
  ({ variant = 'filled', className, disabled, loading, children, asChild, ...rest }, ref) => {
    const variantMap = {
      filled: 'bg-primary text-primary-foreground hover:bg-primary/90',
      outlined: 'border border-primary text-primary hover:bg-primary/10',
      text: 'text-primary hover:bg-primary/10',
    };
    const Component = asChild ? Slot : 'button';

    return (
      <Component
        ref={ref}
        className={cn(
          'flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition',
          variantMap[variant],
          (disabled || loading) && 'opacity-60 cursor-not-allowed',
          className
        )}
        disabled={disabled || loading}
        {...rest}
      >
        {children}
      </Component>
    );
  }
);

ReusableButton.displayName = 'ReusableButton';

export default ReusableButton;
