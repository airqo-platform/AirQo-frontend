import * as React from 'react';

interface TextInputProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  id?: string;
  name?: string;
  label?: string;
  Icon?: React.ComponentType<{ className?: string }>;
  error?: string;
  containerClassName?: string;
  inputClassName?: string;
  required?: boolean;
  disabled?: boolean;
}

/**
 * TextInput Component
 */
const TextInput = React.forwardRef<HTMLTextAreaElement, TextInputProps>(
  (
    {
      id,
      name,
      label,
      Icon,
      error,
      containerClassName = '',
      inputClassName = '',
      required = false,
      disabled = false,
      rows = 4,
      ...rest
    },
    ref
  ) => {
    return (
      <div className={`flex flex-col mb-4 ${containerClassName}`}>
        {label && (
          <label
            htmlFor={id}
            className="mb-2 text-sm text-foreground flex items-center"
          >
            {label}{' '}
            {required && <span className="ml-1 text-destructive">*</span>}
          </label>
        )}

        <div className="relative flex items-start">
          {Icon && (
            <div className="absolute left-0 top-0 pt-3 pl-3 flex items-start justify-center text-muted-foreground">
              <Icon className="w-5 h-5" />
            </div>
          )}
          <textarea
            ref={ref}
            id={id}
            name={name}
            disabled={disabled}
            required={required}
            rows={rows}
            className={`
            w-full px-4 py-2.5 rounded-md border bg-background outline-none text-sm
            text-foreground placeholder-muted-foreground
            border-input transition-colors duration-150 ease-in-out
            ${Icon ? 'pl-10' : ''}

            hover:border-primary/50

            focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none

            disabled:cursor-not-allowed disabled:border-input disabled:bg-muted disabled:text-muted-foreground
            ${inputClassName}
          `}
            style={{
              minHeight: `${rows * 25}px`,
              maxHeight: '200px',
              resize: 'vertical',
            }}
            {...rest}
          />
        </div>

        {error && (
          <div className="mt-1.5 flex items-center text-xs text-destructive">
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
  }
);

TextInput.displayName = 'TextInput';

export { TextInput };
