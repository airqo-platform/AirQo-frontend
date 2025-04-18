import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

const Button = React.forwardRef(
  (
    {
      variant = 'filled', // filled | outlined | text | disabled
      padding = 'py-2 px-4 shadow-sm',
      className,
      disabled = false,
      path,
      onClick,
      type = 'button',
      dataTestId,
      Icon,
      children,
      ...rest
    },
    ref,
  ) => {
    const base =
      'flex items-center justify-center rounded-xl transition transform active:scale-95';
    const variantMap = {
      filled: clsx('bg-primary', 'text-white'),
      outlined: clsx('bg-transparent', 'border border-primary', 'text-primary'),
      text: clsx('bg-transparent', 'text-primary'),
      disabled: clsx('bg-gray-300', 'text-gray-500'),
    };
    const activeVariant = disabled ? 'disabled' : variant;
    const variantStyles = variantMap[activeVariant] || variantMap.filled;
    const disabledStyles = disabled && 'cursor-not-allowed opacity-50';

    const btnClass = clsx(
      base,
      padding,
      variantStyles,
      disabledStyles,
      className,
    );

    const Content = (
      <>
        {Icon && <Icon className="w-4 h-4 mr-2" />}
        {children}
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
};

export default Button;
