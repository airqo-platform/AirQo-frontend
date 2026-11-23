'use client';

import React from 'react';
import clsx from 'clsx';
import { AqLoading02 } from '@airqo/icons-react';
import { useRouter } from 'next/navigation';

/*
 * Button from the custom kit Vertex and Nexus share.
 *
 * Copied from nexus/src/shared/components/ui/button.tsx (about 124 Nexus files).
 * Vertex's components/shared/button/ReusableButton.tsx (about 60 files) is the same
 * component from the same original: filled/outlined/text/disabled variants,
 * `Icon`, `showTextOnMobile`, `loading`, `path`, `dataTestId`.
 *
 * Nexus's version is the base: theme tokens for the disabled states, `ghost` and
 * `danger` variants, sizes, a spinner while loading, `iconPosition`. Changes:
 * - Nexus hid the label on phones with react-responsive's useMediaQuery. That is
 *   now the `max-sm:sr-only` class: same 640px cut-off, no extra package, no
 *   flash on hydration.
 * - Props take every native button attribute (Vertex passes data-* and aria-*).
 * - From Vertex: `padding` (its name for `paddingStyles`), `iconClassName`, and
 *   `renderDisabled`, which replaces Vertex's `permission` prop. Vertex wrapped a
 *   disabled button in its own PermissionTooltip; pass that wrapper here.
 *
 * Drift: Vertex renders `path` as a real <a href>; Nexus (kept) calls
 * router.push on click. Vertex greys the button out while loading; Nexus shows a
 * spinner. Vertex's default padding has no `text-sm`.
 */
export type ButtonVariant =
  | 'filled'
  | 'outlined'
  | 'text'
  | 'ghost'
  | 'disabled'
  | 'danger';

type NativeButtonProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'type' | 'onClick' | 'disabled' | 'className' | 'children'
>;

export interface ButtonProps extends NativeButtonProps {
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  paddingStyles?: string;
  /** Vertex's name for `paddingStyles`. */
  padding?: string;
  className?: string;
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  type?: 'button' | 'submit' | 'reset';
  dataTestId?: string;
  Icon?: React.ComponentType<{ className?: string }>;
  iconClassName?: string;
  iconPosition?: 'start' | 'end';
  children?: React.ReactNode;
  showTextOnMobile?: boolean;
  path?: string;
  /** Wraps the button while it is disabled, e.g. in a "you need permission X" tooltip. */
  renderDisabled?: (button: React.ReactElement) => React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'filled',
      size = 'md',
      fullWidth = false,
      loading = false,
      paddingStyles,
      padding,
      className,
      disabled = false,
      onClick,
      type = 'button',
      dataTestId,
      Icon,
      iconClassName,
      iconPosition = 'start',
      children,
      showTextOnMobile = false,
      path,
      renderDisabled,
      ...rest
    },
    ref
  ) => {
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

    const paddingClass =
      paddingStyles || padding || sizeMap[size] || sizeMap.md;

    // Variant classes using consistent Tailwind classes with bg-primary
    const variantClasses = (() => {
      switch (variant) {
        case 'outlined':
          return clsx(
            'border border-primary text-primary bg-transparent',
            'hover:bg-primary hover:text-white',
            'focus:ring-primary focus:border-primary',
            'disabled:border-muted disabled:text-muted-foreground disabled:bg-transparent disabled:hover:bg-transparent'
          );
        case 'text':
          return clsx(
            'text-primary bg-transparent border-transparent',
            'hover:bg-primary/10 hover:text-primary',
            'focus:ring-primary',
            'disabled:text-muted-foreground disabled:bg-transparent disabled:hover:bg-transparent'
          );
        case 'ghost':
          return clsx(
            'bg-transparent text-primary border-transparent',
            'hover:bg-primary/5',
            'focus:ring-primary',
            'disabled:text-muted-foreground disabled:hover:bg-transparent'
          );
        case 'disabled':
          return 'bg-muted text-muted-foreground cursor-not-allowed border-muted opacity-50';
        case 'danger':
          return clsx(
            'border border-red-200 text-red-600 bg-transparent',
            'hover:bg-red-50 hover:text-red-700 hover:border-red-300',
            'focus:ring-red-500 focus:border-red-500',
            'disabled:border-red-100 disabled:text-red-300 disabled:bg-transparent disabled:hover:bg-transparent'
          );
        default: // filled
          return clsx(
            'bg-primary text-white border-primary',
            'hover:bg-primary/90',
            'focus:ring-primary',
            'disabled:bg-muted disabled:text-muted-foreground disabled:border-muted disabled:hover:bg-muted'
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
            <Icon className={clsx('w-4 h-4', iconClassName)} />
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
            !showTextOnMobile && (Icon || loading) && 'max-sm:sr-only'
          )}
        >
          {children}
        </span>
      );
    };

    const button = (
      <button
        ref={ref}
        type={type}
        className={baseClasses}
        aria-disabled={isDisabled}
        aria-busy={loading}
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

    if (disabled && renderDisabled) {
      return <>{renderDisabled(button)}</>;
    }
    return button;
  }
);

Button.displayName = 'Button';

export { Button };
export default Button;
