import React from 'react';

/**
 * TextField Component
 *
 * Props:
 * - id: Field identifier
 * - name: Field name for form handling
 * - value: Field value
 * - onChange: Change handler function
 * - label: Optional label for the field
 * - Icon: Optional icon component to display
 * - error: Optional error message
 * - containerClassName: Additional classes for the outer container
 * - inputClassName: Additional classes for the textarea
 * - required: Whether the field is required
 * - disabled: Whether the field is disabled
 * - ...rest: Additional props for the textarea element
 */
const TextField = ({
  id,
  name,
  value,
  onChange,
  label,
  Icon,
  error,
  containerClassName = '',
  inputClassName = '',
  required = false,
  disabled = false,
  ...rest
}) => {
  return (
    <div className={`flex flex-col mb-4 ${containerClassName}`}>
      {label && (
        <label
          htmlFor={id}
          className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center"
        >
          {label}{' '}
          {required && (
            <span className="ml-1 text-[var(--org-primary,var(--color-primary,#145fff))]">
              *
            </span>
          )}
        </label>
      )}

      <div className="relative flex items-start">
        {Icon && (
          <div className="absolute left-0 top-0 pt-3 pl-3 flex items-start justify-center text-gray-500 dark:text-gray-400">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <textarea
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={`
            w-full px-4 py-2.5 rounded-xl border bg-white outline-none text-sm
            text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500
            border-gray-300 transition-colors duration-150 ease-in-out
            dark:border-gray-600 dark:bg-gray-800
            ${Icon ? 'pl-10' : ''}
            
            hover:border-[var(--org-primary,var(--color-primary,#145fff))]/50

            focus:border-[var(--org-primary,var(--color-primary,#145fff))] focus:ring-1 focus:ring-[var(--org-primary,var(--color-primary,#145fff))] focus:outline-none

            disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-500
            dark:disabled:border-gray-700 dark:disabled:bg-gray-700 dark:disabled:text-gray-400
            ${inputClassName}
          `}
          style={{
            minHeight: '100px',
            maxHeight: '200px',
            resize: 'vertical',
          }}
          {...rest}
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
    </div>
  );
};

export default TextField;
