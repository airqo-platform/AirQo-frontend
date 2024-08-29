import React, { useState, useEffect, useCallback } from 'react';
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
  setUserName,
  setUserPassword,
  setUserInfo,
  setSuccess,
  setFailure,
} from '@/lib/store/services/account/LoginSlice';
import { getIndividualUserPreferences } from '@/lib/store/services/account/UserDefaultsSlice';
import { postUserLoginDetails, getUserDetails } from '@/core/apis/Account';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const UserLogin = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordType, setPasswordType] = useState('password');

  const dispatch = useDispatch();
  const router = useRouter();
  const { userData } = useSelector((state) => state.login);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && userData) {
      router.push('/Home');
    }
  }, [userData, router]);

  const retryWithDelay = async (fn, retries = MAX_RETRIES) => {
    try {
      return await fn();
    } catch (error) {
      if (retries > 0 && error.response && error.response.status === 429) {
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
      setError('');

      try {
        const { token } = await retryWithDelay(() =>
          postUserLoginDetails(userData),
        );
        localStorage.setItem('token', token);
        const decoded = jwt_decode(token);
        const response = await retryWithDelay(() =>
          getUserDetails(decoded._id, token),
        );
        const user = response.users[0];

        if (!user.groups[0]?.grp_title) {
          throw new Error(
            'Server error. Contact support to add you to the AirQo Organisation',
          );
        }

        localStorage.setItem('loggedUser', JSON.stringify(user));

        const preferencesResponse = await retryWithDelay(() =>
          dispatch(getIndividualUserPreferences(user._id)),
        );
        if (preferencesResponse.payload.success) {
          const preferences = preferencesResponse.payload.preferences;
          const activeGroup = preferences[0]?.group_id
            ? user.groups.find((group) => group._id === preferences[0].group_id)
            : user.groups.find((group) => group.grp_title === 'airqo');
          localStorage.setItem('activeGroup', JSON.stringify(activeGroup));
        }

        dispatch(setUserInfo(user));
        dispatch(setSuccess(true));
        router.push('/Home');
      } catch (error) {
        dispatch(setSuccess(false));
        let errorMessage = 'Something went wrong, please try again';
        if (error.response) {
          switch (error.response.status) {
            case 429:
              errorMessage = 'Too many requests. Please try again later.';
              break;
            case 401:
              errorMessage =
                'Invalid credentials. Please check your email and password.';
              break;
            default:
              errorMessage = error.response.data.message || errorMessage;
          }
        }
        dispatch(setFailure(errorMessage));
        setError(errorMessage);
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

  return (
    <AccountPageLayout
      pageTitle="AirQo Analytics | Login"
      rightText="What you've built here is so much better for air pollution monitoring than anything else on the market!"
    >
      <div className="w-full">
        <h2 className="text-3xl text-black-700 font-medium">
          Let's get started
        </h2>
        <p className="text-xl text-black-700 font-normal mt-3">
          Get access to air quality analytics across Africa
        </p>
        {error && <Toast type="error" timeout={8000} message={error} />}
        <form onSubmit={handleLogin} data-testid="login-form">
          <div className="mt-6">
            <div className="w-full">
              <div className="text-sm text-grey-300">Email Address</div>
              <div className="mt-2 w-full">
                <input
                  type="email"
                  data-testid="username"
                  onChange={(e) => dispatch(setUserName(e.target.value))}
                  placeholder="e.g. greta.nagawa@gmail.com"
                  className="input w-full p-3 rounded-[4px] border-gray-300 focus:outline-none focus:ring-0 placeholder-gray-300 focus:border-green-500"
                  required
                />
              </div>
            </div>
          </div>
          <div className="mt-6">
            <div className="w-full">
              <div className="text-sm text-grey-300">Password</div>
              <div className="mt-2 w-full relative">
                <input
                  data-testid="password"
                  onChange={(e) => dispatch(setUserPassword(e.target.value))}
                  type={passwordType}
                  placeholder="******"
                  className="input w-full p-3 rounded-[4px] border-gray-300 focus:outline-none focus:ring-0 placeholder-gray-300 focus:border-green-500"
                  required
                />
                <div
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer"
                  onClick={togglePasswordVisibility}
                >
                  {passwordType === 'password' ? (
                    <VisibilityOffIcon />
                  ) : (
                    <VisibilityOnIcon className="stroke-1 stroke-svg-green" />
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="mt-10">
            <button
              data-testid="login-btn"
              className="w-full btn bg-blue-900 rounded-[12px] text-white text-sm outline-none border-none hover:bg-blue-950"
              type="submit"
              disabled={loading}
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
              Don't have an account?{' '}
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
