'use client';

import AuthLayout from '@/shared/layouts/AuthLayout';
import { Button, Input } from '@/shared/components/ui';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '@/shared/components/ui';
import { resetPwdSchema, type ResetPwdFormData } from '@/shared/lib/validators';
import { useResetPassword } from '@/shared/hooks/useAuth';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getUserFriendlyErrorMessage } from '@/shared/utils/errorMessages';
import { useRouter } from 'next/navigation';

export default function ResetPwdPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [token, setToken] = useState<string>('');
  const [isTokenValid, setIsTokenValid] = useState<boolean>(false);
  const [isPasswordReset, setIsPasswordReset] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(5);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPwdFormData>({
    resolver: zodResolver(resetPwdSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
    mode: 'onChange',
  });

  const { trigger: resetPassword, isMutating } = useResetPassword();

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
      setIsTokenValid(true);
    } else {
      setIsTokenValid(false);
      toast.error(
        'Invalid reset link',
        'The reset link is missing or invalid. Please request a new password reset.'
      );
    }
  }, [searchParams]);

  // Countdown effect for redirect after successful password reset
  useEffect(() => {
    if (isPasswordReset && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isPasswordReset && countdown === 0) {
      router.push('/user/login');
    }
  }, [isPasswordReset, countdown, router]);

  const onSubmit = async (data: ResetPwdFormData) => {
    if (!token) {
      toast.error('Invalid reset link', 'Please request a new password reset.');
      return;
    }

    try {
      const response = await resetPassword({
        password: data.password,
        resetPasswordToken: token,
      });
      setIsPasswordReset(true);
      toast.success('Password reset successful!', response.message);
    } catch (error) {
      const message = getUserFriendlyErrorMessage(error);
      toast.error('Failed to reset password', message);
    }
  };

  if (!isTokenValid) {
    return (
      <AuthLayout
        pageTitle="Reset Password"
        heading="Invalid Reset Link"
        subtitle="The password reset link is invalid or has expired. Please request a new one."
      >
        <div className="w-full">
          <p className="text-center text-gray-600 mb-4">
            This reset link appears to be invalid. Please go back to the forgot
            password page and request a new reset link.
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      pageTitle="Reset Password"
      heading="Reset Your Password"
      subtitle={
        isPasswordReset
          ? 'Your password has been successfully reset!'
          : "Please enter your new password below. Make sure it's something secure that you can remember."
      }
    >
      {isPasswordReset ? (
        <div className="w-full space-y-6">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">
              Password Reset Successful!
            </h3>
            <p className="text-gray-600 mb-6">
              Your password has been successfully updated. You can now log in
              with your new password.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-center">
              <p className="text-blue-800 font-medium mb-2">
                Redirecting to login page in...
              </p>
              <div className="text-3xl font-bold text-blue-600">
                {countdown}
              </div>
              <p className="text-sm text-blue-600 mt-2">seconds</p>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-500">
              Not redirecting?{' '}
              <button
                onClick={() => router.push('/user/login')}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Click here to login
              </button>
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="w-full">
          <Input
            label="Password"
            type="password"
            placeholder="Create password"
            error={errors.password?.message}
            containerClassName="mb-4"
            showPasswordToggle
            {...register('password')}
          />

          <Input
            label="Confirm Password"
            type="password"
            placeholder="Confirm password"
            error={errors.confirmPassword?.message}
            containerClassName="mb-4"
            showPasswordToggle
            {...register('confirmPassword')}
          />

          <Button type="submit" fullWidth className="mt-4" loading={isMutating}>
            Reset Password
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
