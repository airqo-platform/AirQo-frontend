import React, { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import Link from 'next/link';
import jwt_decode from 'jwt-decode';
import * as Yup from 'yup';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

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
import {
  postUserLoginDetails,
  getUserDetails,
  recentUserPreferencesAPI,
} from '@/core/apis/Account';
import { GOOGLE_AUTH_URL } from '@/core/urls/authentication';
import { logger } from '@/lib/logger';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

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
  const router = useRouter();
  const { userData } = useSelector((state) => state.login);

  const retryWithDelay = async (fn, retries = MAX_RETRIES) => {
    try {
      return await fn();
    } catch (err) {
      if (retries > 0 && err.response?.status === 429) {
        await new Promise((res) => setTimeout(res, RETRY_DELAY));
        return retryWithDelay(fn, retries - 1);
      }
      throw err;
    }
  };

  const handleLogin = useCallback(
    async (e) => {
      e.preventDefault();
      setLoading(true);
      setErrorState('');

      // 1️⃣ Validate credentials
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
        // 2️⃣ Authenticate → get JWT
        const { token } = await retryWithDelay(() =>
          postUserLoginDetails(userData),
        );
        localStorage.setItem('token', token);
        const decoded = jwt_decode(token);

        // 3️⃣ Fetch full user object
        const userRes = await retryWithDelay(() =>
          getUserDetails(decoded._id, token),
        );
        const user = userRes.users[0];
        if (!user.groups?.length) {
          throw new Error(
            'Server error. Contact support to add you to the AirQo Organisation',
          );
        }

        // 4️⃣ Fetch the most recent preference
        let activeGroup = user.groups[0]; // default
        try {
          const prefRes = await retryWithDelay(() =>
            recentUserPreferencesAPI(user._id),
          );
          if (prefRes.success && prefRes.preference) {
            const { group_id } = prefRes.preference;
            const matched = user.groups.find((g) => g._id === group_id);
            if (matched) activeGroup = matched;
          }
        } catch {
          // swallow and keep default
        }

        // 5️⃣ Persist & dispatch
        localStorage.setItem('loggedUser', JSON.stringify(user));
        localStorage.setItem('activeGroup', JSON.stringify(activeGroup));

        dispatch(setUserInfo(user));
        dispatch(setSuccess(true));
        router.push('/Home');
      } catch (err) {
        dispatch(setSuccess(false));
        const errorMessage =
          err.response?.data?.message ||
          (err.response?.status === 401
            ? 'Invalid credentials. Please check your email and password.'
            : err.message || 'Something went wrong, please try again');
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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleGoogleLogin = async () => {
    try {
      // Redirect to Google auth URL
      window.location.href = GOOGLE_AUTH_URL;
    } catch (error) {
      logger.error('Google login error:', error);
    }
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
                type="submit"
                disabled={loading}
              >
                {loading ? <Spinner width={25} height={25} /> : 'Login'}
              </button>

              <button
                data-testid="google-login-btn"
                className="w-full btn border-blue-900 rounded-[12px] text-white text-sm outline-none border mt-2"
                disabled={loading}
                onClick={handleGoogleLogin}
              >
                {loading ? (
                  <Spinner data-testid="spinner" width={25} height={25} />
                ) : (
                  'Login with Google'
                )}
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
