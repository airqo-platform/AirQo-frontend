'use client';

import AuthLayout from '@/shared/layouts/AuthLayout';
import Link from 'next/link';
import { Button, Input } from '@/shared/components/ui';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '@/shared/components/ui';
import {
  forgotPwdSchema,
  type ForgotPwdFormData,
} from '@/shared/lib/validators';
import { useForgotPassword } from '@/shared/hooks/useAuth';
import { getUserFriendlyErrorMessage } from '@/shared/utils/errorMessages';
import { useState } from 'react';

export default function ForgotPwdPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ForgotPwdFormData>({
    resolver: zodResolver(forgotPwdSchema),
    defaultValues: {
      email: '',
    },
    mode: 'onChange',
  });

  const { trigger: forgotPassword, isMutating } = useForgotPassword();

  const onSubmit = async (data: ForgotPwdFormData) => {
    try {
      const response = await forgotPassword({ email: data.email });
      setIsSubmitted(true);
      setSubmittedEmail(data.email);
      toast.success('Password reset link sent!', response.message);
    } catch (error) {
      const message = getUserFriendlyErrorMessage(error);
      toast.error('Failed to send reset link', message);
    }
  };

  const handleTryAgain = () => {
    setIsSubmitted(false);
    setSubmittedEmail('');
    reset();
  };

  return (
    <AuthLayout
      pageTitle="Forgot Password"
      heading="Forgot Your Password?"
      subtitle={
        isSubmitted
          ? `A password reset link has been sent to ${submittedEmail}. Please check your email and click the link to reset your password.`
          : 'Enter your email address and we will send you a link to reset your password.'
      }
    >
      {isSubmitted ? (
        <div className="w-full space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-800 text-sm">
              Password reset email sent successfully! Check your inbox for the
              reset link.
            </p>
          </div>

          <Input
            label="Email Address"
            type="email"
            value={submittedEmail}
            disabled
            containerClassName="mb-4"
          />

          <Button
            type="button"
            fullWidth
            variant="outlined"
            onClick={handleTryAgain}
          >
            Try Again
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="w-full">
          <Input
            label="Email Address"
            type="email"
            placeholder="e.g. greta.nagawa@gmail.com"
            error={errors.email?.message}
            containerClassName="mb-4"
            {...register('email')}
          />

          <Button type="submit" fullWidth loading={isMutating} className="mt-4">
            {isMutating ? 'Sending Reset Link...' : 'Submit'}
          </Button>
        </form>
      )}

      <div className="mt-6 text-center w-full">
        <p className="text-sm">
          Remember your password?{' '}
          <Link
            href="/user/login"
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            Login
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
