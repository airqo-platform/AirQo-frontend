import React, { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import Link from 'next/link';
import jwt_decode from 'jwt-decode';

import AccountPageLayout from '@/components/Account/Layout';
import Spinner from '@/components/Spinner';
import Toast from '@/components/Toast';
import VisibilityOffIcon from '@/icons/Account/visibility_off.svg';
import VisibilityOnIcon from '@/icons/Account/visibility_on.svg';

import {
  setUserData,
  setUserInfo,
  setSuccess,
  setError,
} from '@/lib/store/services/account/LoginSlice';
import { postUserLoginDetails, getUserDetails } from '@/core/apis/Account';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const UserLogin = () => {
  const [error, setErrorState] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordType, setPasswordType] = useState('password');

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

  const togglePasswordVisibility = useCallback(() => {
    setPasswordType((prevType) =>
      prevType === 'password' ? 'text' : 'password',
    );
  }, []);

  const handleInputChange = useCallback(
    (key, value) => {
      dispatch(setUserData({ key, value }));
    },
    [dispatch],
  );

  return (
    <AccountPageLayout
      pageTitle="AirQo Analytics | Login"
      rightText="What you've built here is so much better for air pollution monitoring than anything else on the market!"
    >
      <div className="w-full">
        <h2 className="text-3xl text-black-700 font-medium">
          Let&apos;s get started
        </h2>
        <p className="text-xl text-black-700 font-normal mt-3">
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
            <div className="w-full">
              <label htmlFor="email" className="text-sm text-grey-300">
                Email Address
              </label>
              <div className="mt-2 w-full">
                <input
                  id="email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  data-testid="username"
                  aria-required="true"
                  aria-label="Email address"
                  onChange={(e) =>
                    handleInputChange('userName', e.target.value)
                  }
                  placeholder="e.g. greta.nagawa@gmail.com"
                  className="input w-full p-3 rounded-[4px] border-gray-300 focus:outline-none focus:ring-0 placeholder-gray-300 focus:border-green-500"
                  required
                />
              </div>
            </div>
          </div>
          <div className="mt-6">
            <div className="w-full">
              <label htmlFor="password" className="text-sm text-grey-300">
                Password
              </label>
              <div className="mt-2 w-full relative">
                <input
                  id="password"
                  type={passwordType}
                  name="password"
                  autoComplete="current-password"
                  data-testid="password"
                  aria-required="true"
                  aria-label="Password"
                  onChange={(e) =>
                    handleInputChange('password', e.target.value)
                  }
                  placeholder="******"
                  className="input w-full p-3 rounded-[4px] border-gray-300 focus:outline-none focus:ring-0 placeholder-gray-300 focus:border-green-500"
                  required
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer"
                  aria-label={
                    passwordType === 'password'
                      ? 'Show password'
                      : 'Hide password'
                  }
                >
                  {passwordType === 'password' ? (
                    <VisibilityOffIcon aria-hidden="true" />
                  ) : (
                    <VisibilityOnIcon
                      className="stroke-1 stroke-svg-green"
                      aria-hidden="true"
                    />
                  )}
                </button>
              </div>
            </div>
          </div>
          <div className="mt-10">
            <button
              data-testid="login-btn"
              className="w-full btn bg-blue-900 rounded-[12px] text-white text-sm outline-none border-none hover:bg-blue-950"
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
            <span className="text-sm text-grey-300">
              Don&apos;t have an account?{' '}
            </span>
            <span className="text-sm text-blue-900 font-medium">
              <Link href="/account/creation">Register here</Link>
            </span>
          </div>
        </div>
        <div className="mt-8 flex justify-center w-full">
          <div>
            <span className="text-sm text-blue-900 font-medium">
              <Link href="/account/forgotPwd">Forgot Password</Link>
            </span>
          </div>
        </div>
      </div>
    </AccountPageLayout>
  );
};

export default UserLogin;
