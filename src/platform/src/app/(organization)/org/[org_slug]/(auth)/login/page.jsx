'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import * as Yup from 'yup';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

import AuthLayout from '@/common/components/Organization/AuthLayout';
import InputField from '@/common/components/InputField';
import Spinner from '@/components/Spinner';
import Toast from '@/components/Toast';
import ErrorBoundary from '@/components/ErrorBoundary';
import LoginSetupLoader from '@/common/components/LoginSetupLoader';
import { useOrganization } from '@/app/providers/OrganizationProvider';

const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string().required('Password is required'),
});

export default function OrganizationLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const params = useParams();
  const router = useRouter();
  const orgSlug = params.org_slug;
  const { getDisplayName, logo } = useOrganization();

  useEffect(() => {
    // Check if user is already authenticated
    getSession().then((session) => {
      if (session && session.user) {
        // Ensure user has organization data before redirecting
        if (session.user.organization) {
          router.replace(`/org/${orgSlug}/dashboard`);
        }
      }
    });
  }, [router, orgSlug]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setIsLoading(true);
      setError('');

      // Validate form data
      try {
        await loginSchema.validate({ email, password }, { abortEarly: false });
      } catch (validationError) {
        const messages = validationError.inner
          .map((err) => err.message)
          .join(', ');
        setIsLoading(false);
        return setError(messages);
      }

      try {
        const result = await signIn('org-credentials', {
          userName: email, // NextAuth org provider expects userName
          password,
          orgSlug,
          redirect: false,
        });

        if (result?.error) {
          setError('Invalid credentials. Please try again.');
        } else if (result?.ok) {
          // Show setup screen while we prepare the organization dashboard
          setIsSettingUp(true);

          // Verify session was created correctly
          const session = await getSession();
          if (!session?.user) {
            setError(
              "Authentication succeeded but session wasn't created. Please try again.",
            );
            setIsLoading(false);
            setIsSettingUp(false);
            return;
          }

          // Brief delay to show the organization-specific loader before redirect
          setTimeout(() => {
            setIsSettingUp(false); // Reset loader state
            router.replace(`/org/${orgSlug}/dashboard`); // Use replace instead of push to avoid redirect loops
          }, 1000); // Increase timeout to ensure session is fully established
        }
      } catch (error) {
        setError(error.message || 'An error occurred. Please try again.');
      } finally {
        setIsLoading(false);
      }
    },
    [email, password, orgSlug, router],
  );

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(!showPassword);
  }, [showPassword]);

  // Show organization-specific setup screen when preparing dashboard
  if (isSettingUp) {
    return (
      <LoginSetupLoader
        organizationName={getDisplayName()}
        organizationLogo={logo}
        isOrganization={true}
      />
    );
  }

  return (
    <ErrorBoundary
      name="OrganizationLogin"
      feature="Organization Authentication"
    >
      <AuthLayout
        title={`Sign in to ${orgSlug}`}
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
                value={email}
                onChange={setEmail}
                required
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
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn border-none bg-blue-600 dark:bg-blue-700 rounded-lg text-white text-sm hover:bg-blue-700 dark:hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: 'var(--org-primary, #2563eb)',
                }}
              >
                {isLoading ? <Spinner width={25} height={25} /> : 'Sign In'}
              </button>
            </div>
          </form>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 text-sm">
            <span>
              Don&apos;t have an account?
              <Link
                href={`/org/${orgSlug}/register`}
                className="font-medium text-blue-600 ml-2 dark:text-blue-400"
                style={{ color: 'var(--org-primary, #2563eb)' }}
              >
                Register
              </Link>
            </span>
            <Link
              href={`/org/${orgSlug}/forgotPwd`}
              className="font-medium text-blue-600 dark:text-blue-400"
              style={{ color: 'var(--org-primary, #2563eb)' }}
            >
              Forgot Password
            </Link>
          </div>
        </div>
      </AuthLayout>
    </ErrorBoundary>
  );
}
