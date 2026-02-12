'use client';

import { useState } from 'react';
import AuthLayout from '@/shared/layouts/AuthLayout';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Input } from '@/shared/components/ui';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '@/shared/components/ui';
import { loginSchema, type LoginFormData } from '@/shared/lib/validators';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onChange',
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (res?.error) {
        let errorMessage = 'Login failed. Please try again.';
        let errorTitle = 'Login Failed';

        try {
          // Try to parse the enhanced error data
          const errorData = JSON.parse(res.error);

          if (errorData && typeof errorData === 'object') {
            // Use the status and data from the API response
            const { status, data, message } = errorData;

            if (status === 400 && data) {
              // Handle specific API error messages
              if (data.message) {
                errorMessage = data.message;
              } else if (message) {
                errorMessage = message;
              }

              // Provide user-friendly titles based on status
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
                'You do not have permission to access this service.';
            } else if (status >= 500) {
              errorTitle = 'Server Error';
              errorMessage =
                'Service temporarily unavailable. Please try again later.';
            } else if (message) {
              errorMessage = message;
            }
          }
        } catch {
          // If parsing fails, fall back to the original error handling

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
        // Redirect to user home
        router.push('/user/home');
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
      pageTitle="Login"
      heading={"Let's get started"}
      subtitle={'Access open air quality data and insights across Africa'}
      microLine="AirQo provides openly available air quality data to support research, policy, and public awareness."
      rightText="What you've built here is so much better for air pollution monitoring than anything else on the market!"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="w-full">
        <Input
          label="Email Address"
          type="email"
          placeholder="user@example.com"
          error={errors.email?.message}
          containerClassName="mb-4"
          {...register('email')}
        />

        <Input
          label="Password"
          type="password"
          placeholder="password"
          error={errors.password?.message}
          containerClassName="mb-4"
          showPasswordToggle
          {...register('password')}
        />

        <Button
          type="submit"
          fullWidth
          loading={loading}
          disabled={loading}
          className="mt-4"
        >
          {loading ? 'Signing in...' : 'Login'}
        </Button>
      </form>

      <div className="w-full mt-6 text-center">
        <p className="text-sm">
          Don&apos;t have an account?{' '}
          <Link
            href="/user/creation/individual/register"
            className="text-blue-600"
          >
            Register
          </Link>
        </p>
        <p className="mt-2 text-sm">
          <Link href="/user/forgotPwd" className="text-blue-600">
            Forgot Password
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
