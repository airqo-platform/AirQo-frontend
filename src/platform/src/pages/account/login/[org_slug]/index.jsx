import React, { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
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
  setUserInfo,
  setSuccess,
  setError,
} from '@/lib/store/services/account/LoginSlice';
import ErrorBoundary from '@/components/ErrorBoundary';
import {
  postUserLoginDetails,
  getUserDetails,
  recentUserPreferencesAPI,
  verifyOrganizationSlug,
} from '@/core/apis/Account';
import { GOOGLE_AUTH_URL } from '@/core/urls/authentication';
import { logger } from '@/lib/logger';

// Constants for retry logic
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const loginSchema = Yup.object().shape({
  userName: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string().required('Password is required'),
});

export async function getServerSideProps(context) {
  const { org_slug } = context.params;

  try {
    // Verify organization slug and get org details
    const orgDetails = await verifyOrganizationSlug(org_slug);

    if (!orgDetails?.success) {
      return {
        redirect: {
          destination: '/account/login',
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
        destination: '/account/login',
        permanent: false,
      },
    };
  }
}

const OrganizationLogin = ({ orgDetails }) => {
  const [error, setErrorState] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const router = useRouter();
  const { org_slug } = router.query;

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

      const formData = {
        userName: e.target.userName.value,
        password: e.target.password.value,
        organization: org_slug,
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
        // Authenticate → get JWT
        const loginResponse = await retryWithDelay(() =>
          postUserLoginDetails(formData),
        );
        const { token } = loginResponse;
        localStorage.setItem('token', token);
        const decoded = jwt_decode(token);

        // Verify user belongs to organization
        if (decoded.organization !== org_slug) {
          throw new Error('You do not have access to this organization');
        }

        // Fetch full user object
        const userRes = await retryWithDelay(() =>
          getUserDetails(decoded._id, token),
        );
        const user = userRes.users[0];
        if (!user.groups?.length) {
          throw new Error(
            'Server error. Contact support to add you to the Organization',
          );
        }

        // Fetch the most recent preference
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

        // Persist & dispatch
        localStorage.setItem('loggedUser', JSON.stringify(user));
        localStorage.setItem('activeGroup', JSON.stringify(activeGroup));
        localStorage.setItem('currentOrganization', org_slug);

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
    [dispatch, router, org_slug],
  );

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleGoogleLogin = async () => {
    setIsLoadingGoogle(true);
    try {
      // Redirect to Google auth URL with org context
      window.location.href = `${GOOGLE_AUTH_URL}?organization=${org_slug}`;
    } catch (error) {
      logger.error('Google login error:', error);
    } finally {
      setIsLoadingGoogle(false);
    }
  };

  return (
    <ErrorBoundary
      name="OrganizationLogin"
      feature="Organization Authentication"
    >
      <AccountPageLayout
        pageTitle={`${orgDetails.name} - Login | AirQo Analytics`}
        rightText="Welcome to your organization's private dashboard"
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
            Welcome to {orgDetails.name}
          </h2>
          <p className="text-xl font-normal mt-3 text-gray-700 dark:text-gray-300 text-center">
            Sign in to access your organization&apos;s air quality dashboard
          </p>
          {error && <Toast type="error" timeout={8000} message={error} />}
          <form onSubmit={handleLogin} noValidate>
            <div className="mt-6">
              <InputField
                label="Email Address"
                type="email"
                name="userName"
                placeholder="e.g. john.doe@organization.com"
                required
              />
            </div>
            <div className="mt-6">
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
                disabled={loading || isLoadingGoogle}
                type="submit"
              >
                {loading ? <Spinner width={25} height={25} /> : 'Login'}
              </button>

              <button
                type="button"
                className="w-full btn border-blue-900 rounded-[12px] text-white text-sm outline-none border mt-2"
                disabled={loading || isLoadingGoogle}
                onClick={handleGoogleLogin}
              >
                {isLoadingGoogle ? (
                  <Spinner width={25} height={25} />
                ) : (
                  'Login with Google'
                )}
              </button>
            </div>
          </form>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 text-sm">
            <span>
              Don&apos;t have an account?{' '}
              <Link
                href={`/account/register/${org_slug}`}
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

export default OrganizationLogin;
