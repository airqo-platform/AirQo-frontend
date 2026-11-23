'use client';

import { FaGithub, FaLinkedinIn } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { FcGoogle } from 'react-icons/fc';

/*
 * "Or" divider and the row of Google, GitHub, LinkedIn and X sign-in buttons, with
 * a "Last used" badge on the provider the person used last.
 *
 * Markup copied from Beacon's components/auth/social-auth-section.tsx. Nexus
 * (shared/components/auth/SocialAuthSection.tsx) and Vertex
 * (components/features/auth/social-auth-section.tsx) have the same grid.
 * Each app builds the OAuth URL and stores the last-used provider in its own
 * oauth-session module, so this only draws the buttons: the app passes
 * `lastUsedProvider` and starts the sign-in in `onProviderClick`.
 */

export type SupportedSocialAuthProvider = 'google' | 'github' | 'linkedin' | 'twitter';

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

interface SocialAuthSectionProps {
  mode: 'login' | 'register';
  onProviderClick: (provider: SupportedSocialAuthProvider) => void;
  lastUsedProvider?: SupportedSocialAuthProvider | null;
  /** Show only these providers (Nexus hides some per account). */
  providers?: SupportedSocialAuthProvider[];
  disabled?: boolean;
  className?: string;
}

export default function SocialAuthSection({
  mode,
  onProviderClick,
  lastUsedProvider = null,
  providers,
  disabled = false,
  className = "",
}: SocialAuthSectionProps) {
  const actionLabel = mode === 'register' ? 'Continue with' : 'Sign in with';
  const availableProviders = providers
    ? SOCIAL_PROVIDERS.filter(({ provider }) => providers.includes(provider))
    : SOCIAL_PROVIDERS;

  const orderedProviders = lastUsedProvider
    ? [
        ...availableProviders.filter(
          ({ provider }) => provider === lastUsedProvider
        ),
        ...availableProviders.filter(
          ({ provider }) => provider !== lastUsedProvider
        ),
      ]
    : availableProviders;

  if (orderedProviders.length === 0) return null;

  return (
    <div className={`w-full space-y-3.5 ${className}`}>
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
              onClick={() => onProviderClick(provider)}
              aria-label={`${actionLabel} ${label}`}
              title={`${actionLabel} ${label}`}
              className={`relative flex h-10 items-center justify-center overflow-hidden rounded-md border bg-white px-1.5 text-gray-900 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-white disabled:text-gray-400 dark:bg-transparent dark:text-gray-100 dark:disabled:border-slate-700 dark:disabled:bg-transparent dark:disabled:text-gray-500 cursor-pointer ${
                isLastUsed
                  ? 'border-primary/50 bg-primary/10 hover:bg-primary/20 dark:border-primary/50 dark:bg-slate-900'
                  : 'border-slate-300 hover:bg-slate-50 hover:text-gray-900 dark:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-gray-100'
              }`}
            >
              <Icon
                className={`h-4 w-4 transition-transform duration-200 sm:h-[17px] sm:w-[17px] ${iconClassName || ''} ${
                  isLastUsed ? 'scale-105' : ''
                }`}
              />
              {isLastUsed ? (
                <span className="absolute right-1 top-1 rounded-full bg-primary/10 px-1 py-0 text-[8px] font-semibold uppercase tracking-[0.08em] text-primary dark:bg-primary/20 dark:text-primary">
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
