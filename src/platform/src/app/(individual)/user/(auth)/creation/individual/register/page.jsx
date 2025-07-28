'use client';

import { useState, useEffect } from 'react';
import AccountPageLayout from '@/components/Account/Layout';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import InputField from '@/common/components/InputField';
import CustomToast from '@/common/components/Toast/CustomToast';
import ErrorBoundary from '@/components/ErrorBoundary';
import { AqEye, AqEyeOff } from '@airqo/icons-react';
import { postUserCreationDetails } from '@/core/apis/Account';

// Move static regex outside component to prevent recreation on every render
const PASSWORD_REGEX =
  /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&]).{8,}$/;

const IndividualAccountRegistration = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [checked, setChecked] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordWordErrors, setPasswordWordErrors] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  const userExists = searchParams.get('userExists');
  const userEmail = searchParams.get('userEmail');

  // Pre-fill email and redirect if user already exists
  useEffect(() => {
    if (userEmail) {
      setEmail(userEmail);
    }
    if (userExists === 'true') {
      router.push('/user/login');
    }
  }, [userExists, userEmail, router]);

  const validatePassword = (pwd) => {
    setPasswordWordErrors(!PASSWORD_REGEX.test(pwd));
  };

  const toggleChecked = () => {
    setChecked((prev) => !prev);
  };

  // Function to toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);

    try {
      // Prepare payload matching the expected structure for postUserCreationDetails
      const payload = {
        email,
        firstName,
        lastName,
        password,
        category: 'individual',
      };

      // Call the API directly
      const response = await postUserCreationDetails(payload);

      if (response?.success === true) {
        // Store the email in sessionStorage upon successful registration
        try {
          sessionStorage.setItem('registeredUserEmail', email);
        } catch (storageError) {
          console.warn(
            'Failed to store email in sessionStorage:',
            storageError,
          );
        }

        CustomToast({
          message:
            'Account created successfully! Please verify your email to continue.',
          type: 'success',
        });
        // Redirect to verification page
        router.push('/user/creation/individual/verify-email');
      } else {
        // Handle API errors - extract message from response
        let errorMessage =
          'Registration failed. Please check your details and try again.';

        // Check for a general message first
        if (response?.message) {
          errorMessage = response.message;
        }
        // Fallback to the first error's message if it's an array
        else if (
          Array.isArray(response?.errors) &&
          response.errors.length > 0
        ) {
          errorMessage = response.errors[0]?.message || errorMessage;
        }
        // Fallback to a specific field error if it's an object
        else if (
          response?.errors &&
          typeof response.errors === 'object' &&
          !Array.isArray(response.errors)
        ) {
          const firstFieldErrorKey = Object.keys(response.errors)[0];
          if (firstFieldErrorKey && response.errors[firstFieldErrorKey]) {
            errorMessage = response.errors[firstFieldErrorKey];
          }
        }

        CustomToast({
          message: errorMessage,
          type: 'error',
        });
      }
    } catch (err) {
      // Handle network errors or unexpected exceptions
      console.error('Registration error:', err);
      CustomToast({
        message:
          'An unexpected error occurred. Please check your connection and try again later.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate form validity for button state
  const isFormValid =
    firstName.trim().length >= 3 &&
    lastName.trim().length >= 2 &&
    email.trim().length > 0 &&
    email.includes('@') &&
    password.trim().length > 0 &&
    !passwordWordErrors &&
    checked;

  return (
    <ErrorBoundary
      name="IndividualAccountRegistration"
      feature="User Account Registration"
    >
      <AccountPageLayout
        childrenHeight={'lg:h-[680]'}
        childrenTop={'mt-16'}
        pageTitle={'Create Account | AirQo'}
      >
        <div className="w-full">
          <h2 className="text-3xl font-medium text-gray-900 dark:text-white">
            Create your individual account
          </h2>
          <p className="text-xl font-normal mt-3 text-gray-800 dark:text-gray-300">
            Get access to air quality analytics across Africa
          </p>

          <form onSubmit={handleSubmit}>
            {/* Name Fields */}
            <div className="mt-6 flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <InputField
                  id="firstName"
                  label="First name"
                  type="text"
                  placeholder="Enter your first name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  error={
                    firstName && firstName.trim().length < 3
                      ? 'Must contain at least 3 letters'
                      : ''
                  }
                />
              </div>
              <div className="flex-1">
                <InputField
                  id="lastName"
                  label="Last name"
                  type="text"
                  placeholder="Enter your last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  error={
                    lastName && lastName.trim().length < 2
                      ? 'Must contain at least 2 letters'
                      : ''
                  }
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="mt-6">
              <InputField
                id="email"
                label="Email address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                error={
                  email.length >= 3 && !email.includes('@')
                    ? 'Please provide a valid email address'
                    : ''
                }
              />
            </div>

            {/* Password Field with Show/Hide Toggle */}
            <div className="mt-6">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    validatePassword(e.target.value);
                  }}
                  placeholder="Create password"
                  required
                  className={`input input-bordered w-full pr-10 ${passwordWordErrors && password ? 'input-error' : ''}`}
                />
                {/* Toggle Button for Password Visibility */}
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-gray-400"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <AqEyeOff /> : <AqEye />}{' '}
                </button>
              </div>
              {/* Display password error message below the input */}
              {passwordWordErrors && password && (
                <p className="mt-1 text-xs text-error">
                  Password must be at least 8 characters and contain an
                  uppercase letter, lowercase letter, a number, and a special
                  character (#?!@$%^&)
                </p>
              )}
              <span
                id="password-requirements"
                className="text-gray-400 text-xs block mt-1"
              >
                Must be at least 8 characters, include uppercase, lowercase,
                number, and special character (#?!@$%^&)
              </span>
            </div>

            {/* Terms & Conditions Checkbox */}
            <div className="mt-6 flex flex-row justify-start items-center">
              <input
                id="termsCheckbox"
                type="checkbox"
                className="h-5 w-5 mt-0.5 rounded border border-gray-300 dark:border-gray-600 checked:bg-primary focus:border-primary/50 cursor-pointer"
                checked={checked}
                onChange={toggleChecked}
                required
                aria-describedby="termsText"
              />
              <label htmlFor="termsCheckbox" className="ml-3 block">
                {' '}
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  I agree to the{' '}
                  <a
                    href="https://airqo.net/legal/terms-of-service"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a
                    href="https://airqo.net/legal/privacy-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    Privacy Policy
                  </a>
                </p>
              </label>
            </div>

            {/* Submit Button */}
            <div className="mt-10 mb-3">
              <button
                type="submit"
                style={{ textTransform: 'none' }}
                className={`w-full btn dark:text-white rounded-[12px] text-sm outline-none border-none transition-colors duration-200 ${
                  isFormValid
                    ? 'text-white bg-primary hover:bg-primary/90'
                    : 'btn-disabled bg-white cursor-not-allowed text-gray-500 dark:text-gray-400'
                }`}
                disabled={loading || !isFormValid}
              >
                {loading ? 'Registering...' : 'Continue'}
              </button>
            </div>

            {/* Already have an account */}
            <div className="mt-8 flex justify-center w-full">
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Already have an account?
                </span>
                <span className="text-sm font-medium text-primary dark:text-primary/80">
                  {' '}
                  <Link href="/user/login">Log in</Link>
                </span>
              </div>
            </div>
          </form>
        </div>
      </AccountPageLayout>
    </ErrorBoundary>
  );
};

export default IndividualAccountRegistration;
