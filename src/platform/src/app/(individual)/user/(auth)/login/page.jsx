'use client';

import React, { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { signIn as _signIn, getSession as _getSession } from 'next-auth/react';
import Link from 'next/link';
import * as Yup from 'yup';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

import AccountPageLayout from '@/components/Account/Layout';
import Toast from '@/components/Toast';
import InputField from '@/common/components/InputField';

import { setUserData } from '@/lib/store/services/account/LoginSlice';
import ErrorBoundary from '@/components/ErrorBoundary';
import logger from '@/lib/logger';

const loginSchema = Yup.object().shape({
  userName: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string().required('Password is required'),
});

const UserLogin = () => {
  const [error, setErrorState] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.login);
  const handleLogin = useCallback(
    async (e) => {
      e.preventDefault();
      setLoading(true);
      setErrorState('');

      // Get form data
      const formData = {
        userName: userData.userName?.trim() || '',
        password: userData.password || '',
      };

      // Validate credentials
      try {
        await loginSchema.validate(formData, { abortEarly: false });
      } catch (validationError) {
        const messages = validationError.inner
          .map((err) => err.message)
          .join(', ');
        setLoading(false);
        return setErrorState(messages);
      }

      try {
        logger.info('Attempting login with NextAuth...');

        // Use NextAuth signIn
        const result = await _signIn('credentials', {
          userName: formData.userName,
          password: formData.password,
          redirect: false,
        });

        logger.info('NextAuth signIn result:', result);

        if (result?.error) {
          throw new Error(result.error);
        }

        if (result?.ok) {
          logger.info('Login successful, waiting for session...');

          // Force session refresh after successful login
          const session = await _getSession();
          logger.info('Session after login:', session);

          if (session?.user && session?.accessToken) {
            logger.info(
              'Session validated, HOC will handle setup and redirect',
            );

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
        logger.error('Login error:', err);

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

        setErrorState(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [userData],
  );

  const handleInputChange = useCallback(
    (key, value) => {
      dispatch(setUserData({ key, value }));
    },
    [dispatch],
  );
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

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
          <form onSubmit={handleLogin} noValidate>
            <div className="mt-6">
              <InputField
                label="Email Address"
                type="email"
                placeholder="e.g. greta.nagawa@gmail.com"
                value={userData.userName || ''}
                onChange={(value) => handleInputChange('userName', value)}
                required
              />
            </div>
            <div className="mt-6">
              <div className="relative">
                <InputField
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="******"
                  value={userData.password || ''}
                  onChange={(value) => handleInputChange('password', value)}
                  required
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
                className="w-full btn border-none bg-blue-600 dark:bg-blue-700 rounded-lg text-white text-sm hover:bg-blue-700 dark:hover:bg-blue-800"
                disabled={loading}
                type="submit"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </div>
          </form>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 text-sm">
            <span>
              Don&apos;t have an account?
              <Link
                href="/user/creation/individual/register"
                className="font-medium text-blue-600 ml-2 dark:text-blue-400"
              >
                Register
              </Link>
            </span>
            <Link
              href="/user/forgotPwd"
              className="font-medium text-blue-600 dark:text-blue-400"
            >
              Forgot Password
            </Link>
          </div>
        </div>
      </AccountPageLayout>
    </ErrorBoundary>
  );
};

export default UserLogin;
