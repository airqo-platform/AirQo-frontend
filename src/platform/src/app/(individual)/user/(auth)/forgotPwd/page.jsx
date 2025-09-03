'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';
import AccountPageLayout from '@/components/Account/Layout';
import CustomToast, {
  TOAST_TYPES,
} from '@/common/components/Toast/CustomToast';
import { forgotPasswordApi } from '@/core/apis/Account';
import InputField from '@/common/components/InputField';
import Button from '@/common/components/Button';
import * as Yup from 'yup';
import ErrorBoundary from '@/components/ErrorBoundary';

const ForgotPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
});

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');

  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleForgotPWD = useCallback(
    async (e) => {
      e.preventDefault();

      if (!isMountedRef.current || loading) return;

      setLoading(true);

      try {
        await ForgotPasswordSchema.validate({ email }, { abortEarly: false });
      } catch (validationError) {
        if (isMountedRef.current) {
          setLoading(false);
          CustomToast({
            message: validationError.errors?.[0] || 'Validation error',
            type: TOAST_TYPES.ERROR,
            duration: 8000,
          });
        }
        return;
      }

      try {
        const data = { email };
        const response = await forgotPasswordApi(data);

        if (!isMountedRef.current) return;

        if (response?.success === true) {
          setEmail('');
          CustomToast({
            message:
              response.message || 'Password reset link sent successfully!',
            type: TOAST_TYPES.SUCCESS,
            duration: 8000,
          });
        } else {
          CustomToast({
            message:
              response?.message ||
              'The provided email does not belong to a registered account. Please check the email and try again.',
            type: TOAST_TYPES.ERROR,
            duration: 8000,
          });
        }
      } catch (err) {
        if (!isMountedRef.current) return;

        console.error('Forgot password API error:', err);
        CustomToast({
          message: 'An unexpected error occurred. Please try again later.',
          type: TOAST_TYPES.ERROR,
          duration: 8000,
        });
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    },
    [email, loading],
  );

  const isFormValid = email.trim().length > 0;

  return (
    <ErrorBoundary name="ForgotPassword" feature="Password Reset">
      <AccountPageLayout pageTitle="AirQo Analytics | Forgot Password">
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
                id="forgot-password-email"
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. greta.nagawa@gmail.com"
                required
              />
            </div>
            <div className="mt-10">
              <Button
                type="submit"
                loading={loading}
                disabled={!isFormValid || loading}
                variant={isFormValid && !loading ? 'filled' : 'disabled'}
                className="w-full rounded-[12px] text-sm"
              >
                {loading ? 'Sending...' : 'Submit'}
              </Button>
            </div>
          </form>
          <div className="mt-8 w-full flex justify-center">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Don&apos;t have an account?{' '}
              </span>
              <span className="text-sm font-medium text-primary dark:text-primary/80 hover:underline">
                <Link href="/user/login">Login</Link>
              </span>
            </div>
          </div>
        </div>
      </AccountPageLayout>
    </ErrorBoundary>
  );
};

export default ForgotPassword;
