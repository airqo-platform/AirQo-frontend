'use client';

import { useState, useEffect } from 'react';
import AuthLayout from '@/shared/layouts/AuthLayout';
import { Input } from '@/shared/components/ui';
import Link from 'next/link';

const IndividualAccountVerification = () => {
  const [email, setEmail] = useState('');

  useEffect(() => {
    const storedEmail = sessionStorage.getItem('registeredUserEmail');
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  return (
    <AuthLayout
      pageTitle="Verify Email | AirQo"
      heading="Please confirm your email address"
      subtitle="An email with confirmation instructions was sent to"
    >
      <div className="w-full">
        <div className="mt-6">
          <div className="w-full">
            <Input
              label="Email Address"
              type="email"
              value={email}
              disabled
              className="text-lg"
              containerClassName="w-full"
            />
          </div>
        </div>
        <div className="mt-6 flex items-center">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Not seeing the email? Please check your spam folder.
          </span>
        </div>
      </div>

      <div className="w-full mt-6 text-center">
        <p className="text-sm">
          Already have an account?{' '}
          <Link
            href="/user/login"
            className="text-blue-600 hover:text-blue-800"
          >
            Log in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default IndividualAccountVerification;
