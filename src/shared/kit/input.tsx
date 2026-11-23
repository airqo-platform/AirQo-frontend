'use client';

import * as React from 'react';
import {
  AqAlertCircle,
  AqCopy01,
  AqEye,
  AqEyeOff,
} from '@airqo/icons-react';
import ReusableToast from './toast';

/*
 * Labelled text field from the custom kit Vertex and Nexus share.
 *
 * Copied from nexus/src/shared/components/ui/input.tsx (`Input`, about 55 Nexus
 * files). Vertex's components/shared/inputfield/ReusableInputField.tsx (about 26
 * files) is the same field: label with a red asterisk, `error` with an alert
 * icon, `description`, `primaryColor`, `containerClassName`, the same
 * px-4 py-2.5 text-sm box with a primary hover and focus ring.
 *
 * Nexus's version is the base: theme tokens where Vertex hard-codes grays,
 * forwardRef (react-hook-form), a character counter and over-limit error from
 * `maxLength`. Added from Vertex:
 * - `showCopyButton` (with `readOnly`): copies the value and toasts "Copied".
 * - `customActionIcon` / `onCustomAction` / `customActionLabel`: one extra
 *   button inside the field.
 * Those buttons used Vertex's gray classes; they use the matching tokens here
 * (text-muted-foreground, bg-muted, border-border). With any of these buttons
 * (or the password toggle) the trailing icons sit in one row on the right and
 * the input gets right padding. Vertex used pr-18 and pr-26, which aren't
 * Tailwind classes, so its text ran under the icons.
 *
 * Drift: Vertex shows the password toggle for every type="password"; Nexus
 * (kept) only with `showPasswordToggle`. Vertex's `as="textarea"` is ./text-input
 * here. Vertex hides the asterisk and error when `readOnly`. Nexus puts `mb-4`
 * under the field; Vertex nothing. Vertex rounds with rounded-xl, Nexus rounded-md.
 */
interface InputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'onChange'
> {
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
  /** With `readOnly`: a button that copies the value (from Vertex). */
  showCopyButton?: boolean;
  /** An extra button inside the field (from Vertex). */
  customActionIcon?: React.ComponentType<{ className?: string }>;
  onCustomAction?: () => void;
  customActionLabel?: string;
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
      showCopyButton,
      customActionIcon: CustomActionIcon,
      onCustomAction,
      customActionLabel,
      onChange,
      maxLength,
      value,
      defaultValue,
      id: externalId,
      ...inputProps
    } = props;

    const generatedId = React.useId();
    const inputId = externalId || `input-${generatedId}`;
    const [showPassword, setShowPassword] = React.useState(false);

    const maxLengthNum = typeof maxLength === 'number' ? maxLength : undefined;

    const getInitialLength = (): number => {
      if (value !== undefined && value !== null) return String(value).length;
      if (defaultValue !== undefined && defaultValue !== null)
        return String(defaultValue).length;
      return 0;
    };

    const [charCount, setCharCount] = React.useState(getInitialLength);

    React.useEffect(() => {
      if (value !== undefined && value !== null) {
        setCharCount(String(value).length);
      }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (maxLengthNum !== undefined) {
        setCharCount(e.target.value.length);
      }
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

    const handleCopy = async () => {
      if (value !== undefined && value !== null) {
        try {
          await navigator.clipboard?.writeText(String(value));
          ReusableToast({ message: 'Copied', type: 'SUCCESS' });
        } catch (err) {
          ReusableToast({
            message: `Failed to copy: ${String(err)}`,
            type: 'ERROR',
          });
        }
      }
    };

    const isOverLimit = maxLengthNum !== undefined && charCount > maxLengthNum;
    const maxLengthError = isOverLimit
      ? `Max ${maxLengthNum} characters allowed`
      : undefined;

    const displayError = error || maxLengthError;
    const errorId = `${inputId}-error`;
    const descriptionId = `${inputId}-description`;

    const canShowCopyButton = !!showCopyButton && !!inputProps.readOnly;
    const canShowPasswordToggle = showPasswordToggle && type === 'password';
    const canShowCustomAction = !!CustomActionIcon && !!onCustomAction;
    const trailingCount = [
      canShowCustomAction,
      canShowCopyButton,
      canShowPasswordToggle,
    ].filter(Boolean).length;
    const paddingRightClass =
      ['', 'pr-10', 'pr-[4.5rem]', 'pr-[6.5rem]'][trailingCount] ?? '';

    return (
      <div className={`flex flex-col mb-4 ${containerClassName}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="flex items-center mb-2 text-sm text-foreground"
          >
            {label}
            {required && <span className="ml-1 text-destructive">*</span>}
          </label>
        )}

        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type={
              canShowPasswordToggle ? (showPassword ? 'text' : 'password') : type
            }
            aria-invalid={!!displayError}
            aria-describedby={
              displayError
                ? errorId
                : description
                  ? descriptionId
                  : undefined
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
            ${paddingRightClass}
            ${className}
          `}
            style={
              primaryColor
                ? {
                    borderColor: displayError ? 'red' : primaryColor,
                    boxShadow: displayError
                      ? '0 0 0 1px red'
                      : `0 0 0 1px ${primaryColor}50`,
                  }
                : displayError
                  ? { borderColor: 'red', boxShadow: '0 0 0 1px red' }
                  : undefined
            }
            disabled={disabled}
            required={required}
            maxLength={maxLength}
            onChange={handleChange}
            value={value}
            defaultValue={defaultValue}
            {...inputProps}
          />

          {trailingCount > 0 && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 space-x-1">
              {canShowCustomAction && CustomActionIcon && (
                <button
                  type="button"
                  onClick={onCustomAction}
                  className="text-muted-foreground hover:text-primary bg-muted border border-border p-1.5 rounded-md focus:outline-none"
                  aria-label={customActionLabel || 'Custom action'}
                >
                  <CustomActionIcon className="h-4 w-4" />
                </button>
              )}
              {canShowCopyButton && (
                <button
                  type="button"
                  onClick={handleCopy}
                  className="text-muted-foreground hover:text-primary bg-muted border border-border p-1.5 rounded-md focus:outline-none"
                  aria-label="Copy to clipboard"
                >
                  <AqCopy01 className="h-4 w-4" />
                </button>
              )}
              {canShowPasswordToggle && (
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword(s => !s)}
                  className="flex items-center justify-center w-5 h-5 text-muted-foreground hover:text-foreground dark:text-muted-foreground dark:hover:text-foreground"
                >
                  {showPassword ? (
                    <AqEyeOff className="w-4 h-4" />
                  ) : (
                    <AqEye className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>
          )}
        </div>

        {displayError && (
          <div
            id={errorId}
            className="mt-1.5 flex items-center text-xs text-destructive dark:text-destructive"
            role="alert"
          >
            <AqAlertCircle className="flex-shrink-0 w-4 h-4 mr-1" />
            {displayError}
          </div>
        )}

        {!displayError && description && (
          <div
            id={descriptionId}
            className="mt-1.5 text-xs text-muted-foreground dark:text-muted-foreground"
          >
            {description}
          </div>
        )}

        {!displayError && maxLengthNum !== undefined && charCount > 0 && (
          <div
            className={`mt-1.5 text-xs ${
              charCount >= maxLengthNum
                ? 'text-destructive font-medium'
                : 'text-muted-foreground'
            }`}
          >
            {charCount}/{maxLengthNum}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
export type { InputProps };
