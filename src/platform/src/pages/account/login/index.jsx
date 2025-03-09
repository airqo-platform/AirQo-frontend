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
import { getIndividualUserPreferences } from '@/lib/store/services/account/UserDefaultsSlice';
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
        const { token } = await retryWithDelay(() =>
          postUserLoginDetails(userData),
        );

        localStorage.setItem('token', token);
        const decoded = jwt_decode(token);

        const response = await retryWithDelay(() =>
          getUserDetails(decoded._id, token),
        );
        const user = response.users[0];

        console.info('user', user);

        if (!user.groups[0]?.grp_title) {
          throw new Error(
            'Server error. Contact support to add you to the AirQo Organisation',
          );
        }

        localStorage.setItem('loggedUser', JSON.stringify(user));

        const preferencesResponse = await retryWithDelay(() =>
          dispatch(getIndividualUserPreferences({ identifier: user._id })),
        );

        console.info('preferencesResponse', preferencesResponse);
        let activeGroup;
        if (preferencesResponse.payload.success) {
          const preferences = preferencesResponse.payload.preferences;
          // Try to get the group from the first preference if exists and valid
          if (preferences.length > 0 && preferences[0].group_id) {
            activeGroup = user.groups.find(
              (group) => group._id === preferences[0].group_id,
            );
          }
        }
        // Fallback to group with title 'airqo'
        if (!activeGroup) {
          activeGroup = user.groups.find(
            (group) => group.grp_title.toLowerCase() === 'airqo',
          );
        }
        // If still not set, throw an error to alert support
        if (!activeGroup) {
          throw new Error(
            'No active group found. Contact support to add you to the AirQo Organisation',
          );
        }

        console.info('activeGroup', activeGroup);
        localStorage.setItem('activeGroup', JSON.stringify(activeGroup));

        dispatch(setUserInfo(user));
        dispatch(setSuccess(true));
        router.push('/Home');
      } catch (error) {
        dispatch(setSuccess(false));
        const errorMessage =
          error.response?.data?.message ||
          (error.response?.status === 401
            ? 'Invalid credentials. Please check your email and password.'
            : 'Something went wrong, please try again');
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

  const handleInputChange = (key, value) => {
    dispatch(setUserData({ key, value }));
  };

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
        <form onSubmit={handleLogin} data-testid="login-form">
          <div className="mt-6">
            <div className="w-full">
              <div className="text-sm text-grey-300">Email Address</div>
              <div className="mt-2 w-full">
                <input
                  type="email"
                  data-testid="username"
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
              <div className="text-sm text-grey-300">Password</div>
              <div className="mt-2 w-full relative">
                <input
                  data-testid="password"
                  onChange={(e) =>
                    handleInputChange('password', e.target.value)
                  }
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
