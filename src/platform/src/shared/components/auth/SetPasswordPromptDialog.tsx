'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSession } from 'next-auth/react';
import ReusableDialog from '@/shared/components/ui/dialog';
import { Banner, Input, toast } from '@/shared/components/ui';
import { useSetPassword } from '@/shared/hooks';
import { verifyBackendOAuthSession } from '@/shared/lib/oauth-session';
import {
  setPasswordSchema,
  type SetPasswordFormData,
} from '@/shared/lib/validators';
import type { AuthMethods } from '@/shared/types/api';

const DISMISS_STORAGE_KEY_PREFIX = 'airqo:set-password-dismissed:';
const SET_PASSWORD_PROMPT_DELAY_MS = 5000;

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

type SessionRefreshOutcome = 'fresh' | 'fallback' | 'failed';

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
  const openTimerRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);
  const refreshControllerRef = useRef<AbortController | null>(null);
  const sessionData = session as {
    authMethods?: AuthMethods;
    user?: {
      _id?: string | null;
      email?: string | null;
    } | null;
  } | null;

  const authMethods = sessionData?.authMethods;
  const hasAuthMethods = !!authMethods;
  const hasPassword = authMethods?.password === true;
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
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      refreshControllerRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (openTimerRef.current) {
      window.clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }

    if (status !== 'authenticated' || !dismissStorageKey || !hasAuthMethods) {
      setIsOpen(false);
      return;
    }

    if (hasPassword) {
      sessionStorage.removeItem(dismissStorageKey);
      setIsOpen(false);
      return;
    }

    const dismissed = sessionStorage.getItem(dismissStorageKey) === 'true';
    if (dismissed) {
      setIsOpen(false);
      return;
    }

    setIsOpen(false);
    openTimerRef.current = window.setTimeout(() => {
      setIsOpen(true);
      openTimerRef.current = null;
    }, SET_PASSWORD_PROMPT_DELAY_MS);

    return () => {
      if (openTimerRef.current) {
        window.clearTimeout(openTimerRef.current);
        openTimerRef.current = null;
      }
    };
  }, [dismissStorageKey, hasAuthMethods, hasPassword, status]);

  const closeForNow = () => {
    if (dismissStorageKey) {
      sessionStorage.setItem(dismissStorageKey, 'true');
    }
    setIsOpen(false);
  };

  const refreshSessionState = async (
    fallbackAuthMethods: AuthMethods
  ): Promise<SessionRefreshOutcome> => {
    refreshControllerRef.current?.abort();

    const controller = new AbortController();
    refreshControllerRef.current = controller;

    try {
      const refreshedProfile = await verifyBackendOAuthSession({
        signal: controller.signal,
      });

      if (!isMountedRef.current) {
        return 'failed';
      }

      await update({
        ...(refreshedProfile?.accessToken
          ? { accessToken: refreshedProfile.accessToken }
          : {}),
        authMethods: refreshedProfile?.authMethods ?? fallbackAuthMethods,
      });

      return refreshedProfile?.authMethods ? 'fresh' : 'fallback';
    } catch (error) {
      const errorName = (error as { name?: string })?.name;
      if (errorName !== 'AbortError') {
        console.warn('Failed to refresh session after setting password', error);
      }

      if (!isMountedRef.current || errorName === 'AbortError') {
        return 'failed';
      }

      try {
        await update({ authMethods: fallbackAuthMethods });
        return 'fallback';
      } catch (updateError) {
        console.warn(
          'Failed to apply fallback auth methods after setting password',
          updateError
        );
        return 'failed';
      }
    } finally {
      if (refreshControllerRef.current === controller) {
        refreshControllerRef.current = null;
      }

      if (dismissStorageKey) {
        sessionStorage.removeItem(dismissStorageKey);
      }

      if (isMountedRef.current) {
        setIsOpen(false);
      }
    }
  };

  const onSubmit = async (data: SetPasswordFormData) => {
    const nextAuthMethods: AuthMethods = {
      ...DEFAULT_AUTH_METHODS,
      ...authMethods,
      password: true,
    };

    try {
      await setPassword({
        password: data.password,
        confirmPassword: data.confirmPassword,
      });

      const refreshOutcome = await refreshSessionState(nextAuthMethods);
      if (!isMountedRef.current) {
        return;
      }

      reset();

      if (refreshOutcome === 'fresh') {
        toast.success(
          'Password added',
          'You can now sign in with your email and password whenever you need to.'
        );
      } else if (refreshOutcome === 'fallback') {
        toast.warning(
          'Password saved',
          'Your password was saved, but the latest sign-in methods could not be confirmed from the server yet. This session was updated locally to avoid stale prompts.'
        );
      } else {
        toast.warning(
          'Password saved',
          'Your password was saved, but this session could not be refreshed. Please reload if the prompt appears again.'
        );
      }
    } catch (error) {
      const message =
        error instanceof Error && error.message.trim()
          ? error.message.trim()
          : 'Unable to set your password right now.';

      if (message.toLowerCase().includes('already set')) {
        const nextAuthMethods: AuthMethods = {
          ...DEFAULT_AUTH_METHODS,
          ...authMethods,
          password: true,
        };
        const refreshOutcome = await refreshSessionState(nextAuthMethods);

        if (!isMountedRef.current) {
          return;
        }

        if (refreshOutcome === 'fresh') {
          toast.success(
            'Password already available',
            'Your account already has a password. You can manage it from Security settings.'
          );
        } else if (refreshOutcome === 'fallback') {
          toast.warning(
            'Password already available',
            'Your account already has a password. This session was updated locally while the latest auth settings sync catches up.'
          );
        } else {
          toast.warning(
            'Password already available',
            'Your account already has a password, but the current session could not be refreshed.'
          );
        }
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
      className="outline-none focus:outline-none focus-visible:outline-none ring-0"
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
