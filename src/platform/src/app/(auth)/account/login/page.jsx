'use client';

import React, { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { signIn as _signIn, getSession as _getSession } from 'next-auth/react';
import Link from 'next/link';
import * as Yup from 'yup';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

import AccountPageLayout from '@/components/Account/Layout';
import Spinner from '@/components/Spinner';
import Toast from '@/components/Toast';
import InputField from '@/components/InputField';
import LoginSetupLoader from '@/components/LoginSetupLoader';

import { setUserData } from '@/lib/store/services/account/LoginSlice';
import ErrorBoundary from '@/components/ErrorBoundary';
import { setupUserAfterLogin } from '@/core/utils/setupUser';
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
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const router = useRouter();
  const { userData } = useSelector((state) => state.login);

  const handleLogin = useCallback(
    async (e) => {
      e.preventDefault();
      setLoading(true);
      setErrorState('');

      // Validate credentials
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
        // Use NextAuth signIn
        const result = await _signIn('credentials', {
          userName: userData.userName,
          password: userData.password,
          redirect: false,
        });

        if (result?.error) {
          throw new Error(result.error);
        }

        if (result?.ok) {
          // Show setup screen while we fetch additional required data
          setIsSettingUp(true);

          // Get the session after successful login
          const session = await _getSession();

          if (session?.user && session?.accessToken) {
            try {
              // Setup user with the session data
              await setupUserAfterLogin(session, dispatch);

              // Navigate to home page after setup is complete
              router.push('/Home');
            } catch (setupError) {
              setIsSettingUp(false);
              throw setupError;
            }
          } else {
            throw new Error('Session data is incomplete');
          }
        }
      } catch (err) {
        setIsSettingUp(false);
        const errorMessage =
          err.response?.data?.message ||
          (err.response?.status === 401
            ? 'Invalid credentials. Please check your email and password.'
            : err.message || 'Something went wrong, please try again');
        setErrorState(errorMessage);
        logger.error('Login error:', err);
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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Show setup screen when fetching additional user data
  if (isSettingUp) {
    return <LoginSetupLoader />;
  }

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
                onChange={(e) => handleInputChange('userName', e.target.value)}
                required
              />
            </div>
            <div className="mt-6">
              <div className="relative">
                <InputField
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="******"
                  onChange={(e) =>
                    handleInputChange('password', e.target.value)
                  }
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
                {loading ? <Spinner width={25} height={25} /> : 'Login'}
              </button>
            </div>
          </form>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 text-sm">
            <span>
              Don&apos;t have an account?
              <Link
                href="/account/creation"
                className="font-medium text-blue-600 ml-2 dark:text-blue-400"
              >
                Register
              </Link>
            </span>
            <Link
              href="/account/forgotPwd"
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
