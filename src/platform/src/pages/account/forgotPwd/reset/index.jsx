import React, { useState } from 'react';
import AccountPageLayout from '@/components/Account/Layout';
import Toast from '@/components/Toast';
import Spinner from '@/components/Spinner';
import { useRouter } from 'next/router';
import { resetPasswordApi } from '@/core/apis/Account';
import InputField from '@/components/InputField';
import * as Yup from 'yup';
import ErrorBoundary from '@/components/ErrorBoundary';

const ResetPasswordSchema = Yup.object().shape({
  password: Yup.string().required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
});

const Index = () => {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [toastMessage, setToastMessage] = useState({ message: '', type: '' });
  const { token } = router.query;
  const [loading, setLoading] = useState(false);

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    // Validate using Yup schema
    try {
      await ResetPasswordSchema.validate(
        { password, confirmPassword },
        { abortEarly: false },
      );
    } catch (validationError) {
      const messages = validationError.inner
        .map((err) => err.message)
        .join(', ');
      return setToastMessage({ message: messages, type: 'error' });
    }
    setLoading(true);
    const data = {
      password,
      resetPasswordToken: token,
    };
    try {
      const response = await resetPasswordApi(data);
      setLoading(false);
      if (response.success) {
        setToastMessage({
          message: response.message,
          type: 'success',
        });
        setTimeout(() => {
          router.push('/account/login');
        }, 1000);
      } else {
        setToastMessage({
          message: response.message,
          type: 'error',
        });
      }
    } catch {
      setLoading(false);
      setToastMessage({
        message: 'An error occurred. Please try again',
        type: 'error',
      });
    }
  };

  return (
    <ErrorBoundary name="ResetPassword" feature="User Password Reset">
      <AccountPageLayout
        pageTitle="AirQo Analytics | Forgot Password"
        rightText="What you've built here is so much better for air pollution monitoring than anything else on the market!"
      >
        <div className="w-full">
          <h2 className="text-3xl font-medium text-gray-900 dark:text-white">
            Reset Your Password
          </h2>
          <p className="text-xl font-normal mt-3 text-gray-800 dark:text-gray-300">
            Please enter your new password below. Make sure it&apos;s something
            secure that you can remember.
          </p>
          <form onSubmit={handlePasswordReset}>
            {/* Password Field */}
            <div className="mt-6 relative">
              <InputField
                label="Password"
                type="password"
                placeholder="******"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {/* Confirm Password Field */}
            <div className="mt-6 relative">
              <InputField
                label="Confirm Password"
                type="password"
                placeholder="******"
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <div className="mt-10">
              <button
                style={{ textTransform: 'none' }}
                className="w-full btn rounded-[12px] bg-blue-900 dark:bg-blue-700 text-white text-sm outline-none border-none hover:bg-blue-950 dark:hover:bg-blue-600"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <Spinner width={25} height={25} />
                ) : (
                  'Reset Password'
                )}
              </button>
            </div>
          </form>
        </div>

        {toastMessage.message && (
          <Toast
            type={toastMessage.type}
            timeout={8000}
            message={toastMessage.message}
          />
        )}
      </AccountPageLayout>
    </ErrorBoundary>
  );
};

export default Index;
