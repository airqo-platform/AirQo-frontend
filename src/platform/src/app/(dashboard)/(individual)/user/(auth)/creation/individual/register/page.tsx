'use client';

import AuthLayout from '@/shared/layouts/AuthLayout';
import Link from 'next/link';
import { Button, Input, Checkbox } from '@/shared/components/ui';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '@/shared/components/ui';
import { registerSchema, type RegisterFormData } from '@/shared/lib/validators';
import { useRegister } from '@/shared/hooks/useAuth';
import { getUserFriendlyErrorMessage } from '@/shared/utils/errorMessages';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    control,
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      agreed: false,
    },
    mode: 'onChange',
  });

  const { trigger: registerUser, isMutating } = useRegister();
  const router = useRouter();

  // Watch all form fields to enable/disable button
  const watchedFields = watch();
  const isFormComplete =
    isValid &&
    watchedFields.agreed &&
    watchedFields.firstName &&
    watchedFields.lastName &&
    watchedFields.email &&
    watchedFields.password;

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const response = await registerUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        category: 'individual',
      });

      toast.success(
        'Registration successful!',
        response.message || 'Welcome to AirQo Analytics'
      );

      sessionStorage.setItem('registeredUserEmail', data.email);

      router.push('/user/creation/individual/verify-email');
    } catch (error) {
      const message = getUserFriendlyErrorMessage(error);
      toast.error('Registration failed', message);
    }
  };

  return (
    <AuthLayout
      pageTitle="Register"
      heading={'Create your individual account'}
      subtitle={'Access open air quality data and insights across Africa'}
      microLine="AirQo provides openly available air quality data to support research, policy, and public awareness."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="w-full">
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <Input
              label="First name"
              placeholder="Enter your first name"
              error={errors.firstName?.message}
              {...register('firstName')}
            />
          </div>

          <div className="flex-1">
            <Input
              label="Last name"
              placeholder="Enter your last name"
              error={errors.lastName?.message}
              {...register('lastName')}
            />
          </div>
        </div>

        <Input
          label="Email address"
          type="email"
          placeholder="Enter your email"
          error={errors.email?.message}
          containerClassName="mb-4"
          {...register('email')}
        />

        <div className="mb-4">
          <Input
            label="Password"
            type="password"
            placeholder="Create password"
            error={errors.password?.message}
            showPasswordToggle
            {...register('password')}
          />{' '}
          <p className="mt-2 text-xs text-gray-500">
            Must be at least 8 characters, include uppercase, lowercase, number,
            and special character (e.g. #?!@$%^&*).
          </p>
        </div>

        <div className="flex items-center mt-4 mb-6">
          <Controller
            name="agreed"
            control={control}
            render={({ field }) => (
              <Checkbox
                id="agree"
                checked={field.value}
                onCheckedChange={field.onChange}
                className="mr-2"
              />
            )}
          />
          <label htmlFor="agree" className="text-sm cursor-pointer">
            I agree to the{' '}
            <a
              href="https://airqo.net/legal/terms-of-service"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800"
            >
              Terms of Service
            </a>{' '}
            and{' '}
            <a
              href="https://airqo.net/legal/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800"
            >
              Privacy Policy
            </a>
          </label>
        </div>
        {errors.agreed && (
          <p className="text-sm text-red-600 mb-4">{errors.agreed.message}</p>
        )}

        <Button
          type="submit"
          fullWidth
          loading={isMutating}
          disabled={!isFormComplete}
          className="mt-6"
        >
          Continue
        </Button>
      </form>

      <div className="w-full mt-6 text-center">
        <p className="text-sm">
          Already have an account?{' '}
          <Link href="/user/login" className="text-blue-600">
            Log in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
