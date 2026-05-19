'use client';

import { useCallback, useState } from 'react';
import ReusableButton from '@/components/shared/button/ReusableButton';
import { cn } from '@/lib/utils';
import { buildOAuthInitiationUrl } from '@/core/auth/oauth-session';
import { useBanner } from '@/context/banner-context';
import { FcGoogle } from 'react-icons/fc';

interface GoogleAuthSectionProps {
  disabled?: boolean;
  className?: string;
  callbackUrl?: string;
}

// Removed custom GoogleIcon in favor of react-icons/fc

export default function GoogleAuthSection({
  disabled = false,
  className,
  callbackUrl,
}: GoogleAuthSectionProps) {
  const { showBanner } = useBanner();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleGoogleAuth = useCallback(() => {
    if (typeof window === 'undefined' || disabled) return;

    setIsRedirecting(true);

    try {
      window.location.replace(
        buildOAuthInitiationUrl('google', {
          prompt: 'select_account',
          tenant: 'airqo',
          callbackUrl: callbackUrl,
        })
      );
    } catch (error) {
      setIsRedirecting(false);
      showBanner({
        severity: 'error',
        message: 'Google sign-in unavailable. Please try again in a moment.',
        scoped: true,
      });
      console.error('Failed to start Google OAuth flow:', error);
    }
  }, [disabled, callbackUrl, showBanner]);

  return (
    <div className={cn('w-full space-y-4', className)}>
      <ReusableButton
        type="button"
        variant="outlined"
        disabled={disabled || isRedirecting}
        loading={isRedirecting}
        Icon={FcGoogle}
        onClick={handleGoogleAuth}
        className="w-full !border-border !bg-white !text-foreground hover:!bg-accent hover:!text-accent-foreground dark:!border-border dark:!bg-background dark:!text-foreground dark:hover:!bg-accent dark:hover:!text-accent-foreground transition-all"
      >
        Continue with Google
      </ReusableButton>

      <div className="flex justify-center">
        <span className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground">
          Or
        </span>
      </div>
    </div>
  );
}
