import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import * as Yup from 'yup';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

import AccountPageLayout from '@/components/Account/Layout';
import Spinner from '@/components/Spinner';
import Toast from '@/components/Toast';
import InputField from '@/components/InputField';

import ErrorBoundary from '@/components/ErrorBoundary';
import { registerUser, verifyOrganizationSlug } from '@/core/apis/Account';
import { logger } from '@/lib/logger';

const registerSchema = Yup.object().shape({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
  role: Yup.string().required('Role is required'),
});

export async function getServerSideProps(context) {
  const { org_slug } = context.params;

  try {
    // Verify organization slug and get org details
    const orgDetails = await verifyOrganizationSlug(org_slug);

    if (!orgDetails?.success) {
      return {
        redirect: {
          destination: '/account/register',
          permanent: false,
        },
      };
    }

    return {
      props: {
        orgDetails: orgDetails.organization,
      },
    };
  } catch (error) {
    logger.error('Error fetching organization details:', error);
    return {
      redirect: {
        destination: '/account/register',
        permanent: false,
      },
    };
  }
}

const OrganizationRegister = ({ orgDetails }) => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const router = useRouter();
  const { org_slug } = router.query;

  const handleRegister = useCallback(
    async (e) => {
      e.preventDefault();
      setLoading(true);
      setError('');
      setSuccessMessage('');

      const formData = {
        firstName: e.target.firstName.value,
        lastName: e.target.lastName.value,
        email: e.target.email.value,
        password: e.target.password.value,
        confirmPassword: e.target.confirmPassword.value,
        role: e.target.role.value,
        organization: org_slug,
      };

      try {
        // Validate form data
        await registerSchema.validate(formData, { abortEarly: false });

        // Register user
        const response = await registerUser(formData);

        if (response.success) {
          setSuccessMessage(
            'Registration successful! Please check your email for verification instructions.',
          );
          setTimeout(() => {
            router.push(`/account/login/${org_slug}`);
          }, 3000);
        } else {
          throw new Error(
            response.message || 'Registration failed. Please try again.',
          );
        }
      } catch (err) {
        if (err.inner) {
          // Yup validation error
          const messages = err.inner.map((e) => e.message).join(', ');
          setError(messages);
        } else {
          // API error
          const errorMessage =
            err.response?.data?.message ||
            err.message ||
            'Registration failed. Please try again.';
          setError(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    },
    [org_slug, router],
  );

  const togglePasswordVisibility = (field) => {
    if (field === 'password') {
      setShowPassword(!showPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  return (
    <ErrorBoundary
      name="OrganizationRegister"
      feature="Organization Registration"
    >
      <AccountPageLayout
        pageTitle={`${orgDetails.name} - Register | AirQo Analytics`}
        rightText="Join your organization's private air quality dashboard"
      >
        <div className="w-full">
          <div className="flex justify-center mb-8">
            {orgDetails.logo && (
              <img
                src={orgDetails.logo}
                alt={`${orgDetails.name} logo`}
                className="max-h-16 object-contain"
              />
            )}
          </div>
          <h2 className="text-3xl font-medium text-gray-900 dark:text-white text-center">
            Join {orgDetails.name}
          </h2>
          <p className="text-xl font-normal mt-3 text-gray-700 dark:text-gray-300 text-center">
            Register to access your organization&apos;s air quality dashboard
          </p>
          {error && <Toast type="error" timeout={8000} message={error} />}
          {successMessage && (
            <Toast type="success" timeout={8000} message={successMessage} />
          )}
          <form onSubmit={handleRegister} noValidate className="space-y-6 mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="First Name"
                name="firstName"
                type="text"
                placeholder="John"
                required
              />
              <InputField
                label="Last Name"
                name="lastName"
                type="text"
                placeholder="Doe"
                required
              />
            </div>

            <InputField
              label="Email Address"
              name="email"
              type="email"
              placeholder="john.doe@organization.com"
              required
            />

            <div className="relative">
              <InputField
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="******"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-10 text-gray-500 hover:text-gray-700 focus:outline-none dark:text-gray-400 dark:hover:text-gray-300"
                onClick={() => togglePasswordVisibility('password')}
              >
                {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
              </button>
            </div>

            <div className="relative">
              <InputField
                label="Confirm Password"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="******"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-10 text-gray-500 hover:text-gray-700 focus:outline-none dark:text-gray-400 dark:hover:text-gray-300"
                onClick={() => togglePasswordVisibility('confirm')}
              >
                {showConfirmPassword ? (
                  <FaEyeSlash size={20} />
                ) : (
                  <FaEye size={20} />
                )}
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Role *
              </label>
              <select
                name="role"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              >
                <option value="">Select a role</option>
                <option value="technician">Technician</option>
                <option value="analyst">Analyst</option>
                <option value="developer">Developer</option>
              </select>
            </div>

            <button
              className="w-full btn border-none bg-blue-600 dark:bg-blue-700 rounded-lg text-white text-sm hover:bg-blue-700 dark:hover:bg-blue-800 py-3"
              type="submit"
              disabled={loading}
            >
              {loading ? <Spinner width={25} height={25} /> : 'Register'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link
                href={`/account/login/${org_slug}`}
                className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
              >
                Sign in
              </Link>
            </span>
          </div>
        </div>
      </AccountPageLayout>
    </ErrorBoundary>
  );
};

export default OrganizationRegister;
