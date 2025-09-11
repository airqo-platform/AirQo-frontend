import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { useMediaQuery } from 'react-responsive';

const Button = React.forwardRef(
  (
    {
      variant = 'filled',
      padding = 'py-2 px-4',
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

    // Safe click handler
    const handleClick = (e) => {
      if (disabled) {
        e.preventDefault();
        return;
      }
      onClick?.(e);
    };

    // Determine button styles based on variant
    const getVariantStyles = () => {
      switch (variant) {
        case 'outlined':
          return 'border border-blue-600 text-blue-600 bg-transparent hover:bg-blue-50 disabled:border-gray-300 disabled:text-gray-400 disabled:bg-transparent';
        case 'text':
          return 'text-blue-600 bg-transparent hover:bg-blue-50 disabled:text-gray-400 disabled:bg-transparent';
        case 'disabled':
          return 'bg-gray-300 text-gray-500 cursor-not-allowed border-none';
        default: // filled
          return 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500';
      }
    };

    // Use paddingStyles if provided (legacy support), otherwise use padding
    const paddingClass = paddingStyles || padding;

    const buttonClasses = clsx(
      // Base styles
      'inline-flex items-center justify-center rounded-md font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
      // Variant styles
      getVariantStyles(),
      // Padding
      paddingClass,
      // Custom className
      className,
      // Disabled state
      disabled && 'pointer-events-none',
    );

    const content = (
      <>
        {Icon && (
          <span className={clsx('flex-shrink-0', children && 'mr-2')}>
            <Icon className="w-4 h-4" />
          </span>
        )}
        {children && (
          <span
            className={clsx(isMobile && !showTextOnMobile && Icon && 'sr-only')}
          >
            {children}
          </span>
        )}
      </>
    );

    return (
      <button
        ref={ref}
        type={type}
        className={buttonClasses}
        disabled={disabled}
        onClick={handleClick}
        data-testid={dataTestId}
        {...rest}
      >
        {content}
      </button>
    );
  },
);

Button.displayName = 'Button';

Button.propTypes = {
  variant: PropTypes.oneOf(['filled', 'outlined', 'text', 'disabled']),
  padding: PropTypes.string,
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
