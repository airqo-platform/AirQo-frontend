'use client';

import { useCallback } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { Button, toast } from '@/shared/components/ui';
import { cn } from '@/shared/lib/utils';

interface GoogleAuthSectionProps {
  mode: 'login' | 'register';
  disabled?: boolean;
  className?: string;
}

export default function GoogleAuthSection({
  mode,
  disabled = false,
  className,
}: GoogleAuthSectionProps) {
  const label =
    mode === 'register' ? 'Continue with Google' : 'Sign in with Google';

  const handleGoogleAuth = useCallback(() => {
    if (typeof window === 'undefined' || disabled) return;

    toast.error(
      'Google sign-in unavailable',
      'Google sign-in is currently unavailable. Please continue with your email and password.'
    );
  }, [disabled]);

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
        loading={false}
        disabled={disabled}
        Icon={FcGoogle}
        iconPosition="start"
        onClick={handleGoogleAuth}
        className="!border-slate-300 !bg-white !text-gray-900 hover:!bg-slate-50 hover:!text-gray-900 disabled:!border-slate-300 disabled:!bg-white disabled:!text-gray-400 disabled:hover:!bg-white disabled:hover:!text-gray-400 dark:!border-slate-700 dark:!bg-transparent dark:!text-gray-100 dark:hover:!bg-slate-800 dark:hover:!text-gray-100 dark:disabled:!border-slate-700 dark:disabled:!bg-transparent dark:disabled:!text-gray-500"
      >
        <span className="text-current">{label}</span>
      </Button>
    </div>
  );
}
