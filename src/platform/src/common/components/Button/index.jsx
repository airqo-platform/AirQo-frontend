import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { useMediaQuery } from 'react-responsive';

const Button = React.forwardRef(
  (
    {
      variant = 'filled', // filled | outlined | text | disabled
      padding = 'py-2 px-4',
      paddingStyles, // Legacy prop for backward compatibility
      className,
      disabled = false,
      path,
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
    // Base styles
    const base =
      'flex items-center justify-center rounded-lg transition transform active:scale-95 duration-200';
    const variantMap = {
      filled: clsx(
        'bg-primary',
        'hover:bg-primary/80',
        'text-white',
        'border border-transparent',
        'shadow-sm hover:shadow-lg',
        'focus:ring-2 focus:ring-primary focus:ring-opacity-50',
      ),
      outlined: clsx(
        'bg-transparent',
        'border border-primary',
        'text-primary',
        'hover:bg-primary',
        'hover:text-white',
        'focus:ring-2 focus:ring-primary focus:ring-opacity-50',
      ),
      text: clsx(
        'bg-transparent',
        'text-primary',
        'hover:bg-primary/10',
        'focus:ring-2 focus:ring-primary focus:ring-opacity-50',
      ),
      disabled: clsx(
        'bg-gray-300 dark:bg-gray-600',
        'text-gray-500 dark:text-gray-400',
        'border border-transparent',
      ),
    };
    const activeVariant = disabled ? 'disabled' : variant;
    const variantStyles = variantMap[activeVariant] || variantMap.filled;
    const disabledStyles = disabled && 'cursor-not-allowed opacity-50'; // Responsive detection
    const isMobile = useMediaQuery({ query: '(max-width: 768px)' });
    // Determine if text should be hidden
    const hideText = isMobile && Icon && !showTextOnMobile;
    // Only apply right margin on icon when there's visible text
    const iconMargin = hideText ? '' : 'mr-2';

    // Determine padding - paddingStyles takes precedence for backward compatibility
    const finalPadding = paddingStyles || padding;

    const btnClass = clsx(
      base,
      finalPadding,
      variantStyles,
      disabledStyles,
      className,
    );

    const Content = (
      <>
        {Icon && <Icon className={clsx('w-4 h-4', iconMargin)} />}
        {!hideText && children}
      </>
    );

    if (path) {
      return (
        <a
          ref={ref}
          href={path}
          className={btnClass}
          data-testid={dataTestId}
          aria-disabled={disabled}
          {...rest}
        >
          {Content}
        </a>
      );
    }

    return (
      <button
        ref={ref}
        type={type}
        onClick={onClick}
        className={btnClass}
        data-testid={dataTestId}
        disabled={disabled}
        {...rest}
      >
        {Content}
      </button>
    );
  },
);

Button.displayName = 'Button';

Button.propTypes = {
  variant: PropTypes.oneOf(['filled', 'outlined', 'text', 'disabled']),
  padding: PropTypes.string,
  paddingStyles: PropTypes.string, // Legacy prop for backward compatibility
  className: PropTypes.string,
  disabled: PropTypes.bool,
  path: PropTypes.string,
  onClick: PropTypes.func,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  dataTestId: PropTypes.string,
  Icon: PropTypes.elementType,
  children: PropTypes.node.isRequired,
  showTextOnMobile: PropTypes.bool,
};

export default Button;
