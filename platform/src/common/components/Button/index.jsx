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
  paddingStyles = 'py-2 px-4',
}) => {
  let buttonClass = `flex justify-center items-center shadow-sm ${paddingStyles} rounded-xl sm:gap-1 ${className} transition transform active:scale-95`;
  let textColor = '';
  let backgroundColor = '';
  let border = '';

  if (variant === 'filled') {
    backgroundColor = 'bg-blue-600';
    textColor = 'text-white';
  } else if (variant === 'outlined') {
    border = 'border b-secondary-neutral-light-100';
    textColor = 'text-black';
    backgroundColor = 'bg-white';
  } else if (variant === 'text') {
    textColor = 'text-secondary-neutral-light-600';
  } else if (variant === 'disabled') {
    backgroundColor = 'bg-secondary-neutral-light-100';
    textColor = 'text-secondary-neutral-light-600';
  } else if (variant === 'primaryText') {
    textColor = 'text-blue-600';
  }

  if (bgColor) {
    backgroundColor = bgColor;
  }

  if (color) {
    textColor = color;
  }

  if (path) {
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
