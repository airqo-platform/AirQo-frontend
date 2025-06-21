'use client';

import React, { useState, useEffect } from 'react';
import AccountPageLayout from '@/components/Account/Layout';
import Link from 'next/link';
import { useDispatch } from 'react-redux';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  createUser,
  setUserFirstName,
  setUserLastName,
  setUserPassword,
  setUserEmail,
} from '@/lib/store/services/account/CreationSlice';
import Spinner from '@/components/Spinner';
import InputField from '@/common/components/InputField';
import Toast from '@/components/Toast';
import ErrorBoundary from '@/components/ErrorBoundary';

const IndividualAccountRegistration = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [checked, setChecked] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordWordErrors, setPasswordWordErrors] = useState(false);
  const passwordRegex = new RegExp(
    '^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&]).{8,}$',
  );

  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const userExists = searchParams.get('userExists');
  const userEmail = searchParams.get('userEmail');
  const [loading, setLoading] = useState(false);
  const [creationErrors, setCreationErrors] = useState({
    state: false,
    message: '',
  });

  useEffect(() => {
    if (userEmail) {
      setEmail(userEmail);
    }
    if (userExists === 'true') {
      router.push('/user/login');
    }
  }, [userExists, userEmail, router]);

  const validatePassword = (pwd) => {
    if (passwordRegex.test(pwd)) {
      setPasswordWordErrors(false);
    } else {
      setPasswordWordErrors(true);
    }
  };

  const toggleChecked = () => {
    setChecked((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Dispatch values to Redux store for later use
    dispatch(setUserEmail(email));
    dispatch(setUserFirstName(firstName));
    dispatch(setUserLastName(lastName));
    dispatch(setUserPassword(password));
    setCreationErrors({ state: false, message: '' });

    try {
      const response = await dispatch(
        createUser({
          email,
          firstName,
          lastName,
          password,
          category: 'individual',
        }),
      );
      if (!response.payload.success) {
        setCreationErrors({
          state: true,
          message: response.payload.errors,
        });
      } else {
        router.push('/user/creation/individual/verify-email');
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

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
          {creationErrors.state && (
            <Toast
              type={'error'}
              timeout={8000}
              message={`${
                creationErrors.message.email ||
                creationErrors.message.message ||
                creationErrors.message.password ||
                creationErrors.message.firstName ||
                creationErrors.message.lastName
              }`}
            />
          )}
          <form onSubmit={handleSubmit}>
            {/* Name Fields */}
            <div className="mt-6 flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <InputField
                  label="First name"
                  type="text"
                  placeholder="Enter your name"
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  error={
                    firstName && firstName.length < 3
                      ? 'Must contain at least 3 letters'
                      : ''
                  }
                />
              </div>
              <div className="flex-1">
                <InputField
                  label="Last name"
                  type="text"
                  placeholder="Enter your name"
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  error={
                    lastName && lastName.length < 2
                      ? 'Must contain at least 2 letters'
                      : ''
                  }
                />
              </div>
            </div>
            {/* Email Field */}
            <div className="mt-6">
              <InputField
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
            {/* Password Field */}
            <div className="mt-6">
              <InputField
                label="Password"
                type="password"
                placeholder="Create password"
                onChange={(e) => {
                  setPassword(e.target.value);
                  validatePassword(e.target.value);
                }}
                required
                error={
                  passwordWordErrors
                    ? 'Password must be at least 8 characters and contain an uppercase letter, lowercase letter, a number, and a special character (#?!@$%^&)'
                    : ''
                }
              />
              <span
                id="password-requirements"
                className="text-gray-400 text-sm"
              >
                Must be at least 8 characters
              </span>
            </div>
            {/* Terms & Conditions Checkbox */}
            <div className="mt-6 flex flex-row items-center">
              <input
                type="checkbox"
                className="h-6 w-6 rounded border border-gray-300 dark:border-gray-600 checked:bg-primary focus:border-primary/50 cursor-pointer"
                onChange={() => toggleChecked()}
                required
              />
              <div className="ml-3">
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
              </div>
            </div>
            {/* Submit Button */}
            <div className="mt-10 mb-3">
              <button
                type="submit"
                style={{ textTransform: 'none' }}
                className={`w-full btn dark:text-white rounded-[12px] text-sm outline-none border-none ${
                  firstName &&
                  lastName &&
                  email &&
                  password &&
                  !passwordWordErrors &&
                  checked
                    ? 'text-white bg-blue-600 hover:bg-blue-500'
                    : 'btn-disabled bg-white'
                }`}
                disabled={
                  loading ||
                  !firstName ||
                  !lastName ||
                  !email ||
                  !password ||
                  passwordWordErrors ||
                  !checked
                }
              >
                {loading ? <Spinner width={25} height={25} /> : 'Continue'}
              </button>
            </div>
            {/* Already have an account */}
            <div className="mt-8 flex justify-center w-full">
              <div>
                <span className="text-sm text-gray-500">
                  Already have an account?
                </span>
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
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
