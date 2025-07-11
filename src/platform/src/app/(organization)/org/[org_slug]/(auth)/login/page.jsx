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
import Toast from '@/components/Toast';
import ErrorBoundary from '@/components/ErrorBoundary';
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
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const params = useParams();
  const { getDisplayName, primaryColor } = useOrganization();
  const orgSlug = params.org_slug;

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setIsLoading(true);
      setError('');

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
        return setError(messages);
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
          throw new Error(result.error);
        }

        if (result?.ok) {
          // Force session refresh after successful login
          const session = await getSession();

          if (session?.user && session?.accessToken) {
            // Force NextAuth to update the session context immediately
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new window.Event('focus'));
            }
          } else {
            throw new Error('Session data is incomplete');
          }
        } else {
          throw new Error('Login failed without specific error');
        }
      } catch (err) {
        logger.error('Organization login error:', err);

        let errorMessage = 'Something went wrong, please try again';

        if (err.message) {
          // Handle specific error messages
          if (
            err.message.includes('Invalid credentials') ||
            err.message.includes('Authentication failed') ||
            err.message.includes('HTTP 401')
          ) {
            errorMessage =
              'Invalid email or password. Please check your credentials.';
          } else if (
            err.message.includes('Network Error') ||
            err.message.includes('fetch')
          ) {
            errorMessage =
              'Network error. Please check your connection and try again.';
          } else {
            errorMessage = err.message;
          }
        }

        setError(errorMessage);
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
          {error && <Toast type="error" timeout={8000} message={error} />}
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
