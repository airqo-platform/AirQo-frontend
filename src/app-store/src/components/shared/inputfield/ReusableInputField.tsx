'use client';

import { useId, useState } from 'react';
import { cn } from '@/lib/utils';
import { AqEye, AqEyeOff } from '@airqo/icons-react';
import ReusableToast from '@/components/shared/toast/ReusableToast';

interface ReusableInputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  description?: string;
  className?: string;
  required?: boolean;
}

const ReusableInputField: React.FC<ReusableInputFieldProps> = ({
  label,
  error,
  description,
  className,
  required,
  type,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const generatedId = useId();
  const inputId = props.id ?? `app-store-input-${generatedId}`;
  const isPassword = type === 'password';

  const handleCopy = async () => {
    if (!props.value) return;
    try {
      await navigator.clipboard.writeText(String(props.value));
      ReusableToast({ message: 'Copied', type: 'SUCCESS' });
    } catch (err) {
      ReusableToast({ message: `Failed to copy: ${String(err)}`, type: 'ERROR' });
    }
  };

  return (
    <div className="flex flex-col">
      {label && (
        <label htmlFor={inputId} className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
          {label}
          {required && <span className="ml-1 text-primary">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          className={cn(
            'w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary',
            error && 'border-destructive focus:border-destructive focus:ring-destructive',
            className
          )}
          {...props}
          type={isPassword ? (showPassword ? 'text' : 'password') : type}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(prev => !prev)}
            className="absolute inset-y-0 right-3 flex items-center text-muted-foreground"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <AqEyeOff className="h-4 w-4" /> : <AqEye className="h-4 w-4" />}
          </button>
        )}
        {props.readOnly && props.value && (
          <button
            type="button"
            onClick={handleCopy}
            className="absolute inset-y-0 right-3 flex items-center text-muted-foreground"
            aria-label="Copy"
          >
            Copy
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
      {!error && description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
    </div>
  );
};

export default ReusableInputField;