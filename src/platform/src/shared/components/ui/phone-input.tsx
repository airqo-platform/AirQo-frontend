'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import type { CountryCode } from 'libphonenumber-js';
import { AqAlertCircle } from '@airqo/icons-react';

// Dynamically import the phone input to avoid SSR issues
const ReactPhoneNumberInput = dynamic(
  () => import('react-phone-number-input').then(mod => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="flex">
        <div className="px-3 py-2.5 border border-r-0 rounded-l-md bg-muted text-sm text-muted-foreground">
          +1
        </div>
        <input
          type="tel"
          disabled
          className="flex-1 px-4 py-2.5 rounded-r-md border bg-muted text-sm text-muted-foreground"
          placeholder="Loading..."
        />
      </div>
    ),
  }
);

// Import styles
import 'react-phone-number-input/style.css';
import './phone-input.css';

interface PhoneNumberInputProps {
  id?: string;
  value?: string;
  onChange: (phone: string | undefined) => void;
  label?: string;
  error?: string;
  containerClassName?: string;
  inputClassName?: string;
  required?: boolean;
  disabled?: boolean;
  defaultCountry?: CountryCode;
  placeholder?: string;
}

/**
 * PhoneNumberInput Component with country flags and code selection
 * The country is automatically determined from the phone number value
 */
const PhoneNumberInput = React.forwardRef<
  HTMLInputElement,
  PhoneNumberInputProps
>(
  (
    {
      id,
      value,
      onChange,
      label,
      error,
      containerClassName = '',
      inputClassName = '',
      required = false,
      disabled = false,
      defaultCountry = 'US',
      placeholder = 'Enter your phone number',
      ...rest
    },
    ref
  ) => {
    const phoneInputClass = error ? 'PhoneInput--error' : '';

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

        <div className="relative">
          <ReactPhoneNumberInput
            ref={ref}
            id={id}
            international
            countryCallingCodeEditable={false}
            defaultCountry={defaultCountry}
            value={value || ''}
            onChange={onChange}
            disabled={disabled}
            placeholder={placeholder}
            className={`${phoneInputClass} ${inputClassName}`}
            withCountryCallingCode
            {...rest}
          />
        </div>

        {error && (
          <div className="mt-1.5 flex items-center text-xs text-destructive">
            <AqAlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
            {error}
          </div>
        )}
      </div>
    );
  }
);

PhoneNumberInput.displayName = 'PhoneNumberInput';

export { PhoneNumberInput };
