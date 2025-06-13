'use client';

import React, { useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import * as Yup from 'yup';
import { FaCheckCircle } from 'react-icons/fa';

import { useOrganization } from '@/app/providers/OrganizationProvider';
import AuthLayout from '@/common/components/Organization/AuthLayout';
import { forgotPasswordApi } from '@/core/apis/Account';
import Spinner from '@/components/Spinner';
import Toast from '@/components/Toast';
import InputField from '@/common/components/InputField';
import logger from '@/lib/logger';
import { withOrgAuthRoute } from '@/core/HOC';

const forgotPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
});

const OrganizationForgotPassword = () => {
  const [error, setErrorState] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const params = useParams();
  const { getDisplayName, primaryColor } = useOrganization();

  const orgSlug = params?.org_slug || 'airqo';

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setLoading(true);
      setErrorState('');

      try {
        // Validate email
        await forgotPasswordSchema.validate({ email }, { abortEarly: false });

        // Send forgot password request with organization context
        await forgotPasswordApi({
          email,
          organizationSlug: orgSlug,
        });

        setSuccess(true);
      } catch (err) {
        logger.error('Forgot password error:', err);
        setErrorState(
          err.message || 'Failed to send reset email. Please try again.',
        );
      } finally {
        setLoading(false);
      }
    },
    [email, orgSlug],
  );

  // Show success message
  if (success) {
    return (
      <AuthLayout
        title="Check Your Email"
        subtitle="Password reset instructions sent"
        backToAirqoPath="/user/login"
      >
        <div className="text-center">
          <FaCheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <div className="space-y-4">
            <p className="text-lg text-gray-700">
              We&apos;ve sent password reset instructions to your email address.
            </p>
            <p className="text-sm text-gray-600">
              Please check your inbox and follow the instructions to reset your
              password.
            </p>{' '}
            <div className="pt-4">
              <Link
                href={`/org/${orgSlug}/login`}
                className="inline-flex justify-center py-3 px-6 border border-transparent text-sm font-medium rounded-md text-white transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg"
                style={{
                  backgroundColor: primaryColor,
                  boxShadow: `0 4px 14px 0 ${primaryColor}25`,
                }}
              >
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset Your Password"
      subtitle={`Enter your email to reset your password for ${getDisplayName()}`}
      backToAirqoPath="/user/login"
    >
      {' '}
      <form className="space-y-6" onSubmit={handleSubmit}>
        <InputField
          label="Email Address"
          name="email"
          type="email"
          value={email}
          onChange={setEmail}
          required
          placeholder="Enter your email address"
          className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-200"
          style={{
            '--tw-ring-color': primaryColor,
            borderColor: error ? '#EF4444' : undefined,
          }}
        />

        {error && (
          <Toast
            type="error"
            timeout={5000}
            onClose={() => setErrorState('')}
            message={error}
          />
        )}

        <div>
          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg"
            style={{
              backgroundColor: primaryColor,
              '--tw-ring-color': primaryColor,
              boxShadow: loading ? 'none' : `0 4px 14px 0 ${primaryColor}25`,
            }}
          >
            {loading ? (
              <Spinner size="sm" color="white" />
            ) : (
              'Send Reset Instructions'
            )}
          </button>
        </div>

        <div className="text-center">
          <span className="text-sm text-gray-600">
            Remember your password?{' '}
          </span>
          <Link
            href={`/org/${orgSlug}/login`}
            className="text-sm font-medium hover:underline transition-colors duration-200 hover:opacity-80"
            style={{ color: primaryColor }}
          >
            Sign in
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default withOrgAuthRoute(OrganizationForgotPassword);
