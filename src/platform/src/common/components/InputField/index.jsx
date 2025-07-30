/**
 * InputField Component
 * Renders an input field with an optional label, icon, and error message.
 * ... (props documentation remains the same)
 */
const InputField = ({
  label,
  error,
  type = 'text',
  containerClassName = '',
  primaryColor = '',
  className = '',
  required = false,
  disabled = false,
  description,
  onChange,
  ...inputProps
}) => {
  // The onChange handler logic remains the same
  const handleChange = (e) => {
    if (!onChange) return;
    // ... (no changes to this function)
    if (e && e.target && typeof e.target.value !== 'undefined') {
      const value = e.target.value;
      if (e.target.name || e.target.id) {
        try {
          onChange(e);
          return;
        } catch {
          try {
            onChange(value);
          } catch {}
        }
      } else {
        try {
          onChange(value);
          return;
        } catch {
          try {
            onChange(e);
          } catch {}
        }
      }
    }
  };

  return (
    <div className={`flex flex-col mb-4 ${containerClassName}`}>
      {label && (
        <label className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center">
          {label}
          {required &&
            (primaryColor ? (
              <span style={{ color: primaryColor }} className="ml-1">
                *
              </span>
            ) : (
              <span className="ml-1 text-primary">*</span>
            ))}
        </label>
      )}
      {/* The wrapping div is now gone, styles are on the input */}
      <input
        type={type}
        className={`
          w-full rounded-xl border bg-white px-4 py-2.5 text-sm
          text-gray-700 placeholder-gray-400
          border-gray-300 transition-colors duration-150 ease-in-out
          dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:placeholder-gray-500
          
          hover:border-primary/50

          focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none

          disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-500
          dark:disabled:border-gray-700 dark:disabled:bg-gray-700 dark:disabled:text-gray-400
          ${className}
        ${primaryColor ? '' : ''}
        `}
        style={
          primaryColor
            ? {
                borderColor: error ? 'red' : primaryColor,
                boxShadow: error
                  ? '0 0 0 1px red'
                  : `0 0 0 1px ${primaryColor}50`,
              }
            : error
              ? { borderColor: 'red', boxShadow: '0 0 0 1px red' }
              : undefined
        }
        disabled={disabled}
        required={required}
        onChange={handleChange}
        {...inputProps}
      />
      {error && (
        <div className="mt-1.5 flex items-center text-xs text-red-600 dark:text-red-400">
          <svg
            className="w-4 h-4 mr-1 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-4 4a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </div>
      )}
      {!error && description && (
        <div className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
          {description}
        </div>
      )}
    </div>
  );
};

export default InputField;
