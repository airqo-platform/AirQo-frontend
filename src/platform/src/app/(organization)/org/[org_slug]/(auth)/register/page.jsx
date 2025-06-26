'use client';

import React, { useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import * as Yup from 'yup';
import { FaEye, FaEyeSlash, FaCheckCircle } from 'react-icons/fa';
import ReCAPTCHA from 'react-google-recaptcha';

import { useOrganization } from '@/app/providers/UnifiedGroupProvider';
import AuthLayout from '@/common/components/Organization/AuthLayout';
import { registerUserToOrgApi } from '@/core/apis/Organizations';
import Toast from '@/components/Toast';
import InputField from '@/common/components/InputField';
import { NEXT_PUBLIC_RECAPTCHA_SITE_KEY } from '@/lib/envConstants';
import logger from '@/lib/logger';

import { formatOrgSlug } from '@/core/utils/strings';

const registrationSchema = Yup.object().shape({
  firstName: Yup.string()
    .min(2, 'First name must be at least 2 characters')
    .required('First name is required'),
  lastName: Yup.string()
    .min(2, 'Last name must be at least 2 characters')
    .required('Last name is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /(?=.*[a-z])/,
      'Password must contain at least one lowercase letter',
    )
    .matches(
      /(?=.*[A-Z])/,
      'Password must contain at least one uppercase letter',
    )
    .matches(/(?=.*\d)/, 'Password must contain at least one number')
    .matches(
      /(?=.*[!@#$%^&*])/,
      'Password must contain at least one special character',
    )
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
  phoneNumber: Yup.string()
    .matches(
      /^\+?[1-9]\d{1,14}$/,
      'Please enter a valid phone number (e.g., +256700123456)',
    )
    .required('Phone number is required'),
  jobTitle: Yup.string()
    .min(2, 'Job title must be at least 2 characters')
    .required('Job title is required'),
  recaptchaToken: Yup.string().required(
    'Please complete the reCAPTCHA verification',
  ),
});

const OrganizationRegister = () => {
  const [error, setErrorState] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    jobTitle: '',
    recaptchaToken: '',
  });

  const router = useRouter();
  const params = useParams();
  const { getDisplayName, canUserRegister, requiresApproval, primaryColor } =
    useOrganization();

  const orgSlug = params?.org_slug || 'airqo';

  // Move hooks to the top level, before any conditional returns
  const handleInputChange = useCallback((field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setErrorState('');
  }, []);

  const handleRecaptchaChange = useCallback((token) => {
    setRecaptchaToken(token || '');
    setFormData((prev) => ({
      ...prev,
      recaptchaToken: token || '',
    }));
    setErrorState('');
  }, []);
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setLoading(true);
      setErrorState('');

      try {
        // Update form data with recaptcha token before validation
        const formDataWithRecaptcha = {
          ...formData,
          recaptchaToken,
        };

        // Validate form data
        await registrationSchema.validate(formDataWithRecaptcha, {
          abortEarly: false,
        });

        // Register user to organization
        const userData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          phoneNumber: formData.phoneNumber,
          jobTitle: formData.jobTitle,
          recaptchaToken,
          organizationSlug: orgSlug,
        };

        await registerUserToOrgApi(userData);
        setSuccess(true); // Redirect after successful registration
        setTimeout(() => {
          router.push(`/org/${orgSlug}/login`);
        }, 3000);
      } catch (err) {
        logger.error('Organization registration error:', err);

        // Handle different types of errors
        if (err.errors) {
          // Handle validation errors from API
          const errorMessages = [];
          Object.entries(err.errors).forEach(([field, message]) => {
            if (field === 'email') {
              errorMessages.push(`Email: ${message}`);
            } else if (field === 'password') {
              errorMessages.push(`Password: ${message}`);
            } else if (field === 'recaptchaToken' || field === 'message') {
              errorMessages.push(message);
            } else {
              errorMessages.push(`${field}: ${message}`);
            }
          });
          setErrorState(errorMessages.join('. '));
        } else {
          setErrorState(
            err.message || 'Registration failed. Please try again.',
          );
        }
      } finally {
        setLoading(false);
      }
    },
    [formData, recaptchaToken, orgSlug, router],
  );

  // Show success message
  if (success) {
    return (
      <AuthLayout
        title="Registration Successful!"
        subtitle={`Welcome to ${formatOrgSlug(getDisplayName())}`}
        backToAirqoPath="/user/login"
      >
        <div className="text-center">
          <FaCheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <div className="space-y-4">
            <p className="text-lg text-gray-700">
              Your registration has been submitted successfully!
            </p>
            {requiresApproval() ? (
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-700">
                  Your account is pending approval from the organization{' '}
                  administrator. You&apos;ll receive an email notification once{' '}
                  your account is approved.
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-600">
                You can now sign in to your account.
              </p>
            )}{' '}
            <div className="pt-4">
              <Link
                href={`/org/${orgSlug}/login`}
                className="inline-flex justify-center py-3 px-6 border border-transparent text-sm font-medium rounded-md text-white transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg"
                style={{
                  backgroundColor: primaryColor,
                  boxShadow: `0 4px 14px 0 ${primaryColor}25`,
                }}
              >
                Go to Sign In
              </Link>
            </div>
          </div>
        </div>
      </AuthLayout>
    );
  }

  // Show registration disabled message if not allowed
  if (!canUserRegister()) {
    return (
      <AuthLayout
        title={`Registration Disabled`}
        subtitle={`${formatOrgSlug(getDisplayName())} has disabled public registration`}
        backToAirqoPath="/user/login"
      >
        <div className="text-center space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-center justify-center mb-4">
              <svg
                className="h-12 w-12 text-yellow-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-yellow-800 mb-2">
              Registration Not Available
            </h3>
            <p className="text-sm text-yellow-700 mb-4">
              {formatOrgSlug(getDisplayName())} requires invitation-only access.
              Please contact your organization administrator to request access.
            </p>
            <div className="space-y-3">
              <Link
                href={`/org/${orgSlug}/login`}
                className="inline-flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white transition-colors duration-200"
                style={{ backgroundColor: primaryColor }}
              >
                Go to Sign In
              </Link>
              <div>
                {' '}
                <Link
                  href="/user/login"
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Use main AirQo login instead
                </Link>
              </div>
            </div>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title={`Join ${formatOrgSlug(getDisplayName())}`}
      subtitle="Create your account to access the organization's air quality dashboard"
      backToAirqoPath="/user/login"
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="First Name"
            name="firstName"
            type="text"
            value={formData.firstName}
            onChange={(value) => handleInputChange('firstName', value)}
            required
            placeholder="Enter your first name"
            className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
            style={{
              '--tw-ring-color': primaryColor,
              borderColor: error ? '#EF4444' : undefined,
            }}
          />

          <InputField
            label="Last Name"
            name="lastName"
            type="text"
            value={formData.lastName}
            onChange={(value) => handleInputChange('lastName', value)}
            required
            placeholder="Enter your last name"
            className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
            style={{
              '--tw-ring-color': primaryColor,
              borderColor: error ? '#EF4444' : undefined,
            }}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={(value) => handleInputChange('email', value)}
            required
            placeholder="Enter your email address"
            className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
            style={{
              '--tw-ring-color': primaryColor,
              borderColor: error ? '#EF4444' : undefined,
            }}
          />

          <InputField
            label="Phone Number"
            name="phoneNumber"
            type="tel"
            value={formData.phoneNumber}
            onChange={(value) => handleInputChange('phoneNumber', value)}
            required
            placeholder="Enter your phone number (e.g., +256700123456)"
            className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
            style={{
              '--tw-ring-color': primaryColor,
              borderColor: error ? '#EF4444' : undefined,
            }}
          />
        </div>
        <InputField
          label="Job Title"
          name="jobTitle"
          type="text"
          value={formData.jobTitle}
          onChange={(value) => handleInputChange('jobTitle', value)}
          required
          placeholder="Enter your job title (e.g., Air Quality Researcher)"
          className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
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
            className="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
            style={{
              '--tw-ring-color': primaryColor,
              borderColor: error ? '#EF4444' : undefined,
            }}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={() => setShowPassword(!showPassword)}
            style={{ top: '24px' }}
          >
            {showPassword ? (
              <FaEyeSlash className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            ) : (
              <FaEye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            )}
          </button>
        </div>
        <div className="relative">
          <InputField
            label="Confirm Password"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={(value) => handleInputChange('confirmPassword', value)}
            required
            placeholder="Confirm your password"
            className="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
            style={{
              '--tw-ring-color': primaryColor,
              borderColor: error ? '#EF4444' : undefined,
            }}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            style={{ top: '24px' }}
          >
            {showConfirmPassword ? (
              <FaEyeSlash className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            ) : (
              <FaEye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            )}
          </button>
        </div>
        {/* reCAPTCHA */}
        <div className="flex justify-center">
          {NEXT_PUBLIC_RECAPTCHA_SITE_KEY ? (
            <ReCAPTCHA
              sitekey={NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
              onChange={handleRecaptchaChange}
              onErrored={() =>
                setErrorState('reCAPTCHA error. Please try again.')
              }
              onExpired={() => {
                setRecaptchaToken('');
                setFormData((prev) => ({ ...prev, recaptchaToken: '' }));
              }}
            />
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                reCAPTCHA is not configured. Please contact the administrator.
              </p>
            </div>
          )}
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
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            style={{
              backgroundColor: primaryColor,
              '--tw-ring-color': primaryColor,
            }}
          >
            {loading ? 'Registering...' : 'Create Account'}
          </button>
        </div>{' '}
        <div className="text-center">
          <span className="text-sm text-gray-600">
            Already have an account?{' '}
          </span>
          <Link
            href={`/org/${orgSlug}/login`}
            className="text-sm font-medium hover:underline"
            style={{ color: primaryColor }}
          >
            Sign in
          </Link>
        </div>{' '}
      </form>
    </AuthLayout>
  );
};

export default OrganizationRegister;
