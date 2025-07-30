'use client';

import { useState, useEffect } from 'react';
import AccountPageLayout from '@/components/Account/Layout';
import InputField from '@/common/components/InputField';

const IndividualAccountVerification = () => {
  const [email, setEmail] = useState('');

  useEffect(() => {
    const storedEmail = sessionStorage.getItem('registeredUserEmail');
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  return (
    <AccountPageLayout pageTitle="Verify Email | AirQo">
      <div className="w-full">
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-white lg:w-10/12 md:mt-20 lg:mt-2">
          Please confirm your email address
        </h2>
        <p className="text-xl font-normal mt-6 text-gray-600 dark:text-gray-300 lg:w-10/12">
          An email with confirmation instructions was sent to
        </p>
        <div className="mt-6">
          <div className="w-full">
            <InputField
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
    </AccountPageLayout>
  );
};

export default IndividualAccountVerification;
