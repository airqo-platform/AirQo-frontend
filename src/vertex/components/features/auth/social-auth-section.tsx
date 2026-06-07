'use client';

import { useCallback, useEffect, useState } from 'react';
import { FaGithub, FaLinkedinIn } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { FcGoogle } from 'react-icons/fc';
import {
  buildOAuthInitiationUrl,
  getLastUsedOAuthProvider,
  resolveOAuthRedirectAfterUrl,
  setLastUsedOAuthProvider,
  type SupportedSocialAuthProvider,
} from '@/core/auth/oauth-session';
import { cn } from '@/lib/utils';
import { useBanner } from '@/context/banner-context';
import { getLastActiveModule } from '@/core/utils/userPreferences';

interface SocialAuthSectionProps {
  mode: 'login' | 'register';
  disabled?: boolean;
  className?: string;
  callbackUrl?: string | null;
}

const SOCIAL_PROVIDERS: Array<{
  provider: SupportedSocialAuthProvider;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  iconClassName?: string;
}> = [
  {
    provider: 'google',
    label: 'Google',
    Icon: FcGoogle,
  },
  {
    provider: 'github',
    label: 'GitHub',
    Icon: FaGithub,
    iconClassName: 'text-slate-950 dark:text-white',
  },
  {
    provider: 'linkedin',
    label: 'LinkedIn',
    Icon: FaLinkedinIn,
    iconClassName: 'text-[#0A66C2]',
  },
  {
    provider: 'twitter',
    label: 'X',
    Icon: FaXTwitter,
    iconClassName: 'text-slate-950 dark:text-white',
  },
];

export default function SocialAuthSection({
  mode,
  disabled = false,
  className,
  callbackUrl,
}: SocialAuthSectionProps) {
  const { showBanner } = useBanner();
  const actionLabel = mode === 'register' ? 'Continue with' : 'Sign in with';
  const lastModule = getLastActiveModule();
  const fallbackUrl = lastModule === 'admin' ? '/admin/networks' : '/home';
  const redirectPath = callbackUrl || fallbackUrl;
  const [lastUsedProvider, setLastUsedProvider] =
    useState<SupportedSocialAuthProvider | null>(null);

  useEffect(() => {
    setLastUsedProvider(getLastUsedOAuthProvider());
  }, []);

  const orderedProviders = lastUsedProvider
    ? [
        ...SOCIAL_PROVIDERS.filter(
          ({ provider }) => provider === lastUsedProvider
        ),
        ...SOCIAL_PROVIDERS.filter(
          ({ provider }) => provider !== lastUsedProvider
        ),
      ]
    : SOCIAL_PROVIDERS;

  const handleSocialAuth = useCallback(
    (provider: SupportedSocialAuthProvider) => {
      if (typeof window === 'undefined' || disabled) return;

      const redirectAfter = resolveOAuthRedirectAfterUrl(redirectPath);
      const queryParams: Record<string, string> = {};

      if (redirectAfter) {
        queryParams.redirect_after = redirectAfter;
      }


      try {
        setLastUsedOAuthProvider(provider);
        window.location.replace(buildOAuthInitiationUrl(provider, queryParams));
      } catch (error) {
        showBanner({
          severity: 'error',
          message: `Social sign-in unavailable. Please try again in a moment.`,
          scoped: true,
        });
        console.error(`Failed to start ${provider} OAuth flow:`, error);
      }
    },
    [disabled, redirectPath, showBanner]
  );

  return (
    <div className={cn('w-full space-y-4', className)}>
      <div className="grid grid-cols-4 gap-2">
        {orderedProviders.map(({ provider, label, Icon, iconClassName }) => {
          const isLastUsed = provider === lastUsedProvider;

          return (
            <button
              key={provider}
              type="button"
              disabled={disabled}
              onClick={() => handleSocialAuth(provider)}
              aria-label={`${actionLabel} ${label}`}
              title={`${actionLabel} ${label}`}
              className={cn(
                'relative flex h-10 items-center justify-center overflow-hidden rounded-md border bg-white px-1.5 text-gray-900 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-white disabled:text-gray-400 dark:bg-transparent dark:text-gray-100 dark:disabled:border-slate-700 dark:disabled:bg-transparent dark:disabled:text-gray-500',
                isLastUsed
                  ? 'border-primary/50 bg-primary/5 hover:bg-primary/10 dark:border-primary/50 dark:bg-slate-900'
                  : 'border-slate-300 hover:bg-slate-50 hover:text-gray-900 dark:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-gray-100'
              )}
            >
              <Icon
                className={cn(
                  'h-4 w-4 transition-transform duration-200 sm:h-[17px] sm:w-[17px]',
                  iconClassName,
                  isLastUsed && 'scale-105'
                )}
              />
              {isLastUsed ? (
                <span className="absolute right-1 top-1 rounded-full bg-primary/10 px-1 py-0 text-[8px] font-semibold uppercase tracking-[0.08em] text-primary dark:bg-primary/15 dark:text-primary-foreground">
                  Last used
                </span>
              ) : null}
              <span className="sr-only">{`${actionLabel} ${label}`}</span>
            </button>
          );
        })}
      </div>
      
      <div className="flex items-center gap-4">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
          Or
        </span>
        <span className="h-px flex-1 bg-border" />
      </div>
    </div>
  );
}
