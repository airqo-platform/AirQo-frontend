'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { signIn as _signIn } from 'next-auth/react';
import Link from 'next/link';
import * as Yup from 'yup';
import { AqEye, AqEyeOff } from '@airqo/icons-react';

import AccountPageLayout from '@/components/Account/Layout';
import CustomToast, {
  TOAST_TYPES,
} from '@/common/components/Toast/CustomToast';
import InputField from '@/common/components/InputField';
import Button from '@/common/components/Button';
import { setUserData } from '@/lib/store/services/account/LoginSlice';
import ErrorBoundary from '@/components/ErrorBoundary';

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
          CustomToast({
            message: messages,
            type: TOAST_TYPES.ERROR,
            duration: 8000,
          });
        }
        return;
      }

      try {
        const result = await _signIn('credentials', {
          userName: formData.userName,
          password: formData.password,
          redirect: false,
        });

        if (!isMountedRef.current) return;

        if (result?.error) {
          let errorMessage = 'Login failed. Please try again.';
          if (
            result.error.includes('Invalid credentials') ||
            result.error.includes('Authentication failed')
          ) {
            errorMessage =
              'Invalid email or password. Please check your credentials.';
          } else if (result.error.includes('Network')) {
            errorMessage =
              'Network error. Please check your connection and try again.';
          } else {
            errorMessage = result.error;
          }
          throw new Error(errorMessage);
        }

        if (result?.ok) {
          // Success. Redirect handled by HOC or session management.
          // CustomToast({ message: 'Login successful!', type: TOAST_TYPES.SUCCESS });
        } else {
          throw new Error('Login failed. Please try again.');
        }
      } catch (err) {
        if (!isMountedRef.current) return;

        CustomToast({
          message:
            err.message || 'An unexpected error occurred. Please try again.',
          type: TOAST_TYPES.ERROR,
          duration: 8000,
        });
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    },
    [userData, loading],
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
