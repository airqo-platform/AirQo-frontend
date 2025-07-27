const SelectionMessage = ({
  type = 'info',
  children,
  onClear,
  clearText = 'Clear',
  className = '',
}) => {
  const colorSchemes = {
    info: {
      bg: 'bg-primary/10 dark:bg-primary',
      border: 'border-primary/40 dark:border-primary',
      text: 'text-primary/80 dark:text-white',
      buttonHover: 'hover:text-primary/80 dark:hover:text-white',
      buttonText: 'text-primary dark:text-white',
    },
    success: {
      bg: 'bg-green-50 dark:bg-green-900',
      border: 'border-green-400 dark:border-green-600',
      text: 'text-green-800 dark:text-white',
      buttonHover: 'hover:text-green-800 dark:hover:text-white',
      buttonText: 'text-green-600 dark:text-white',
    },
    warning: {
      bg: 'bg-yellow-50 dark:bg-yellow-900',
      border: 'border-yellow-400 dark:border-yellow-600',
      text: 'text-yellow-800 dark:text-white',
      buttonHover: 'hover:text-yellow-800 dark:hover:text-white',
      buttonText: 'text-yellow-600 dark:text-white',
    },
    error: {
      bg: 'bg-red-50 dark:bg-red-900',
      border: 'border-red-400 dark:border-red-600',
      text: 'text-red-800 dark:text-white',
      buttonHover: 'hover:text-red-800 dark:hover:text-white',
      buttonText: 'text-red-600 dark:text-white',
    },
  };

  const colors = colorSchemes[type] || colorSchemes.info;

  return (
    <div
      className={`mb-4 px-4 py-2 ${colors.bg} border-l-4 ${colors.border} rounded-md ${className} ${
        onClear ? 'flex justify-between items-center' : ''
      }`}
    >
      <div className={`${colors.text} text-sm`}>{children}</div>
      {onClear && (
        <button
          onClick={onClear}
          className={`flex items-center ${colors.buttonText} ${colors.buttonHover} text-sm font-medium`}
          aria-label={clearText}
          type="button"
        >
          {clearText}
        </button>
      )}
    </div>
  );
};

export default SelectionMessage;
