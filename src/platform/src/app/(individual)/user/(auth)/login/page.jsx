'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import * as Yup from 'yup';
import { AqEye, AqEyeOff } from '@airqo/icons-react';

import AccountPageLayout from '@/common/components/Account/Layout';
import InputField from '@/common/components/InputField';
import Button from '@/common/components/Button';
import { setUserData } from '@/lib/store/services/account/LoginSlice';
import ErrorBoundary from '@/common/components/ErrorBoundary';
import NotificationService from '@/core/utils/notificationService';
import { setupUserSession } from '@/core/utils/loginSetup';

const loginSchema = Yup.object().shape({
  userName: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string().required('Password is required'),
});

const UserLogin = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();
  const { userData } = useSelector((state) => state.login);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleLogin = useCallback(
    async (e) => {
      e.preventDefault();

      if (loading || !isMountedRef.current) return;

      setLoading(true);

      const formData = {
        userName: userData.userName?.trim() || '',
        password: userData.password || '',
      };

      try {
        await loginSchema.validate(formData, { abortEarly: false });
      } catch (validationError) {
        if (isMountedRef.current) {
          setLoading(false);
          const messages = validationError.inner
            .map((err) => err.message)
            .join(' ');
          // Use status code 422 for validation errors
          NotificationService.error(422, messages);
        }
        return;
      }

      try {
        const result = await signIn('credentials', {
          userName: formData.userName,
          password: formData.password,
          redirect: false,
        });

        if (!isMountedRef.current) return;

        if (result?.error) {
          // Enhanced error handling with better status code detection and user-friendly messages
          let statusCode = 401; // Default to unauthorized
          let customMessage = null;

          const errorMsg = result.error.toLowerCase();

          if (
            errorMsg.includes('invalid credentials') ||
            errorMsg.includes('authentication failed') ||
            errorMsg.includes('incorrect password') ||
            errorMsg.includes('incorrect email or password') ||
            errorMsg.includes('unauthorized')
          ) {
            statusCode = 401;
            customMessage =
              'Invalid email or password. Please check your credentials and try again.';
          } else if (
            errorMsg.includes('user not found') ||
            errorMsg.includes('account does not exist')
          ) {
            statusCode = 404;
            customMessage = 'No account found with this email address.';
          } else if (
            errorMsg.includes('account locked') ||
            errorMsg.includes('account disabled') ||
            errorMsg.includes('account suspended')
          ) {
            statusCode = 403;
            customMessage =
              'Your account has been suspended. Please contact support.';
          } else if (
            errorMsg.includes('too many attempts') ||
            errorMsg.includes('rate limit') ||
            errorMsg.includes('throttled')
          ) {
            statusCode = 429;
            customMessage =
              'Too many login attempts. Please wait a moment and try again.';
          } else if (
            errorMsg.includes('network') ||
            errorMsg.includes('connection') ||
            errorMsg.includes('timeout')
          ) {
            statusCode = 503;
            customMessage =
              'Connection problem. Please check your internet and try again.';
          } else if (
            errorMsg.includes(
              'authentication service returned an unexpected response',
            )
          ) {
            statusCode = 502;
            customMessage =
              'Authentication service is temporarily unavailable. Please try again.';
          } else if (errorMsg.includes('you do not have permission')) {
            statusCode = 403;
            customMessage =
              'Access denied. Please contact support if you believe this is an error.';
          } else if (
            errorMsg.includes('server error') ||
            errorMsg.includes('internal error')
          ) {
            statusCode = 500;
            customMessage =
              'Server error occurred. Please try again in a moment.';
          } else {
            statusCode = 400;
            customMessage = result.error; // Use original error message as fallback
          }

          NotificationService.error(statusCode, customMessage);
          return;
        }

        if (result?.ok) {
          // Success notification (kept simple)
          NotificationService.success(200, 'Welcome back!');

          // Get the freshly minted session and run the client-side setup
          try {
            const session = await getSession();
            if (session?.user) {
              // Compute destination before initializing session so setupUserSession
              // can pick the correct active group based on the intended route.
              const redirectOrg = session.requestedOrgSlug || session.orgSlug;
              const dest = redirectOrg
                ? `/org/${redirectOrg}/dashboard`
                : '/user/Home';

              // Run setup which will populate Redux with user/groups/etc.
              // We await this so the user lands on the app with data loaded.
              await setupUserSession(session, dispatch, dest);

              // Redirect to the computed destination
              router.replace(dest);
              return;
            }
            NotificationService.error(
              500,
              'Session setup failed. Please try logging in again.',
            );
            return;
          } catch (setupErr) {
            NotificationService.error(
              500,
              setupErr.message || 'Login setup failed',
            );
            return;
          }
        } else {
          NotificationService.error(500, 'Login failed. Please try again.');
        }
      } catch (err) {
        if (!isMountedRef.current) return;

        // Use status-based notification instead of generic error message
        NotificationService.error(
          500,
          err.message || 'An unexpected error occurred. Please try again.',
        );
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    },
    [userData, loading, dispatch, router],
  );

  const handleInputChange = useCallback(
    (key, value) => {
      dispatch(setUserData({ key, value }));
    },
    [dispatch],
  );

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const isFormValid = userData.userName?.trim() && userData.password;

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
          <form onSubmit={handleLogin} noValidate>
            <div className="mt-6">
              <InputField
                id="login-email"
                label="Email Address"
                type="email"
                placeholder="e.g. greta.nagawa@gmail.com"
                value={userData.userName || ''}
                onChange={(e) => handleInputChange('userName', e.target.value)}
                required
              />
            </div>
            <div className="mt-6">
              <div className="relative">
                <InputField
                  id="login-password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="******"
                  value={userData.password || ''}
                  onChange={(e) =>
                    handleInputChange('password', e.target.value)
                  }
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-12 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none dark:text-gray-400 dark:hover:text-gray-300"
                  onClick={togglePasswordVisibility}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <AqEyeOff size={20} /> : <AqEye size={20} />}
                </button>
              </div>
            </div>
            <div className="mt-10">
              <Button
                className="w-full rounded-lg text-sm"
                disabled={!isFormValid || loading}
                loading={loading}
                type="submit"
                variant={isFormValid && !loading ? 'filled' : 'disabled'}
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>
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
