const Button = ({
  onClick,
  className,
  path,
  children,
  dataTestId,
  rest,
  disabled,
  type,
  variant,
  color,
  bgColor,
  Icon,
}) => {
  let buttonClass = `flex justify-center items-center px-4 py-3 rounded sm:gap-1 ${className}`;
  let textColor = '';
  let backgroundColor = '';
  let border = '';

  if (variant === 'filled') {
    backgroundColor = 'bg-blue-600';
    textColor = 'text-white';
  } else if (variant === 'outlined') {
    border = 'border b-secondary-neutral-light-100';
    textColor = 'text-secondary-neutral-light-600';
  } else if (variant === 'text') {
    textColor = 'text-secondary-neutral-light-600';
  }

  if (bgColor) {
    backgroundColor = bgColor;
  }

  if (color) {
    textColor = color;
  }

  if (path) {
    // if the button has an href property, it should be a link button
    return (
      <a
        href={path}
        className={`${buttonClass} ${textColor} ${backgroundColor} ${border}`}
        data-testid={dataTestId}
      >
        {Icon && <Icon className={`${textColor || 'text-black-900'} w-4 h-4`} />}
        {children}
      </a>
    );
  } else {
    // otherwise, it's a regular button with an onClick handler
    return (
      <button
        onClick={onClick}
        className={`${buttonClass} ${textColor} ${backgroundColor} ${border}`}
        data-testid={dataTestId}
        type={type}
        {...rest}
        disabled={disabled}
      >
        {Icon && <Icon className={`${textColor || 'text-black-900 w-4 h-4'}`} />}
        {children}
      </button>
    );
  }
};

export default Button;
