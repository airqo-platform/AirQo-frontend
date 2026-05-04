'use client';

import { useCallback, useState } from 'react';
import ReusableButton from '@/components/shared/button/ReusableButton';
import { cn } from '@/lib/utils';
import { buildOAuthInitiationUrl } from '@/core/auth/oauth-session';
import ReusableToast from '@/components/shared/toast/ReusableToast';

interface GoogleAuthSectionProps {
  disabled?: boolean;
  className?: string;
}

const GoogleIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    width="16"
    height="16"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.11c-.22-.66-.35-1.36-.35-2.11s.13-1.45.35-2.11V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.83z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.83c.87-2.6 3.3-4.51 6.16-4.51z"
      fill="#EA4335"
    />
  </svg>
);

export default function GoogleAuthSection({
  disabled = false,
  className,
}: GoogleAuthSectionProps) {
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleGoogleAuth = useCallback(() => {
    if (typeof window === 'undefined' || disabled) return;

    setIsRedirecting(true);

    try {
      window.location.replace(
        buildOAuthInitiationUrl('google', {
          prompt: 'select_account',
          tenant: 'airqo',
        })
      );
    } catch (error) {
      setIsRedirecting(false);
      ReusableToast({
        message: 'Google sign-in unavailable. Please try again in a moment.',
        type: 'ERROR',
      });
      console.error('Failed to start Google OAuth flow:', error);
    }
  }, [disabled]);

  return (
    <div className={cn('w-full space-y-4', className)}>
      <ReusableButton
        type="button"
        variant="outlined"
        disabled={disabled || isRedirecting}
        loading={isRedirecting}
        Icon={GoogleIcon}
        onClick={handleGoogleAuth}
        className="w-full !border-border !bg-background !text-foreground hover:!bg-accent hover:!text-accent-foreground dark:!border-border dark:!bg-background dark:!text-foreground dark:hover:!bg-accent dark:hover:!text-accent-foreground h-11 transition-all"
      >
        Continue with Google
      </ReusableButton>

      <div className="flex justify-center">
        <span className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
          Or
        </span>
      </div>
    </div>
  );
}
