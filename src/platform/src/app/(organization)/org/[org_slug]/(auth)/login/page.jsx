'use client';

import { useState, useCallback } from 'react';
import Button from '@/common/components/Button';
import { signIn, getSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import * as Yup from 'yup';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

import { useOrganization } from '@/app/providers/UnifiedGroupProvider';
import AuthLayout from '@/common/components/Organization/AuthLayout';
import InputField from '@/common/components/InputField';
import ErrorBoundary from '@/common/components/ErrorBoundary';
import NotificationService from '@/core/utils/notificationService';
import logger from '@/lib/logger';
import { formatOrgSlug } from '@/core/utils/strings';

const loginSchema = Yup.object().shape({
  userName: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string().required('Password is required'),
});

const OrganizationLogin = () => {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const params = useParams();
  const { getDisplayName, primaryColor } = useOrganization();
  const orgSlug = params.org_slug;

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setIsLoading(true);

      // Validate form data
      try {
        await loginSchema.validate(
          { userName, password },
          { abortEarly: false },
        );
      } catch (validationError) {
        const messages = validationError.inner
          .map((err) => err.message)
          .join(', ');
        setIsLoading(false);
        // Use status code 422 for validation errors
        NotificationService.error(422, messages);
        return;
      }

      try {
        // Use NextAuth signIn - orgSlug is captured for validation but not sent to backend
        const result = await signIn('credentials', {
          userName: userName, // NextAuth provider expects userName
          password,
          orgSlug, // Captured for organization validation after login
          redirect: false,
        });

        if (result?.error) {
          // Parse the error message to extract status code information
          let statusCode = 401; // Default to unauthorized
          let customMessage = null;

          if (
            result.error.includes('Invalid credentials') ||
            result.error.includes('Authentication failed') ||
            result.error.includes('HTTP 401')
          ) {
            statusCode = 401;
            customMessage = null; // Use default status message
          } else if (
            result.error.includes('Network Error') ||
            result.error.includes('fetch') ||
            result.error.includes('connection')
          ) {
            statusCode = 503;
            customMessage = null; // Use default status message
          } else {
            statusCode = 500;
            customMessage = result.error;
          }

          NotificationService.error(statusCode, customMessage);
          return;
        }

        if (result?.ok) {
          // Force session refresh after successful login
          const session = await getSession();

          if (session?.user && session?.accessToken) {
            // Force NextAuth to update the session context immediately
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new window.Event('focus'));
            }
            NotificationService.success(200, 'Login successful!');
          } else {
            NotificationService.error(500, 'Session data is incomplete');
            return;
          }
        } else {
          NotificationService.error(500, 'Login failed without specific error');
        }
      } catch (err) {
        logger.error('Organization login error:', err);

        // Use status-based notification for unexpected errors
        NotificationService.error(
          500,
          err.message || 'Something went wrong, please try again',
        );
      } finally {
        setIsLoading(false);
      }
    },
    [userName, password, orgSlug],
  );

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(!showPassword);
  }, [showPassword]);

  return (
    <ErrorBoundary
      name="OrganizationLogin"
      feature="Organization Authentication"
    >
      <AuthLayout
        title={`Sign in to ${formatOrgSlug(getDisplayName())}`}
        subtitle="Access your organization's air quality analytics dashboard"
      >
        <div className="w-full">
          {/* Toast notifications now handled globally by CustomToast via NotificationService */}
          <form onSubmit={handleSubmit} noValidate>
            <div className="mt-6">
              <InputField
                label="Email Address"
                type="email"
                placeholder="e.g. user@organization.com"
                value={userName}
                onChange={setUserName}
                required
                primaryColor={primaryColor}
                disabled={isLoading}
              />
            </div>
            <div className="mt-6">
              <div className="relative">
                <InputField
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="******"
                  value={password}
                  onChange={setPassword}
                  primaryColor={primaryColor}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute right-3 top-10 text-gray-500 hover:text-gray-700 focus:outline-none dark:text-gray-400 dark:hover:text-gray-300"
                  onClick={togglePasswordVisibility}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <FaEyeSlash size={20} />
                  ) : (
                    <FaEye size={20} />
                  )}
                </button>
              </div>
            </div>
            <div className="mt-10">
              <Button
                type="submit"
                disabled={isLoading}
                loading={isLoading}
                className="w-full text-sm transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg"
                style={{
                  backgroundColor: isLoading ? '#d1d5db' : primaryColor,
                  color: isLoading ? '#222' : undefined,
                  boxShadow: isLoading
                    ? 'none'
                    : `0 4px 14px 0 ${primaryColor}25`,
                }}
                aria-busy={isLoading}
              >
                {isLoading ? 'Logging in...' : 'Sign In'}
              </Button>
            </div>
          </form>
        </div>
      </AuthLayout>
    </ErrorBoundary>
  );
};

export default OrganizationLogin;
