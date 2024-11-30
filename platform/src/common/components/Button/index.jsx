import React from 'react';

const Button = ({
  onClick,
  className = '',
  path,
  children,
  dataTestId,
  disabled = false,
  type = 'button',
  variant = 'filled',
  color,
  bgColor,
  Icon,
  paddingStyles = 'py-2 px-4 shadow-sm',
  ...rest
}) => {
  // Determine styles based on the variant
  const variantStyles = {
    filled: {
      backgroundColor: bgColor || 'bg-blue-600',
      textColor: color || 'text-white',
      border: '',
    },
    outlined: {
      backgroundColor: bgColor || 'bg-white',
      textColor: color || 'text-black',
      border: 'border b-secondary-neutral-light-100',
    },
    text: {
      backgroundColor: 'bg-transparent',
      textColor: color || 'text-secondary-neutral-light-600',
      border: '',
    },
    disabled: {
      backgroundColor: 'bg-secondary-neutral-light-100',
      textColor: 'text-secondary-neutral-light-600',
      border: '',
    },
    primaryText: {
      backgroundColor: 'bg-transparent',
      textColor: color || 'text-blue-600',
      border: '',
    },
  };

  const { backgroundColor, textColor, border } =
    variantStyles[variant] || variantStyles.filled;

  // Combine all styles into a button class
  const buttonClass = `flex justify-center items-center cursor-pointer ${paddingStyles} rounded-xl sm:gap-1 ${className} ${textColor} ${backgroundColor} ${border} transition transform active:scale-95 ${disabled ? 'cursor-not-allowed opacity-50' : ''}`;

  // Render tag if `path` is provided
  if (path) {
    return (
      <a href={path} className={buttonClass} data-testid={dataTestId} {...rest}>
        {Icon && <Icon className="w-4 h-4 mr-2" />}
        {children}
      </a>
    );
  }

  // Render button element if `path` is not provided
  return (
    <button
      onClick={onClick}
      className={buttonClass}
      data-testid={dataTestId}
      type={type}
      disabled={disabled}
      {...rest}
    >
      {Icon && <Icon className="w-4 h-4 mr-2" />} {/* Icon before text */}
      {children}
    </button>
  );
};

export default Button;
