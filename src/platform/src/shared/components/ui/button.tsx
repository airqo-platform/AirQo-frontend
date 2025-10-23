'use client';

import React from 'react';
import clsx from 'clsx';
import { useMediaQuery } from 'react-responsive';
import { AqLoading02 } from '@airqo/icons-react';
import { useRouter } from 'next/navigation';

interface ButtonProps {
  variant?: 'filled' | 'outlined' | 'text' | 'ghost' | 'disabled';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  paddingStyles?: string;
  className?: string;
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  type?: 'button' | 'submit' | 'reset';
  dataTestId?: string;
  Icon?: React.ComponentType<{ className?: string }>;
  iconPosition?: 'start' | 'end';
  children?: React.ReactNode;
  showTextOnMobile?: boolean;
  path?: string;
  // Additional button props
  id?: string;
  style?: React.CSSProperties;
  tabIndex?: number;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'filled',
      size = 'md',
      fullWidth = false,
      loading = false,
      paddingStyles,
      className,
      disabled = false,
      onClick,
      type = 'button',
      dataTestId,
      Icon,
      iconPosition = 'start',
      children,
      showTextOnMobile = false,
      path,
      ...rest
    },
    ref
  ) => {
    const isMobile = useMediaQuery({ maxWidth: 640 });
    const router = useRouter();

    const isDisabled = disabled || loading || variant === 'disabled';

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (isDisabled) {
        e.preventDefault();
        return;
      }
      onClick?.(e);

      try {
        if (path && !e.defaultPrevented) {
          router.push(path);
        }
      } catch (err) {
        console.warn('Button navigation failed', err);
      }
    };

    // Size -> padding and font-size
    const sizeMap: Record<string, string> = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    const paddingClass = paddingStyles || sizeMap[size] || sizeMap.md;

    // Variant classes using consistent Tailwind classes with bg-primary
    const variantClasses = (() => {
      switch (variant) {
        case 'outlined':
          return clsx(
            'border border-primary text-primary bg-transparent',
            'hover:bg-primary hover:text-white',
            'focus:ring-primary focus:border-primary',
            'disabled:border-gray-300 disabled:text-gray-400 disabled:bg-transparent disabled:hover:bg-transparent'
          );
        case 'text':
          return clsx(
            'text-primary bg-transparent border-transparent',
            'hover:bg-primary/10 hover:text-primary',
            'focus:ring-primary',
            'disabled:text-gray-400 disabled:bg-transparent disabled:hover:bg-transparent'
          );
        case 'ghost':
          return clsx(
            'bg-transparent text-primary border-transparent',
            'hover:bg-primary/5',
            'focus:ring-primary',
            'disabled:text-gray-400 disabled:hover:bg-transparent'
          );
        case 'disabled':
          return 'bg-gray-300 text-gray-500 cursor-not-allowed border-gray-300 opacity-50';
        default: // filled
          return clsx(
            'bg-primary text-white border-primary',
            'hover:bg-primary/90',
            'focus:ring-primary',
            'disabled:bg-gray-300 disabled:text-gray-500 disabled:border-gray-300 disabled:hover:bg-gray-300'
          );
      }
    })();

    const baseClasses = clsx(
      // Base button styles
      'inline-flex items-center justify-center rounded-md font-medium transition-all duration-200',
      // Focus styles
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      // Size and spacing
      paddingClass,
      // Variant-specific styles
      variantClasses,
      // Width
      fullWidth && 'w-full',
      // Disabled state
      isDisabled && 'pointer-events-none',
      // Custom className
      className
    );

    const renderIcon = () => {
      if (loading) {
        return (
          <span
            className={clsx(
              'flex items-center justify-center',
              children && iconPosition === 'start' && 'mr-2',
              children && iconPosition === 'end' && 'ml-2'
            )}
          >
            <AqLoading02 className="w-4 h-4 text-current animate-spin" />
          </span>
        );
      }

      if (Icon) {
        return (
          <span
            className={clsx(
              'flex-shrink-0',
              children && iconPosition === 'start' && 'mr-2',
              children && iconPosition === 'end' && 'ml-2'
            )}
          >
            <Icon className="w-4 h-4" />
          </span>
        );
      }

      return null;
    };

    const renderText = () => {
      if (!children) return null;

      return (
        <span
          className={clsx(
            isMobile && !showTextOnMobile && (Icon || loading) && 'sr-only'
          )}
        >
          {children}
        </span>
      );
    };

    return (
      <button
        ref={ref}
        type={type}
        className={baseClasses}
        aria-disabled={isDisabled}
        disabled={isDisabled}
        onClick={handleClick}
        data-testid={dataTestId}
        {...rest}
      >
        {iconPosition === 'start' && renderIcon()}
        {renderText()}
        {iconPosition === 'end' && renderIcon()}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
