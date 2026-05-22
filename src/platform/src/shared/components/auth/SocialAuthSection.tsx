'use client';

import { useCallback, useEffect, useState } from 'react';
import { FaGithub, FaLinkedinIn } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { FcGoogle } from 'react-icons/fc';
import { normalizeCallbackUrl } from '@/shared/lib/auth-redirect';
import {
  buildOAuthInitiationUrl,
  getLastUsedOAuthProvider,
  resolveOAuthRedirectAfterUrl,
  type SupportedSocialAuthProvider,
} from '@/shared/lib/oauth-session';
import { cn } from '@/shared/lib/utils';

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

const LOCAL_TEST_HOSTNAMES = new Set([
  'localhost',
  '127.0.0.1',
  '::1',
  '0.0.0.0',
]);

const shouldShowSocialAuth = (hostname: string): boolean => {
  const normalizedHostname = hostname.toLowerCase();

  return (
    normalizedHostname === 'staging' ||
    normalizedHostname.startsWith('staging.') ||
    LOCAL_TEST_HOSTNAMES.has(normalizedHostname)
  );
};

export default function SocialAuthSection({
  mode,
  disabled = false,
  className,
  callbackUrl,
}: SocialAuthSectionProps) {
  const actionLabel = mode === 'register' ? 'Continue with' : 'Sign in with';
  const redirectPath = normalizeCallbackUrl(callbackUrl) || '/user/home';
  const [isStagingDomain, setIsStagingDomain] = useState(false);
  const [lastUsedProvider, setLastUsedProvider] =
    useState<SupportedSocialAuthProvider | null>(null);

  useEffect(() => {
    setIsStagingDomain(shouldShowSocialAuth(window.location.hostname));
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

      if (provider === 'google') {
        queryParams.prompt = 'select_account';
      }

      window.location.replace(buildOAuthInitiationUrl(provider, queryParams));
    },
    [disabled, redirectPath]
  );

  if (!isStagingDomain) {
    return null;
  }

  return (
    <div className={cn('w-full space-y-2.5', className)}>
      <div className="flex items-center gap-4">
        <span className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
        <span className="text-xs font-medium uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
          Or
        </span>
        <span className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
      </div>

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
                'relative flex h-10 items-center justify-center overflow-hidden rounded-md border bg-white px-1.5 text-gray-900 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-white disabled:text-gray-400 dark:bg-transparent dark:text-gray-100 dark:disabled:border-slate-700 dark:disabled:bg-transparent dark:disabled:text-gray-500',
                isLastUsed
                  ? 'border-blue-500/50 bg-blue-50/70 hover:bg-blue-50 dark:border-blue-500/50 dark:bg-slate-900'
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
                <span className="absolute right-1 top-1 rounded-full bg-blue-600/10 px-1 py-0 text-[8px] font-semibold uppercase tracking-[0.08em] text-blue-700 dark:bg-blue-500/15 dark:text-blue-200">
                  Last used
                </span>
              ) : null}
              <span className="sr-only">{`${actionLabel} ${label}`}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
