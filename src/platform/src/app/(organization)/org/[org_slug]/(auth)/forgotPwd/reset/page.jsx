'use client';

import React, { useState, useRef } from 'react';
import Button from '@/common/components/Button';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import * as Yup from 'yup';
import Link from 'next/link';
import ReCAPTCHA from 'react-google-recaptcha';

import { useOrganizationSafe } from '@/app/providers/UnifiedGroupProvider';
import AuthLayout from '@/common/components/Organization/AuthLayout';
import { resetPasswordApi } from '@/core/apis/Organizations';
import Toast from '@/common/components/Toast';
import PasswordInputWithToggle from '@/common/components/PasswordInputWithToggle';
import {
  useMultiplePasswordVisibility,
  useLoadingState,
} from '@/core/hooks/useCommonStates';
import logger from '@/lib/logger';
import { NEXT_PUBLIC_RECAPTCHA_SITE_KEY } from '@/lib/envConstants';

import { formatOrgSlug } from '@/core/utils/strings';

const ResetPasswordSchema = Yup.object().shape({
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
});

const OrganizationResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { loading, startLoading, stopLoading } = useLoadingState(false);
  const { passwordVisibility, togglePasswordVisibility } =
    useMultiplePasswordVisibility({
      password: false,
      confirmPassword: false,
    });
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const recaptchaRef = useRef(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const { getDisplayName, primaryColor } = useOrganizationSafe();

  const token = searchParams.get('token');
  const orgSlug = params?.org_slug || 'airqo';
  const handleSubmit = async (e) => {
    e.preventDefault();
    startLoading();
    setError('');

    try {
      // Validate passwords
      await ResetPasswordSchema.validate(
        { password, confirmPassword },
        { abortEarly: false },
      );

      if (!token) {
        setError('Invalid or missing reset token');
        stopLoading();
        return;
      }

      // Validate reCAPTCHA
      if (!recaptchaToken) {
        setError('Please complete the reCAPTCHA verification');
        stopLoading();
        return;
      }

      // Reset password with organization context
      const response = await resetPasswordApi({
        token,
        password,
        confirmPassword,
        organizationSlug: orgSlug,
        recaptchaToken,
      });

      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push(`/org/${orgSlug}/login`);
        }, 3000);
      } else {
        setError(response.message || 'Failed to reset password');
      }
    } catch (err) {
      logger.error('Reset password error:', err);
      if (err.inner) {
        // Validation errors
        const messages = err.inner.map((error) => error.message).join(', ');
        setError(messages);
      } else {
        setError(err.message || 'An error occurred. Please try again.');
      }
    } finally {
      stopLoading();
      // Reset reCAPTCHA
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
        setRecaptchaToken(null);
      }
    }
  };

  if (success) {
    return (
      <AuthLayout>
        <div className="text-center">
          <div className="mb-4">
            <div
              className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
              style={{ backgroundColor: primaryColor || '#135DFF' }}
            >
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Password Reset Successfully
          </h2>
          <p className="text-gray-600 mb-6">
            Your password has been reset successfully for{' '}
            {formatOrgSlug(getDisplayName())}. You will be redirected to the
            login page shortly.
          </p>
          <Link
            href={`/org/${orgSlug}/login`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white shadow-sm hover:opacity-90 transition-opacity"
            style={{ backgroundColor: primaryColor || '#135DFF' }}
          >
            Continue to Login
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Reset your password
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          for {formatOrgSlug(getDisplayName())}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && <Toast message={error} type="error" />}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <PasswordInputWithToggle
              id="password"
              label="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              showPassword={passwordVisibility.password}
              onToggleVisibility={() => togglePasswordVisibility('password')}
              required
              placeholder="Enter your new password"
            />

            <PasswordInputWithToggle
              id="confirmPassword"
              label="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              showPassword={passwordVisibility.confirmPassword}
              onToggleVisibility={() =>
                togglePasswordVisibility('confirmPassword')
              }
              required
              placeholder="Confirm your new password"
            />

            <div>
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
                onChange={setRecaptchaToken}
                onExpired={() => setRecaptchaToken(null)}
                onError={() => setRecaptchaToken(null)}
              />
            </div>

            <div>
              <Button
                type="submit"
                loading={loading}
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: loading
                    ? '#e5e7eb'
                    : primaryColor || '#135DFF',
                  color: loading ? '#222' : undefined,
                  focusRingColor: primaryColor || '#135DFF',
                }}
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <div className="text-center">
              <Link
                href={`/org/${orgSlug}/login`}
                className="font-medium hover:underline"
                style={{ color: primaryColor || '#135DFF' }}
              >
                Back to login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default OrganizationResetPassword;
