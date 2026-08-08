'use client';

import { Suspense, useState } from 'react';
import AuthLayout from '@/shared/layouts/AuthLayout';
import SocialAuthSection from '@/shared/components/auth/SocialAuthSection';
import Link from 'next/link';
import { Button, Input } from '@/shared/components/ui';
import { AqCheck, AqCopy06, AqRefreshCw01 } from '@airqo/icons-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '@/shared/components/ui';
import {
  PASSWORD_SPECIAL_CHARS,
  registerSchema,
  type RegisterFormData,
} from '@/shared/lib/validators';
import { PasswordRequirements } from '@/shared/components/ui/password-requirements';
import {
  FIRST_NAME_MAX,
  LAST_NAME_MAX,
  EMAIL_MAX,
  PASSWORD_MAX,
} from '@/shared/lib/validation-limits';
import { useRegister } from '@/shared/hooks/useAuth';
import { getUserFriendlyErrorMessage } from '@/shared/utils/errorMessages';
import { useRouter } from 'next/navigation';
import { LoadingState } from '@/shared/components/ui/loading-state';

const GENERATED_PASSWORD_LENGTH = 20;
const PASSWORD_CHARACTERS = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789${PASSWORD_SPECIAL_CHARS}`;

const getSecureRandomIndex = (max: number) => {
  if (!globalThis.crypto?.getRandomValues) {
    throw new Error('Secure random number generation is unavailable');
  }

  const range = 0x100000000;
  const limit = range - (range % max);
  const randomValue = new Uint32Array(1);

  do {
    globalThis.crypto.getRandomValues(randomValue);
  } while (randomValue[0] >= limit);

  return randomValue[0] % max;
};

const generateSecurePassword = () => {
  const passwordCharacters = [
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[getSecureRandomIndex(26)],
    'abcdefghijklmnopqrstuvwxyz'[getSecureRandomIndex(26)],
    '0123456789'[getSecureRandomIndex(10)],
    PASSWORD_SPECIAL_CHARS[getSecureRandomIndex(PASSWORD_SPECIAL_CHARS.length)],
  ];

  while (passwordCharacters.length < GENERATED_PASSWORD_LENGTH) {
    passwordCharacters.push(
      PASSWORD_CHARACTERS[getSecureRandomIndex(PASSWORD_CHARACTERS.length)]
    );
  }

  for (let index = passwordCharacters.length - 1; index > 0; index -= 1) {
    const swapIndex = getSecureRandomIndex(index + 1);
    [passwordCharacters[index], passwordCharacters[swapIndex]] = [
      passwordCharacters[swapIndex],
      passwordCharacters[index],
    ];
  }

  return passwordCharacters.join('');
};

export default function RegisterPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <RegisterPageContent />
    </Suspense>
  );
}

function RegisterPageContent() {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
    },
    mode: 'onChange',
  });

  const passwordValue = watch('password');
  const [passwordCopied, setPasswordCopied] = useState(false);

  const { trigger: registerUser, isMutating } = useRegister();
  const router = useRouter();

  const handleGeneratePassword = () => {
    try {
      setValue('password', generateSecurePassword(), {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setPasswordCopied(false);
    } catch {
      toast.error(
        'Unable to generate password',
        'Please try again or create a password manually.'
      );
    }
  };

  const handleCopyPassword = async () => {
    if (!passwordValue) {
      toast.error('No password to copy', 'Generate or enter a password first.');
      return;
    }

    try {
      await navigator.clipboard.writeText(passwordValue);
      setPasswordCopied(true);
      toast.success('Password copied', 'Your password is ready to paste.');
    } catch {
      toast.error(
        'Unable to copy password',
        'Your browser may be blocking clipboard access.'
      );
    }
  };

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
        response.message || 'Welcome to AirQo Nexus'
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
    >
      <form onSubmit={handleSubmit(onSubmit)} className="w-full">
        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex-1">
            <Input
              label="First name"
              placeholder="Enter your first name"
              error={errors.firstName?.message}
              maxLength={FIRST_NAME_MAX}
              {...register('firstName')}
            />
          </div>

          <div className="flex-1">
            <Input
              label="Last name"
              placeholder="Enter your last name"
              error={errors.lastName?.message}
              maxLength={LAST_NAME_MAX}
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
          maxLength={EMAIL_MAX}
          {...register('email')}
        />

        <div className="mb-4">
          <Input
            label="Password"
            type="password"
            placeholder="Create password"
            error={errors.password?.message}
            showPasswordToggle
            maxLength={PASSWORD_MAX}
            containerClassName="mb-2"
            {...register('password', {
              onChange: () => setPasswordCopied(false),
            })}
          />

          <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1">
            <Button
              type="button"
              variant="text"
              size="sm"
              Icon={AqRefreshCw01}
              showTextOnMobile
              onClick={handleGeneratePassword}
              aria-label="Generate a secure password"
              title="Generate a secure password"
              className="px-2"
            >
              Generate password
            </Button>
            <Button
              type="button"
              variant="text"
              size="sm"
              Icon={passwordCopied ? AqCheck : AqCopy06}
              showTextOnMobile
              onClick={handleCopyPassword}
              disabled={!passwordValue}
              aria-label={passwordCopied ? 'Password copied' : 'Copy password'}
              title="Copy password"
              className="px-2"
            >
              {passwordCopied ? 'Copied' : 'Copy password'}
            </Button>
          </div>

          <PasswordRequirements password={passwordValue || ''} />
        </div>

        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          By continuing, you agree to the{' '}
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
          .
        </p>

        <Button
          type="submit"
          fullWidth
          loading={isMutating}
          disabled={!isValid || isMutating}
          className="mt-6"
        >
          Continue
        </Button>
      </form>

      <SocialAuthSection
        mode="register"
        disabled={isMutating}
        className="mt-6"
      />

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
