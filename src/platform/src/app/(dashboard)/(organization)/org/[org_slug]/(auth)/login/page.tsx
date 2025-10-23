'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import AuthLayout from '@/shared/layouts/AuthLayout';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Input } from '@/shared/components/ui';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '@/shared/components/ui';
import { loginSchema, type LoginFormData } from '@/shared/lib/validators';

export default function OrgLoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useParams();
  const orgSlug = params.org_slug as string;

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
        org_slug: orgSlug,
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
        router.push(`/org/${orgSlug}/dashboard`);
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
      heading={`Login to ${orgSlug}`}
      subtitle={'Access your organization dashboard'}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Email
          </label>
          <Input
            id="email"
            type="email"
            {...register('email')}
            error={errors.email?.message}
            placeholder="Enter your email"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Password
          </label>
          <Input
            id="password"
            type="password"
            {...register('password')}
            error={errors.password?.message}
            placeholder="Enter your password"
          />
        </div>

        <div className="flex items-center justify-between">
          <Link
            href={`/org/${orgSlug}/forgot-password`}
            className="text-sm text-primary hover:text-primary/80"
          >
            Forgot password?
          </Link>
        </div>

        <Button type="submit" loading={loading} className="w-full">
          {loading ? 'Signing in...' : 'Login'}
        </Button>

        <div className="text-center">
          <span className="text-sm text-gray-600">
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
    </AuthLayout>
  );
}
