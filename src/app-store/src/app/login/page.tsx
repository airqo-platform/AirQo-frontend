'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Form, FormField } from '@/components/ui/form';
import ReusableInputField from '@/components/shared/inputfield/ReusableInputField';
import ReusableButton from '@/components/shared/button/ReusableButton';
import ReusableToast from '@/components/shared/toast/ReusableToast';
import logger from '@/lib/logger';
import { getApiErrorMessage } from '@/core/utils/getApiErrorMessage';
import { signUpUrl, forgotPasswordUrl } from '@/core/urls';

const loginSchema = z.object({
  userName: z.string().email({ message: 'Please enter a valid email address' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters long' }),
});

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const callbackUrl = useMemo(() => {
    const raw = searchParams.get('callbackUrl');
    if (!raw) return '';
    try {
      const parsed = new URL(raw, window.location.origin);
      if (parsed.origin !== window.location.origin) return '';
      return `${parsed.pathname}${parsed.search}${parsed.hash}`;
    } catch {
      return '';
    }
  }, [searchParams]);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      userName: '',
      password: '',
    },
  });

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const onSubmit = useCallback(
    async (values: z.infer<typeof loginSchema>) => {
      setIsLoading(true);
      const redirectUrl = callbackUrl || '/';

      try {
        const result = await signIn('credentials', {
          redirect: false,
          userName: values.userName,
          password: values.password,
        });

        if (!isMounted.current) return;

        if (result?.ok) {
          ReusableToast({ message: 'Welcome back!', type: 'SUCCESS' });
          window.location.href = redirectUrl;
        } else {
          let message = 'Login failed. Please check your credentials.';
          if (result?.error) {
            if (result.error === 'CredentialsSignin') {
              message = 'Invalid email or password. Please check your credentials.';
            } else if (result.error.toLowerCase().includes('fetch')) {
              message = 'Network error. Please check your connection and try again.';
            } else {
              message = result.error;
            }
          }
          throw new Error(message);
        }
      } catch (error) {
        if (!isMounted.current) return;
        const message = getApiErrorMessage(error);
        logger.error('Sign-in failed', { error: message });
        ReusableToast({ message, type: 'ERROR' });
        setIsLoading(false);
      }
    },
    [callbackUrl]
  );

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-muted/30 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center justify-center space-y-2 text-center">
          <div className="mb-4">
            <Image src="/images/airqo_logo.svg" alt="Logo" width={50} height={50} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back to AirQo App Store</h1>
          <div className="text-center text-sm">
            Need an account?{' '}
            <Link href={signUpUrl || 'https://analytics.airqo.net'} className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </div>
        </div>
        <div className="flex flex-col">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="userName"
                render={({ field, fieldState }) => (
                  <ReusableInputField
                    label="Email"
                    placeholder="login@airqo.net"
                    type="email"
                    required
                    error={fieldState.error?.message}
                    disabled={isLoading}
                    {...field}
                  />
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field, fieldState }) => (
                  <div>
                    <div className="flex items-center justify-between">
                      <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        Password
                      </label>
                      <Link href={forgotPasswordUrl || '/forgot-password'} className="text-xs text-primary hover:underline">
                        Forgot password?
                      </Link>
                    </div>
                    <ReusableInputField
                      type="password"
                      id="password"
                      autoComplete="current-password"
                      placeholder="********"
                      required
                      error={fieldState.error?.message}
                      className="mt-2"
                      disabled={isLoading}
                      {...field}
                    />
                  </div>
                )}
              />
              <ReusableButton type="submit" className="max-w-xs w-full mx-auto" disabled={isLoading} loading={isLoading} variant="filled">
                {isLoading ? 'Signing in...' : 'Login'}
              </ReusableButton>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}