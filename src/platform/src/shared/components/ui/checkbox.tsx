'use client';

import * as React from 'react';
import { cn } from '@/shared/lib/utils';
import { AqCheck, AqMinus } from '@airqo/icons-react';

export type CheckboxProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'onChange'
> & {
  onCheckedChange?: (checked: boolean) => void;
  indeterminate?: boolean;
};

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      className,
      onCheckedChange,
      checked: controlledChecked,
      defaultChecked,
      indeterminate = false,
      ...props
    },
    ref
  ) => {
    const [internalChecked, setInternalChecked] = React.useState(
      defaultChecked || false
    );
    const isControlled = controlledChecked !== undefined;
    const isChecked = isControlled ? controlledChecked : internalChecked;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newChecked = e.target.checked;

      if (!isControlled) {
        setInternalChecked(newChecked);
      }

      onCheckedChange?.(newChecked);
    };

    // Handle indeterminate state
    React.useEffect(() => {
      if (ref && 'current' in ref && ref.current) {
        ref.current.indeterminate = indeterminate;
      }
    }, [indeterminate, ref]);

    return (
      <label
        className={`inline-flex items-center cursor-pointer ${className || ''}`}
      >
        <span className="relative inline-block w-5 h-5 shrink-0">
          <input
            type="checkbox"
            ref={ref}
            className="sr-only"
            onChange={handleChange}
            checked={isChecked}
            {...props}
          />

          <span
            className={`absolute inset-0 rounded-md border transition-all duration-200 flex items-center justify-center ${
              isChecked || indeterminate
                ? 'bg-primary border-primary'
                : 'bg-background border-input hover:border-primary'
            } ${
              props.disabled
                ? 'opacity-50 cursor-not-allowed'
                : 'cursor-pointer'
            }`}
          >
            {indeterminate ? (
              <AqMinus
                size={14}
                color="white"
                className="transition-all duration-200"
              />
            ) : (
              <AqCheck
                size={14}
                color="white"
                className={cn('transition-all duration-200', {
                  'opacity-100 scale-100': isChecked,
                  'opacity-0 scale-75': !isChecked,
                })}
              />
            )}
          </span>
        </span>
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';

// Demo
export default Checkbox;
