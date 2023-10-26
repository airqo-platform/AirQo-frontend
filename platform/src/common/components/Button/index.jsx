const Button = ({ onClick, className, path, children, dataTestId, rest, disabled }) => {
  if (path) {
    // if the button has an href property, it should be a link button
    return (
      <a
        href={path}
        className={`flex justify-center items-center px-3 py-2 ${className}`}
        data-testid={dataTestId}
      >
        {children}
      </a>
    );
  } else {
    // otherwise, it's a regular button with an onClick handler
    return (
      <button
        onClick={onClick}
        className={`flex justify-center items-center px-3 py-2 ${className}`}
        data-testid={dataTestId}
        {...rest}
        disabled={disabled}
      >
        {children}
      </button>
    );
  }
};

export default Button;
