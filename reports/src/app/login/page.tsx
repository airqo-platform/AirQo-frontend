'use client';
import React, { useState } from 'react';
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa';

import FormComponent from '@/components/forms/auth';
import { Input } from '@/components/ui/input';

const Page = () => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-600">
      <FormComponent btnText="Login">
        <div>
          <Input
            type="email"
            name="email"
            autoComplete="email"
            placeholder="Email Address"
            className="w-full px-4 py-3 rounded-lg shadow-sm focus:outline-none focus:shadow-outline text-gray-600 dark:text-white font-medium"
          />
        </div>
        <div className="relative flex items-center">
          <Input
            autoComplete="current-password"
            type={showPassword ? 'text' : 'password'}
            name="password"
            placeholder="Password"
            className="w-full px-4 py-3 rounded-lg shadow-sm focus:outline-none focus:shadow-outline text-gray-600 dark:text-white font-medium"
          />
          <span className="absolute inset-y-0 right-0 flex items-center pr-3">
            {showPassword ? (
              <FaRegEyeSlash
                className="h-6 text-gray-500 dark:text-gray-400 cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              />
            ) : (
              <FaRegEye
                className="h-6 text-gray-500 dark:text-gray-400 cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              />
            )}
          </span>
        </div>
      </FormComponent>
    </div>
  );
};

export default Page;
