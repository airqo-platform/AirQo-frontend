import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { useMediaQuery } from 'react-responsive';
import { AqLoading02 } from '@airqo/icons-react';

const Button = React.forwardRef(
  (
    {
      variant = 'filled', // filled | outlined | text | ghost | disabled
      size = 'md', // sm | md | lg
      fullWidth = false,
      loading = false,
      paddingStyles,
      className,
      disabled = false,
      onClick,
      type = 'button',
      dataTestId,
      Icon,
      children,
      showTextOnMobile = false,
      ...rest
    },
    ref,
  ) => {
    const isMobile = useMediaQuery({ maxWidth: 640 });

    const isDisabled = disabled || loading || variant === 'disabled';

    const handleClick = (e) => {
      if (isDisabled) {
        e.preventDefault();
        return;
      }
      onClick?.(e);
    };

    // Size -> padding and font-size
    const sizeMap = {
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
            'disabled:border-gray-300 disabled:text-gray-400 disabled:bg-transparent disabled:hover:bg-transparent',
          );
        case 'text':
          return clsx(
            'text-primary bg-transparent border-transparent',
            'hover:bg-primary/10 hover:text-primary',
            'focus:ring-primary',
            'disabled:text-gray-400 disabled:bg-transparent disabled:hover:bg-transparent',
          );
        case 'ghost':
          return clsx(
            'bg-transparent text-primary border-transparent',
            'hover:bg-primary/5',
            'focus:ring-primary',
            'disabled:text-gray-400 disabled:hover:bg-transparent',
          );
        case 'disabled':
          return 'bg-gray-300 text-gray-500 cursor-not-allowed border-gray-300 opacity-50';
        default: // filled
          return clsx(
            'bg-primary text-white border-primary',
            'hover:bg-primary/90',
            'focus:ring-primary',
            'disabled:bg-gray-300 disabled:text-gray-500 disabled:border-gray-300 disabled:hover:bg-gray-300',
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
      className,
    );

    const renderIcon = () => {
      if (loading) {
        return (
          <span
            className={clsx(
              'flex items-center justify-center',
              children && 'mr-2',
            )}
          >
            <AqLoading02 className="w-4 h-4 text-current animate-spin" />
          </span>
        );
      }

      if (Icon) {
        return (
          <span className={clsx('flex-shrink-0', children && 'mr-2')}>
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
          className={clsx(isMobile && !showTextOnMobile && Icon && 'sr-only')}
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
        {renderIcon()}
        {renderText()}
      </button>
    );
  },
);

Button.displayName = 'Button';

Button.propTypes = {
  variant: PropTypes.oneOf(['filled', 'outlined', 'text', 'ghost', 'disabled']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  fullWidth: PropTypes.bool,
  loading: PropTypes.bool,
  paddingStyles: PropTypes.string,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  dataTestId: PropTypes.string,
  Icon: PropTypes.elementType,
  children: PropTypes.node,
  showTextOnMobile: PropTypes.bool,
};

export default Button;
