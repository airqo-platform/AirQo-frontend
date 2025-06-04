'use client';

import React, { useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { signIn as _signIn, getSession as _getSession } from 'next-auth/react';
import Link from 'next/link';
import * as Yup from 'yup';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

import { useOrganization } from '../../../../providers/OrganizationProvider';
import AuthLayout from '@/common/components/Organization/AuthLayout';
import Spinner from '@/components/Spinner';
import Toast from '@/components/Toast';
import InputField from '@/common/components/InputField';
import logger from '@/lib/logger';

const loginSchema = Yup.object().shape({
  userName: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string().required('Password is required'),
});

export default function OrganizationLogin() {
  const [error, setErrorState] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    userName: '',
    password: '',
  });
  const router = useRouter();
  const params = useParams();
  const { organization, getDisplayName, canUserRegister, primaryColor } =
    useOrganization();

  const orgSlug = params?.org_slug || 'airqo';

  const handleInputChange = useCallback((field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setErrorState('');
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setLoading(true);
      setErrorState('');

      try {
        // Validate form data
        await loginSchema.validate(formData, { abortEarly: false });

        // Sign in using NextAuth with organization credentials provider
        const result = await _signIn('org-credentials', {
          userName: formData.userName,
          password: formData.password,
          orgSlug: orgSlug,
          redirect: false,
        });

        if (result?.ok) {
          // Get the session after successful login
          const session = await _getSession();

          if (session?.user && session?.accessToken) {
            // Store user data with organization context
            const userData = {
              ...session.user,
              organizationSlug: orgSlug,
              organizationName: organization?.name,
            };

            localStorage.setItem('loggedUser', JSON.stringify(userData));
            localStorage.setItem(
              'activeGroup',
              JSON.stringify({
                _id: session.user.organization,
                organization: session.user.organization,
                long_organization: session.user.long_organization,
              }),
            );

            // Redirect to organization-specific dashboard
            router.push(`/org/${orgSlug}/dashboard`);
          } else {
            throw new Error('Session data is incomplete');
          }
        } else {
          throw new Error(result?.error || 'Authentication failed');
        }
      } catch (err) {
        logger.error('Organization login error:', err);
        setErrorState(err.message || 'Login failed. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    [formData, orgSlug, organization, router],
  );

  const registerPath = canUserRegister() ? `/org/${orgSlug}/register` : null;

  return (
    <AuthLayout
      title={`Sign in to ${getDisplayName()}`}
      subtitle="Access your organization's air quality dashboard"
      backToAirqoPath="/user/login"
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
        <InputField
          label="Email address"
          name="userName"
          type="email"
          value={formData.userName}
          onChange={(value) => handleInputChange('userName', value)}
          required
          placeholder="Enter your email"
          className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-200"
          style={{
            '--tw-ring-color': primaryColor,
            borderColor: error ? '#EF4444' : undefined,
          }}
        />

        <div className="relative">
          <InputField
            label="Password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(value) => handleInputChange('password', value)}
            required
            placeholder="Enter your password"
            className="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-200"
            style={{
              '--tw-ring-color': primaryColor,
              borderColor: error ? '#EF4444' : undefined,
            }}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center transition-colors duration-200 hover:opacity-70"
            onClick={() => setShowPassword(!showPassword)}
            style={{ top: '24px', color: primaryColor }}
          >
            {showPassword ? (
              <FaEyeSlash className="h-4 w-4" />
            ) : (
              <FaEye className="h-4 w-4" />
            )}
          </button>
        </div>

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
            {loading ? <Spinner size="sm" color="white" /> : 'Sign in'}
          </button>
        </div>

        <div className="flex items-center justify-between">
          <Link
            href={`/org/${orgSlug}/forgotPwd`}
            className="text-sm hover:underline transition-colors duration-200 hover:opacity-80"
            style={{ color: primaryColor }}
          >
            Forgot your password?
          </Link>
          {registerPath ? (
            <Link
              href={registerPath}
              className="text-sm font-medium hover:underline transition-colors duration-200 hover:opacity-80"
              style={{ color: primaryColor }}
            >
              Register
            </Link>
          ) : (
            <span className="text-sm text-gray-400">Registration disabled</span>
          )}
        </div>
      </form>
    </AuthLayout>
  );
}
