import React from 'react';

/**
 * SelectField Component
 * Renders a select dropdown with an optional label and error message.
 * Props:
 * - label: Optional label text
 * - error: Optional error message
 * - containerClassName: Additional classes for the container
 * - className: Additional classes for the select element
 * - required: Whether the field is required
 * - disabled: Whether the select is disabled
 * - children: Option elements
 * - onChange: Change handler function
 * - ...selectProps: Additional props for the select element
 */
const SelectField = ({
  label,
  error,
  containerClassName = '',
  className = '',
  required = false,
  disabled = false,
  description,
  onChange,
  children,
  ...selectProps
}) => {
  return (
    <div className={`flex flex-col mb-4 ${containerClassName}`}>
      {label && (
        <label className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center">
          {label}
          {required && (
            <span className="ml-1 text-[var(--org-primary,var(--color-primary,#145fff))]">
              *
            </span>
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
          focus-within:ring-2 focus-within:ring-offset-0 focus-within:ring-[var(--org-primary,var(--color-primary,#145fff))]
        `}
      >
        <select
          className={`
            w-full px-4 py-2.5 rounded-xl border-gray-400 bg-transparent outline-none text-sm
            text-gray-700 dark:text-gray-200
            disabled:text-gray-500 disabled:dark:text-gray-400
            disabled:cursor-not-allowed
            [&>option]:bg-white [&>option]:dark:bg-gray-800 
            [&>option]:text-gray-900 [&>option]:dark:text-gray-100
            [&>option:disabled]:text-gray-400 [&>option:disabled]:dark:text-gray-500 ${className}
          `}
          disabled={disabled}
          required={required}
          onChange={onChange}
          {...selectProps}
        >
          {children}
        </select>
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
        <div className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
          {description}
        </div>
      )}
    </div>
  );
};

export default SelectField;
