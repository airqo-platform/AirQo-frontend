'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useParams } from 'next/navigation';
import AuthLayout from '@/shared/layouts/AuthLayout';
import SocialAuthSection from '@/shared/components/auth/SocialAuthSection';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button, Input } from '@/shared/components/ui';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '@/shared/components/ui';
import { loginSchema, type LoginFormData } from '@/shared/lib/validators';
import {
  normalizeCallbackUrl,
  redirectWithReload,
} from '@/shared/lib/auth-redirect';

export default function OrgLoginPage() {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'email' | 'password'>('email');
  const params = useParams();
  const searchParams = useSearchParams();
  const orgSlug = params.org_slug as string;
  const callbackUrl = normalizeCallbackUrl(searchParams.get('callbackUrl'));

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

  useEffect(() => {
    setFocus(step === 'email' ? 'email' : 'password');
  }, [setFocus, step]);

  const handleContinue = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const isEmailValid = await trigger('email');
    if (isEmailValid) {
      setStep('password');
    }
  };

  const handleGoBack = () => {
    resetField('password');
    setStep('email');
  };

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email: data.email,
        password: data.password,
        org_slug: orgSlug,
        callbackUrl: callbackUrl || `/org/${orgSlug}/dashboard`,
      });

      if (res?.error) {
        let errorMessage = 'Login failed. Please try again.';
        let errorTitle = 'Login Failed';

        try {
          const errorData = JSON.parse(res.error);
          if (errorData && typeof errorData === 'object') {
            const { status, data, message } = errorData;
            if (status === 400 && data) {
              if (data.message) {
                errorMessage = data.message;
              } else if (message) {
                errorMessage = message;
              }
              if (
                data.message?.includes('username or password does not exist')
              ) {
                errorTitle = 'Invalid Credentials';
              } else if (
                data.message?.includes('incorrect username or password')
              ) {
                errorTitle = 'Invalid Credentials';
              }
            } else if (status === 401) {
              errorTitle = 'Unauthorized';
              errorMessage = 'Please check your credentials and try again.';
            } else if (status === 403) {
              errorTitle = 'Access Denied';
              errorMessage =
                'You do not have permission to access this organization.';
            } else if (status >= 500) {
              errorTitle = 'Server Error';
              errorMessage =
                'Service temporarily unavailable. Please try again later.';
            } else if (message) {
              errorMessage = message;
            }
          }
        } catch {
          if (res.error === 'incorrect username or password') {
            errorMessage = 'Incorrect username or password';
            errorTitle = 'Invalid Credentials';
          } else if (res.error.includes('incorrect username or password')) {
            errorMessage = 'Incorrect username or password';
            errorTitle = 'Invalid Credentials';
          } else if (res.error.includes('This endpoint does not exist')) {
            errorMessage =
              'Service temporarily unavailable. Please try again later.';
            errorTitle = 'Service Unavailable';
          } else if (res.error.includes('Login failed')) {
            const apiMessageMatch = res.error.match(/Login failed:?\s*(.+)/i);
            if (apiMessageMatch && apiMessageMatch[1]) {
              errorMessage = apiMessageMatch[1].trim();
            }
          } else if (res.error && res.error !== 'CredentialsSignin') {
            errorMessage = res.error;
          }
        }

        toast.error(errorTitle, errorMessage);
      } else {
        toast.success('Welcome back!', 'You have successfully signed in.');
        redirectWithReload(
          res?.url ?? callbackUrl ?? `/org/${orgSlug}/dashboard`
        );
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
      pageTitle="Organization Login"
      heading={`Sign in to ${orgSlug}`}
      subtitle="Use your organization email first, then confirm your password on the next screen."
    >
      {step === 'email' ? (
        <form onSubmit={handleContinue} className="w-full space-y-4">
          <Input
            label="Email"
            type="email"
            {...register('email')}
            error={errors.email?.message}
            placeholder="Enter your email"
          />

          <Button type="submit" fullWidth disabled={loading}>
            Continue
          </Button>

          <SocialAuthSection
            mode="login"
            disabled={loading}
            callbackUrl={callbackUrl || `/org/${orgSlug}/dashboard`}
          />

          <div className="text-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Don&apos;t have an account?{' '}
              <Link
                href={`/org/${orgSlug}/register`}
                className="text-primary hover:text-primary/80"
              >
                Sign up
              </Link>
            </span>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
          <div className="rounded-xl border border-gray-200 bg-gray-50/80 px-3 py-3 shadow-sm dark:border-gray-700 dark:bg-gray-800/50 sm:px-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-gray-500 dark:text-gray-400">
                  Account
                </p>
                <p className="mt-0.5 truncate text-sm font-medium text-gray-900 dark:text-white">
                  {emailValue || 'your email address'}
                </p>
              </div>

              <Button
                type="button"
                variant="text"
                size="sm"
                onClick={handleGoBack}
              >
                Change
              </Button>
            </div>
          </div>

          <Input
            label="Password"
            type="password"
            {...register('password')}
            error={errors.password?.message}
            placeholder="Enter your password"
            showPasswordToggle
          />

          <div className="flex items-center justify-end gap-3">
            <Link
              href={`/org/${orgSlug}/forgot-password`}
              className="text-sm text-primary hover:text-primary/80"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            loading={loading}
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Signing in...' : 'Login'}
          </Button>

          <div className="text-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Don&apos;t have an account?{' '}
              <Link
                href={`/org/${orgSlug}/register`}
                className="text-primary hover:text-primary/80"
              >
                Sign up
              </Link>
            </span>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}
