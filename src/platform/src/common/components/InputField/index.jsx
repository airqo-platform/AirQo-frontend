import React from 'react';

/**
 * InputField Component
 * Renders an input field with an optional label, icon, and error message.
 * Props:
 * - label: Optional label text
 * - error: Optional error message
 * - type: Input type (default: 'text')
 * - containerClassName: Additional classes for the container
 * - className: Additional classes for the input element
 * - required: Whether the field is required
 * - disabled: Whether the input is disabled
 * - onChange: Change handler function (can accept value or event)
 * - ...inputProps: Additional props for the input element
 */
const InputField = ({
  label,
  error,
  type = 'text',
  containerClassName = '',
  className = '',
  required = false,
  disabled = false,
  description,
  onChange,
  ...inputProps
}) => {
  // Handle onChange to support both value-only and event-based patterns
  const handleChange = (e) => {
    if (onChange) {
      // Safety check: ensure event and target exist
      if (!e || !e.target) {
        return;
      }

      // If onChange expects just the value (like in our login form)
      if (onChange.length === 1) {
        onChange(e.target.value);
      } else {
        // Standard event-based onChange
        onChange(e);
      }
    }
  };
  return (
    <div className={`flex flex-col mb-4 ${containerClassName}`}>
      {label && (
        <label className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center">
          {label}
          {required && (
            <span className="ml-1 text-blue-600 dark:text-blue-400">*</span>
          )}
        </label>
      )}

      <div
        className={`
          flex items-center rounded-xl
          transition-colors duration-150 ease-in-out
          ${
            disabled
              ? 'bg-gray-100 dark:bg-gray-700'
              : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
          }
          focus-within:ring-2 focus-within:ring-offset-0 focus-within:ring-blue-500        `}
      >
        <input
          type={type}
          className={`
            w-full px-4 py-2.5 rounded-xl border-gray-400 bg-transparent outline-none text-sm
            text-gray-700 dark:text-gray-200
            placeholder-gray-400 dark:placeholder-gray-500
            disabled:text-gray-500 disabled:dark:text-gray-400
            disabled:cursor-not-allowed ${className}
          `}
          disabled={disabled}
          required={required}
          onChange={handleChange}
          {...inputProps}
        />
      </div>

      {error && (
        <div className="mt-1.5 flex items-center text-xs text-red-600 dark:text-red-400">
          <svg
            className="w-4 h-4 mr-1 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </div>
      )}

      {!error && description && (
        <div className="mt-1.5 text-xs text-gray-500">{description}</div>
      )}
    </div>
  );
};

export default InputField;
