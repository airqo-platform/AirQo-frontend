'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSession } from 'next-auth/react';
import ReusableDialog from '@/shared/components/ui/dialog';
import { Banner, Input, toast } from '@/shared/components/ui';
import { useSetPassword } from '@/shared/hooks';
import {
  setPasswordSchema,
  type SetPasswordFormData,
} from '@/shared/lib/validators';
import type { AuthMethods } from '@/shared/types/api';

const DISMISS_STORAGE_KEY_PREFIX = 'airqo:set-password-dismissed:';

const CONNECTED_PROVIDER_LABELS: Record<
  Exclude<keyof AuthMethods, 'password'>,
  string
> = {
  google: 'Google',
  github: 'GitHub',
  linkedin: 'LinkedIn',
  microsoft: 'Microsoft',
  twitter: 'X',
  facebook: 'Facebook',
  apple: 'Apple',
};

const DEFAULT_AUTH_METHODS: AuthMethods = {
  password: false,
  google: false,
  github: false,
  linkedin: false,
  microsoft: false,
  twitter: false,
  facebook: false,
  apple: false,
};

const buildProviderSummary = (providers: string[]) => {
  if (!providers.length) {
    return 'a connected account';
  }

  if (providers.length === 1) {
    return providers[0];
  }

  if (providers.length === 2) {
    return `${providers[0]} and ${providers[1]}`;
  }

  return `${providers.slice(0, -1).join(', ')}, and ${providers.at(-1)}`;
};

const SetPasswordPromptDialog = () => {
  const { data: session, status, update } = useSession();
  const { trigger: setPassword, isMutating } = useSetPassword();
  const [isOpen, setIsOpen] = useState(false);
  const sessionData = session as {
    authMethods?: AuthMethods;
    user?: {
      _id?: string | null;
      email?: string | null;
      authMethods?: AuthMethods;
    } | null;
  } | null;

  const authMethods =
    sessionData?.authMethods || sessionData?.user?.authMethods || undefined;
  const userId =
    sessionData?.user?._id?.trim() || sessionData?.user?.email?.trim();
  const dismissStorageKey = userId
    ? `${DISMISS_STORAGE_KEY_PREFIX}${userId}`
    : null;
  const linkedProviders = useMemo(
    () =>
      authMethods
        ? (
            Object.entries(CONNECTED_PROVIDER_LABELS) as Array<
              [Exclude<keyof AuthMethods, 'password'>, string]
            >
          )
            .filter(([provider]) => authMethods[provider])
            .map(([, label]) => label)
        : [],
    [authMethods]
  );
  const providerSummary = useMemo(
    () => buildProviderSummary(linkedProviders),
    [linkedProviders]
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SetPasswordFormData>({
    resolver: zodResolver(setPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
    mode: 'onChange',
  });

  useEffect(() => {
    if (status !== 'authenticated' || !dismissStorageKey || !authMethods) {
      setIsOpen(false);
      return;
    }

    if (authMethods.password) {
      sessionStorage.removeItem(dismissStorageKey);
      setIsOpen(false);
      return;
    }

    const dismissed = sessionStorage.getItem(dismissStorageKey) === 'true';
    setIsOpen(!dismissed);
  }, [authMethods, dismissStorageKey, status]);

  const closeForNow = () => {
    if (dismissStorageKey) {
      sessionStorage.setItem(dismissStorageKey, 'true');
    }
    setIsOpen(false);
  };

  const markPasswordAsConfigured = async () => {
    const nextAuthMethods: AuthMethods = {
      ...DEFAULT_AUTH_METHODS,
      ...authMethods,
      password: true,
    };

    await update({ authMethods: nextAuthMethods });

    if (dismissStorageKey) {
      sessionStorage.removeItem(dismissStorageKey);
    }

    setIsOpen(false);
  };

  const onSubmit = async (data: SetPasswordFormData) => {
    try {
      await setPassword({
        password: data.password,
        confirmPassword: data.confirmPassword,
      });

      await markPasswordAsConfigured();
      reset();
      toast.success(
        'Password added',
        'You can now sign in with your email and password whenever you need to.'
      );
    } catch (error) {
      const message =
        error instanceof Error && error.message.trim()
          ? error.message.trim()
          : 'Unable to set your password right now.';

      if (message.toLowerCase().includes('already set')) {
        await markPasswordAsConfigured();
        toast.success(
          'Password already available',
          'Your account already has a password. You can manage it from Security settings.'
        );
        return;
      }

      toast.error('Unable to save your password', message);
    }
  };

  if (!authMethods || authMethods.password || status !== 'authenticated') {
    return null;
  }

  return (
    <ReusableDialog
      isOpen={isOpen}
      onClose={closeForNow}
      title="Add a password for direct sign-in"
      subtitle={`You're signed in with ${providerSummary}. Add a password to enable direct email sign-in for this account.`}
      size="lg"
      preventBackdropClose={isMutating}
      primaryAction={{
        label: isMutating ? 'Saving...' : 'Save password',
        onClick: () => {
          void handleSubmit(onSubmit)();
        },
        loading: isMutating,
        disabled: isMutating,
      }}
      secondaryAction={{
        label: 'Not now',
        onClick: closeForNow,
        disabled: isMutating,
        variant: 'outlined',
      }}
      ariaLabel="Set account password"
    >
      <form
        className="space-y-5"
        onSubmit={event => {
          event.preventDefault();
          void handleSubmit(onSubmit)();
        }}
      >
        <Banner
          severity="info"
          title="Why set a password"
          message="A password adds another secure sign-in method, so you can access this account directly with your email whenever needed."
          showIcon={true}
        />

        <Input
          {...register('password')}
          label="New password"
          type="password"
          placeholder="Create a password"
          error={errors.password?.message}
          required
          showPasswordToggle
        />

        <Input
          {...register('confirmPassword')}
          label="Confirm password"
          type="password"
          placeholder="Re-enter your password"
          error={errors.confirmPassword?.message}
          required
          showPasswordToggle
        />

        <p className="text-xs text-muted-foreground">
          Use 6 to 30 characters with at least one letter and one number.
        </p>
      </form>
    </ReusableDialog>
  );
};

export default SetPasswordPromptDialog;
