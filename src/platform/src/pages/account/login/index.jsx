import React, { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import Link from 'next/link';
import jwt_decode from 'jwt-decode';
import * as Yup from 'yup';

import AccountPageLayout from '@/components/Account/Layout';
import Spinner from '@/components/Spinner';
import Toast from '@/components/Toast';
import InputField from '@/components/InputField';

import {
  setUserData,
  setUserInfo,
  setSuccess,
  setError,
} from '@/lib/store/services/account/LoginSlice';
import ErrorBoundary from '@/components/ErrorBoundary';
import { postUserLoginDetails, getUserDetails } from '@/core/apis/Account';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

// Yup schema for login
const loginSchema = Yup.object().shape({
  userName: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string().required('Password is required'),
});

const UserLogin = () => {
  const [error, setErrorState] = useState('');
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const router = useRouter();
  const { userData } = useSelector((state) => state.login);

  const retryWithDelay = async (fn, retries = MAX_RETRIES) => {
    try {
      return await fn();
    } catch (error) {
      if (retries > 0 && error.response?.status === 429) {
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
        return retryWithDelay(fn, retries - 1);
      }
      throw error;
    }
  };

  const handleLogin = useCallback(
    async (e) => {
      e.preventDefault();
      setLoading(true);
      setErrorState('');

      // Validate input using Yup
      try {
        await loginSchema.validate(userData, { abortEarly: false });
      } catch (validationError) {
        const messages = validationError.inner
          .map((err) => err.message)
          .join(', ');
        setLoading(false);
        return setErrorState(messages);
      }

      try {
        // Get JWT token from login endpoint
        const { token } = await retryWithDelay(() =>
          postUserLoginDetails(userData),
        );
        localStorage.setItem('token', token);
        const decoded = jwt_decode(token);

        // Get user details with token
        const response = await retryWithDelay(() =>
          getUserDetails(decoded._id, token),
        );
        const user = response.users[0];

        // Validate that user has at least one group
        if (!user.groups || user.groups.length === 0) {
          throw new Error(
            'Server error. Contact support to add you to the AirQo Organisation',
          );
        }

        // Store user in localStorage
        localStorage.setItem('loggedUser', JSON.stringify(user));

        // Set active group from the first group in the groups array
        const activeGroup = user.groups[0];
        localStorage.setItem('activeGroup', JSON.stringify(activeGroup));

        // Update Redux state
        dispatch(setUserInfo(user));
        dispatch(setSuccess(true));

        // Redirect to home page
        router.push('/Home');
      } catch (error) {
        dispatch(setSuccess(false));
        const errorMessage =
          error.response?.data?.message ||
          (error.response?.status === 401
            ? 'Invalid credentials. Please check your email and password.'
            : error.message || 'Something went wrong, please try again');
        dispatch(setError(errorMessage));
        setErrorState(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [userData, dispatch, router],
  );

  const handleInputChange = useCallback(
    (key, value) => {
      dispatch(setUserData({ key, value }));
    },
    [dispatch],
  );

  return (
    <ErrorBoundary name="UserLogin" feature="User Authentication">
      <AccountPageLayout
        pageTitle="AirQo Analytics | Login"
        rightText="What you've built here is so much better for air pollution monitoring than anything else on the market!"
      >
        <div className="w-full">
          <h2 className="text-3xl font-medium text-gray-900 dark:text-white">
            Let&apos;s get started
          </h2>
          <p className="text-xl font-normal mt-3 text-gray-700 dark:text-gray-300">
            Get access to air quality analytics across Africa
          </p>
          {error && <Toast type="error" timeout={8000} message={error} />}
          <form
            onSubmit={handleLogin}
            data-testid="login-form"
            aria-label="Login form"
            noValidate
          >
            <div className="mt-6">
              <InputField
                label="Email Address"
                type="email"
                placeholder="e.g. greta.nagawa@gmail.com"
                onChange={(e) => handleInputChange('userName', e.target.value)}
                required
              />
            </div>
            <div className="mt-6 relative">
              <InputField
                label="Password"
                type="password"
                placeholder="******"
                onChange={(e) => handleInputChange('password', e.target.value)}
                required
              />
            </div>
            <div className="mt-10">
              <button
                data-testid="login-btn"
                className="w-full btn bg-blue-900 dark:bg-blue-700 rounded-lg text-white text-sm outline-none border-none hover:bg-blue-950 dark:hover:bg-blue-800"
                type="submit"
                disabled={loading}
                aria-label={loading ? 'Logging in...' : 'Login'}
              >
                {loading ? (
                  <Spinner data-testid="spinner" width={25} height={25} />
                ) : (
                  'Login'
                )}
              </button>
            </div>
          </form>
          <div className="mt-8 w-full flex justify-center">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-300">
                Don&apos;t have an account?{' '}
              </span>
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                <Link href="/account/creation">Register here</Link>
              </span>
            </div>
          </div>
          <div className="mt-8 flex justify-center w-full">
            <div>
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                <Link href="/account/forgotPwd">Forgot Password</Link>
              </span>
            </div>
          </div>
        </div>
      </AccountPageLayout>
    </ErrorBoundary>
  );
};

export default UserLogin;
