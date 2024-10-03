'use client';
import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa';

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

interface CustomInputFieldProps {
  name: string;
  type: string;
  autoComplete: string;
  placeholder: string;
  label: string;
}

const CustomInputField: React.FC<CustomInputFieldProps> = ({
  name,
  type,
  autoComplete,
  placeholder,
  label,
}) => {
  const { control } = useFormContext();
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <div
              className={`${type === 'password' ? 'relative items-center flex' : 'block'}`}
            >
              <Input
                type={type === 'password' && showPassword ? 'text' : type}
                autoComplete={autoComplete}
                placeholder={placeholder}
                className="w-full px-4 py-3 rounded-lg shadow-sm focus:outline-none focus:shadow-outline text-gray-600 dark:text-white font-medium"
                {...field}
              />
              {type === 'password' && (
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 dark:text-white"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
                </button>
              )}
            </div>
          </FormControl>
          <FormMessage className="text-red-500 dark:text-red-400" />
        </FormItem>
      )}
    />
  );
};

export default CustomInputField;
