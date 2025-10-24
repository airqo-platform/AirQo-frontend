// Clean, tested forwardRef Input component
import * as React from 'react';
import { AqEye, AqEyeOff, AqAlertCircle } from '@airqo/icons-react';

interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  error?: string;
  type?: string;
  containerClassName?: string;
  primaryColor?: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
  description?: string;
  showPasswordToggle?: boolean;
  // allow any onChange signature (RHForm or normal)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange?: (...args: any[]) => void;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function Input(props, ref) {
    const {
      label,
      error,
      type = 'text',
      containerClassName = '',
      primaryColor = '',
      className = '',
      required = false,
      disabled = false,
      description,
      showPasswordToggle = false,
      onChange,
      ...inputProps
    } = props;

    const [showPassword, setShowPassword] = React.useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!onChange) return;
      try {
        onChange(e);
        return;
      } catch {
        try {
          onChange(e.target.value);
          return;
        } catch {
          try {
            onChange();
          } catch {}
        }
      }
    };

    return (
      <div className={`flex flex-col mb-4 ${containerClassName}`}>
        {label && (
          <label className="flex items-center mb-2 text-sm font-medium text-foreground">
            {label}
            {required &&
              (primaryColor ? (
                <span className="ml-1 text-destructive">*</span>
              ) : (
                <span className="ml-1 text-destructive">*</span>
              ))}
          </label>
        )}

        <div className="relative">
          <input
            ref={ref}
            type={
              showPasswordToggle && type === 'password'
                ? showPassword
                  ? 'text'
                  : 'password'
                : type
            }
            className={`
            w-full rounded-md border bg-background px-4 py-2.5 text-sm
            text-foreground placeholder-muted-foreground
            border-input transition-colors duration-150 ease-in-out
            dark:border-input dark:bg-background dark:text-foreground dark:placeholder-muted-foreground

            hover:border-primary/50

            focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none

            disabled:cursor-not-allowed disabled:border-input disabled:bg-muted disabled:text-muted-foreground
            dark:disabled:border-input dark:disabled:bg-muted dark:disabled:text-muted-foreground
            ${className}
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

          {showPasswordToggle && type === 'password' && (
            <button
              type="button"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword(s => !s)}
              className="absolute flex items-center justify-center w-5 h-5 text-muted-foreground transform -translate-y-1/2 right-2 top-1/2 hover:text-foreground dark:text-muted-foreground dark:hover:text-foreground"
            >
              {showPassword ? (
                <AqEyeOff className="w-4 h-4" />
              ) : (
                <AqEye className="w-4 h-4" />
              )}
            </button>
          )}
        </div>

        {error && (
          <div className="mt-1.5 flex items-center text-xs text-destructive dark:text-destructive">
            <AqAlertCircle className="flex-shrink-0 w-4 h-4 mr-1" />
            {error}
          </div>
        )}

        {!error && description && (
          <div className="mt-1.5 text-xs text-muted-foreground dark:text-muted-foreground">
            {description}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
