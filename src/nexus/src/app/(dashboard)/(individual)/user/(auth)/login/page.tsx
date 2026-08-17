'use client';

import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from 'react';
import AuthLayout from '@/shared/layouts/AuthLayout';
import SocialAuthSection from '@/shared/components/auth/SocialAuthSection';
import SelectedEmailCard from '@/shared/components/auth/SelectedEmailCard';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Input } from '@/shared/components/ui';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '@/shared/components/ui';
import { loginSchema, type LoginFormData } from '@/shared/lib/validators';
import { EMAIL_MAX, PASSWORD_MAX } from '@/shared/lib/validation-limits';
import {
  normalizeCallbackUrl,
  redirectWithReload,
} from '@/shared/lib/auth-redirect';
import { CROSS_TAB_LOGIN_KEY } from '@/shared/hooks/useLogout';
import { useCheckEmail } from '@/shared/hooks/useAuth';
import { LoadingState } from '@/shared/components/ui/loading-state';
import { Banner } from '@/shared/components/ui';
import type { AuthMethods } from '@/shared/types/api';
import {
  SUPPORTED_SOCIAL_AUTH_PROVIDERS,
  type SupportedSocialAuthProvider,
} from '@/shared/lib/oauth-session';
import { setPendingRegistrationEmail } from '@/shared/lib/registration-handoff';

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <LoginPageContent />
    </Suspense>
  );
}

function LoginPageContent() {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'email' | 'password'>('email');
  const [authMethods, setAuthMethods] = useState<AuthMethods | undefined>();
  const stepContainerRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { trigger: checkEmail, isMutating: isCheckingEmail } = useCheckEmail();
  const callbackUrl =
    normalizeCallbackUrl(searchParams.get('callbackUrl')) || '/user/home';

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    resetField,
    setFocus,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onChange',
  });

  const emailValue = (watch('email') || '').trim();
  const showPassword = authMethods?.password !== false;
  const linkedOAuthProviders = useMemo(
    () =>
      SUPPORTED_SOCIAL_AUTH_PROVIDERS.filter(
        provider => authMethods?.[provider] === true
      ) as SupportedSocialAuthProvider[],
    [authMethods]
  );

  useEffect(() => {
    if (step === 'email') {
      setFocus('email');
    } else if (showPassword) {
      setFocus('password');
    } else {
      stepContainerRef.current?.focus();
    }
  }, [setFocus, showPassword, step]);

  const handleContinue = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const isEmailValid = await trigger('email');
    if (!isEmailValid || isCheckingEmail) {
      return;
    }

    try {
      const result = await checkEmail({ email: emailValue });

      if (!result.exists) {
        toast.info(
          'Account not found',
          'We could not find an account for this email. Redirecting you to registration.'
        );
        setPendingRegistrationEmail(emailValue);
        router.push('/user/creation/individual/register');
        return;
      }

      setAuthMethods(result.authMethods);
      setStep('password');
    } catch (error) {
      const status =
        typeof error === 'object' && error !== null && 'status' in error
          ? (error as { status?: number }).status
          : undefined;
      if (status === 429) {
        toast.error(
          'Please try again shortly',
          'We are temporarily limiting sign-in checks. Please wait a moment and try again.'
        );
      } else {
        toast.error(
          'Unable to continue',
          'We could not check this email. Please try again.'
        );
      }
    }
  };

  const handleGoBack = () => {
    resetField('password');
    setAuthMethods(undefined);
    setStep('email');
  };

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email: data.email,
        password: data.password,
        callbackUrl,
      });

      if (res?.error) {
        let errorMessage = 'Login failed. Please try again.';
        let errorTitle = 'Login Failed';

        // Map the generic error code to a user-friendly message
        if (res.error === 'CredentialsSignin') {
          errorMessage =
            'Incorrect username or password. Please check your credentials and try again.';
          errorTitle = 'Invalid Credentials';
        } else if (res.error.includes('incorrect username or password')) {
          errorMessage = 'Incorrect username or password';
          errorTitle = 'Invalid Credentials';
        } else if (res.error.includes('This endpoint does not exist')) {
          errorMessage =
            'Service temporarily unavailable. Please try again later.';
          errorTitle = 'Service Unavailable';
        } else if (res.error !== 'CredentialsSignin') {
          errorMessage = res.error;
        }

        toast.error(errorTitle, errorMessage);
      } else {
        toast.success('Welcome back!', 'You have successfully signed in.');

        // Signal other tabs/apps that login occurred
        try {
          localStorage.setItem(CROSS_TAB_LOGIN_KEY, String(Date.now()));
        } catch {
          // Ignore storage errors
        }

        redirectWithReload(normalizeCallbackUrl(res?.url) || callbackUrl);
      }
    } catch (error) {
      console.error('Unexpected login error:', error);
      toast.error(
        'Login Failed',
        'An unexpected error occurred. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      heading="Access open air quality data and insights across Africa"
      subtitle="AirQo provides openly available air quality data to support research, policy, and public awareness."
    >
      {step === 'email' ? (
        <form onSubmit={handleContinue} className="w-full space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="user@example.com"
            error={errors.email?.message}
            maxLength={EMAIL_MAX}
            {...register('email')}
          />

          <Button
            type="submit"
            fullWidth
            loading={isCheckingEmail}
            disabled={loading || isCheckingEmail}
          >
            {isCheckingEmail ? 'Checking...' : 'Continue'}
          </Button>

          <SocialAuthSection
            mode="login"
            disabled={loading}
            callbackUrl={callbackUrl}
          />

          <div className="w-full pt-0 text-center">
            <p className="text-sm">
              Don&apos;t have an account?{' '}
              <Link
                href="/user/creation/individual/register"
                className="text-blue-600"
              >
                Register
              </Link>
            </p>
          </div>
        </form>
      ) : (
        <div
          ref={stepContainerRef}
          tabIndex={-1}
          className="w-full space-y-4 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
        >
          <SelectedEmailCard email={emailValue} onChangeEmail={handleGoBack} />

          {showPassword ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Password"
                type="password"
                placeholder="password"
                error={errors.password?.message}
                containerClassName="mb-0"
                showPasswordToggle
                maxLength={PASSWORD_MAX}
                {...register('password')}
              />

              <div className="flex items-center justify-end gap-3">
                <Link
                  href="/user/forgotPwd"
                  className="text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  Forgot Password?
                </Link>
              </div>

              <Button
                type="submit"
                fullWidth
                loading={loading}
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Login'}
              </Button>
            </form>
          ) : linkedOAuthProviders.length ? (
            <>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                This account uses a connected provider. Choose one below to
                continue.
              </p>
              <SocialAuthSection
                mode="login"
                disabled={loading}
                callbackUrl={callbackUrl}
                providers={linkedOAuthProviders}
              />
            </>
          ) : (
            <Banner
              severity="error"
              title="No sign-in method available"
              message="Please contact AirQo support to recover access to this account."
            />
          )}

          <div className="w-full pt-0 text-center">
            <p className="text-sm">
              Don&apos;t have an account?{' '}
              <Link
                href="/user/creation/individual/register"
                className="text-blue-600"
              >
                Register
              </Link>
            </p>
          </div>
        </div>
      )}
    </AuthLayout>
  );
}
