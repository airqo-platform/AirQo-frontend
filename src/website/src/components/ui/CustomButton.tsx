import React from 'react';

import { cn } from '@/lib/utils';

import { ButtonProps } from './button';

export type CustomButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';

interface CustomButtonProps extends Omit<ButtonProps, 'variant'> {
  /** Visual style of the button. Defaults to `primary`. */
  variant?: CustomButtonVariant;
  className?: string;
  children: React.ReactNode;
}

const variantClasses: Record<CustomButtonVariant, string> = {
  primary: 'bg-brand text-white hover:bg-brand-700 active:bg-brand-800',
  secondary:
    'bg-brand-50 text-brand-700 hover:bg-brand-100 hover:text-brand-800',
  outline:
    'border border-line bg-white text-ink hover:bg-surface-muted hover:text-ink',
  ghost: 'bg-transparent text-ink hover:bg-surface-muted',
};

const CustomButton: React.FC<CustomButtonProps> = ({
  variant = 'primary',
  className,
  children,
  ...props
}) => {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md px-6 py-4 text-sm font-medium transition-colors shadow-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export default CustomButton;
