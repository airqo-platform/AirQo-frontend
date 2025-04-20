import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { useMediaQuery } from 'react-responsive';

const Button = React.forwardRef(
  (
    {
      variant = 'filled', // filled | outlined | text | disabled
      padding = 'py-2 px-4',
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
      'flex items-center justify-center rounded-xl transition transform active:scale-95';
    const variantMap = {
      filled: clsx('bg-primary', 'text-white'),
      outlined: clsx(
        'bg-transparent',
        'border border-gray-300',
        'text-current',
      ),
      text: clsx('bg-transparent', 'text-primary'),
      disabled: clsx('bg-gray-300', 'text-gray-500'),
    };
    const activeVariant = disabled ? 'disabled' : variant;
    const variantStyles = variantMap[activeVariant] || variantMap.filled;
    const disabledStyles = disabled && 'cursor-not-allowed opacity-50';

    // Responsive detection
    const isMobile = useMediaQuery({ query: '(max-width: 768px)' });
    // Determine if text should be hidden
    const hideText = isMobile && Icon && !showTextOnMobile;
    // Only apply right margin on icon when there's visible text
    const iconMargin = hideText ? '' : 'mr-2';

    const btnClass = clsx(
      base,
      padding,
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

Button.defaultProps = {
  variant: 'filled',
  padding: 'py-2 px-4',
  disabled: false,
  type: 'button',
  showTextOnMobile: false,
};

export default Button;
