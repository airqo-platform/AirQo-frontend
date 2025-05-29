'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AccountPageLayout from '@/components/Account/Layout';
import Toast from '@/components/Toast';
import Spinner from '@/components/Spinner';
import { forgotPasswordApi } from '@/core/apis/Account';
import InputField from '@/components/InputField';
import * as Yup from 'yup';
import ErrorBoundary from '@/components/ErrorBoundary';

const ForgotPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
});

const ForgotPassword = () => {
  const version = 3;
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [toastMessage, setToastMessage] = useState({ message: '', type: '' });

  const handleForgotPWD = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate input using Yup
    try {
      await ForgotPasswordSchema.validate({ email });
    } catch (validationError) {
      setLoading(false);
      return setToastMessage({
        message: validationError.message,
        type: 'error',
      });
    }

    try {
      const data = { email, version };
      const response = await forgotPasswordApi(data);
      if (response.success === true) {
        setLoading(false);
        setEmail('');
        return setToastMessage({
          message: response.message,
          type: 'success',
        });
      }
      setLoading(false);
      return setToastMessage({
        message:
          'The provided email does not belong to a registered account, please try again',
        type: 'error',
      });
    } catch {
      setLoading(false);
      setEmail('');
      return setToastMessage({
        message: 'An error occurred. Please try again',
        type: 'error',
      });
    }
  };

  return (
    <ErrorBoundary name="ForgotPassword" feature="Password Reset">
      <AccountPageLayout
        pageTitle="AirQo Analytics | Forgot Password"
        rightText="What you've built here is so much better for air pollution monitoring than anything else on the market!"
      >
        <div className="w-full">
          <h2 className="text-3xl font-medium text-gray-900 dark:text-white">
            Forgot Your Password?
          </h2>
          <p className="text-xl mt-3 font-normal text-gray-800 dark:text-gray-300">
            Enter your email address and we will send you a link to reset your
            password.
          </p>
          <form onSubmit={handleForgotPWD}>
            <div className="mt-6">
              <InputField
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. greta.nagawa@gmail.com"
                required
              />
            </div>
            <div className="mt-10">
              <button
                style={{ textTransform: 'none' }}
                className="w-full btn rounded-[12px] bg-blue-600 dark:bg-blue-700 text-white text-sm outline-none border-none hover:bg-blue-950 dark:hover:bg-blue-600"
                type="submit"
                disabled={loading}
              >
                {loading ? <Spinner width={25} height={25} /> : 'Submit'}
              </button>
            </div>
          </form>
          <div className="mt-8 w-full flex justify-center">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-300">
                Don&apos;t have an account?{' '}
              </span>
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                <Link href="/account/login">Login</Link>
              </span>
            </div>
          </div>
        </div>

        {toastMessage.message && (
          <Toast
            type={toastMessage.type}
            timeout={8000}
            message={toastMessage.message}
            clearData={() => setToastMessage({ message: '', type: '' })}
          />
        )}
      </AccountPageLayout>
    </ErrorBoundary>
  );
};

export default ForgotPassword;
