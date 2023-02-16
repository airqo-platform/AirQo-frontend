const Button = ({ onClick, className, path, children }) => {
  return (
    <a
      href={path || '#'}
      onClick={onClick}
      className={`flex justify-center items-center normal-case px-4 py-2 ${className}`}
    >
      {children}
    </a>
  );
};

export default Button;
