'use client';

import { useCallback, useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { Button, toast } from '@/shared/components/ui';
import { cn } from '@/shared/lib/utils';
import { buildOAuthInitiationUrl } from '@/shared/lib/oauth-session';

interface GoogleAuthSectionProps {
  mode: 'login' | 'register';
  tenant?: string;
  className?: string;
}

export default function GoogleAuthSection({
  mode,
  tenant = 'airqo',
  className,
}: GoogleAuthSectionProps) {
  const [isRedirecting, setIsRedirecting] = useState(false);

  const label =
    mode === 'register' ? 'Continue with Google' : 'Sign in with Google';

  const handleGoogleAuth = useCallback(() => {
    if (typeof window === 'undefined') return;

    setIsRedirecting(true);

    try {
      window.location.assign(buildOAuthInitiationUrl('google', tenant));
    } catch (error) {
      setIsRedirecting(false);
      toast.error(
        'Google sign-in unavailable',
        'Please try again in a moment.'
      );
      console.error('Failed to start Google OAuth flow:', error);
    }
  }, [tenant]);

  return (
    <div className={cn('w-full space-y-4', className)}>
      <div className="flex items-center gap-4">
        <span className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
        <span className="text-xs font-medium uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
          Or
        </span>
        <span className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
      </div>

      <Button
        type="button"
        fullWidth
        variant="outlined"
        loading={isRedirecting}
        disabled={isRedirecting}
        Icon={FcGoogle}
        iconPosition="start"
        onClick={handleGoogleAuth}
        className="border-slate-300 bg-white text-gray-900 hover:bg-slate-50 hover:text-gray-900 dark:border-slate-700 dark:bg-transparent dark:text-gray-100 dark:hover:bg-slate-800"
      >
        <span style={{ color: 'rgb(17 24 39)' }}>{label}</span>
      </Button>
    </div>
  );
}
