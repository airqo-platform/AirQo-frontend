'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import AccountPageLayout from '@/components/Account/Layout';
import CustomToast, {
  TOAST_TYPES,
} from '@/common/components/Toast/CustomToast';
import { useRouter, useSearchParams } from 'next/navigation';
import { resetPasswordApi } from '@/core/apis/Account';
import InputField from '@/common/components/InputField';
import Button from '@/common/components/Button';
import * as Yup from 'yup';
import ErrorBoundary from '@/components/ErrorBoundary';

const ResetPasswordSchema = Yup.object().shape({
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&]).{8,}$/,
      'Password must contain an uppercase letter, lowercase letter, a number, and a special character (#?!@$%^&)',
    )
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
});

const ResetPassword = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const token = searchParams.get('token');
  const [loading, setLoading] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handlePasswordReset = useCallback(
    async (e) => {
      e.preventDefault();

      if (!isMountedRef.current || loading || !token) return;

      setLoading(true);

      try {
        await ResetPasswordSchema.validate(
          { password, confirmPassword },
          { abortEarly: false },
        );
      } catch (validationError) {
        if (isMountedRef.current) {
          setLoading(false);
          const messages = validationError.inner
            .map((err) => err.message)
            .join(' ');
          CustomToast({
            message: messages,
            type: TOAST_TYPES.ERROR,
            duration: 8000,
          });
        }
        return;
      }

      const data = {
        password,
        resetPasswordToken: token,
      };

      try {
        const response = await resetPasswordApi(data);

        if (!isMountedRef.current) return;

        if (response?.success) {
          CustomToast({
            message: response.message || 'Password reset successfully!',
            type: TOAST_TYPES.SUCCESS,
            duration: 8000,
          });
          setTimeout(() => {
            if (isMountedRef.current) {
              router.push('/user/login');
            }
          }, 2000);
        } else {
          CustomToast({
            message:
              response?.message ||
              'Failed to reset password. The link may be invalid or expired.',
            type: TOAST_TYPES.ERROR,
            duration: 8000,
          });
        }
      } catch (err) {
        if (!isMountedRef.current) return;

        console.error('Reset password API error:', err);
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
    [password, confirmPassword, token, loading, router],
  );

  // Basic check for form completion (Yup handles detailed validation)
  const isFormValid = password.length > 0 && confirmPassword.length > 0;

  return (
    <ErrorBoundary name="ResetPassword" feature="User Password Reset">
      <AccountPageLayout pageTitle="AirQo Analytics | Reset Password">
        <div className="w-full">
          <h2 className="text-3xl font-medium text-gray-900 dark:text-white">
            Reset Your Password
          </h2>
          <p className="text-xl font-normal mt-3 text-gray-800 dark:text-gray-300">
            Please enter your new password below. Make sure it&apos;s something
            secure that you can remember.
          </p>
          <form onSubmit={handlePasswordReset}>
            <div className="mt-6">
              <InputField
                id="reset-password"
                label="Password"
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="mt-6">
              <InputField
                id="reset-confirm-password"
                label="Confirm Password"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <div className="mt-10">
              <Button
                type="submit"
                loading={loading}
                disabled={!isFormValid || loading || !token}
                variant={
                  isFormValid && !loading && token ? 'filled' : 'disabled'
                }
                className="w-full text-sm"
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </Button>
            </div>
          </form>
        </div>
      </AccountPageLayout>
    </ErrorBoundary>
  );
};

export default ResetPassword;
