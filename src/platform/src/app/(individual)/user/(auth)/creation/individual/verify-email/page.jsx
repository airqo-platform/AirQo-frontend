'use client';

import React, { useState } from 'react';
import AccountPageLayout from '@/components/Account/Layout';
import { useDispatch, useSelector } from 'react-redux';
import { createUser } from '@/lib/store/services/account/CreationSlice';
import Toast from '@/components/Toast';
import InputField from '@/common/components/InputField';

const IndividualAccountVerification = () => {
  const userData = useSelector((state) => state.creation.userData);
  const errors = useSelector((state) => state.creation.errors);
  const success = useSelector((state) => state.creation.success);
  const [verificationErrors, setVerificationErrors] = useState(false);
  const dispatch = useDispatch();

  const handleSubmit = async () => {
    setVerificationErrors(false);
    try {
      const res = await dispatch(createUser(userData));
      if (!success) {
        setVerificationErrors(true);
      }
      return res;
    } catch (err) {
      return err;
    }
  };

  return (
    <AccountPageLayout pageTitle="Verify Email | AirQo">
      {verificationErrors && (
        <Toast
          type="error"
          timeout={5000}
          message={`${
            errors.email ||
            errors.message ||
            errors.password ||
            errors.firstName ||
            errors.lastName
          }`}
        />
      )}
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
              value={userData.email}
              disabled
              className="text-lg"
              containerClassName="w-full"
            />
          </div>
        </div>
        <div className="mt-6">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Not seeing the email?
          </span>
          <span
            className="text-sm font-medium text-blue-600 dark:text-primary/40 hover:cursor-pointer"
            onClick={handleSubmit}
          >
            {' '}
            Resend
          </span>
        </div>
      </div>
    </AccountPageLayout>
  );
};

export default IndividualAccountVerification;
