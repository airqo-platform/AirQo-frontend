'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useParams } from 'next/navigation';
import AuthLayout from '@/shared/layouts/AuthLayout';
import SocialAuthSection from '@/shared/components/auth/SocialAuthSection';
import SelectedEmailCard from '@/shared/components/auth/SelectedEmailCard';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
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

        redirectWithReload(
          normalizeCallbackUrl(res?.url) ??
            callbackUrl ??
            `/org/${orgSlug}/dashboard`
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
            maxLength={EMAIL_MAX}
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
          <SelectedEmailCard email={emailValue} onChangeEmail={handleGoBack} />

          <Input
            label="Password"
            type="password"
            {...register('password')}
            error={errors.password?.message}
            placeholder="Enter your password"
            showPasswordToggle
            maxLength={PASSWORD_MAX}
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
