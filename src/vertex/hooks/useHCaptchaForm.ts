'use client';

import { useState, useCallback, useRef } from 'react';
import { useHCaptcha } from '@/components/hcaptcha/HCaptchaProvider';

export interface UseHCaptchaFormReturn {
  isVerifying: boolean;
  error: string | null;
  verifyToken: string | null;
  execute: () => void;
  reset: () => void;
  isEnabled: boolean;
}

/**
 * Hook for integrating hCaptcha with forms
 * Provides verification state management and token handling
 */
export function useHCaptchaForm(
  onVerifySuccess: (token: string) => void | Promise<void>,
  enabled: boolean = true
): UseHCaptchaFormReturn {
  const { loaded, error: loadError } = useHCaptcha();
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verifyToken, setVerifyToken] = useState<string | null>(null);
  const onSuccessRef = useRef(onVerifySuccess);

  onSuccessRef.current = onVerifySuccess;

  const execute = useCallback(async () => {
    if (!enabled) {
      await onSuccessRef.current('');
      return;
    }

    setIsVerifying(true);
    setError(null);
  }, [enabled]);

  const handleVerify = useCallback(
    async (token: string) => {
      if (!enabled) {
        await onSuccessRef.current('');
        return;
      }

      try {
        const response = await fetch('/api/hcaptcha/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        const result = await response.json();

        if (result.success) {
          setVerifyToken(token);
          await onSuccessRef.current(token);
        } else {
          setError(result.error || 'hCaptcha verification failed');
        }
      } catch (err) {
        setError('hCaptcha verification error');
      } finally {
        setIsVerifying(false);
      }
    },
    [enabled]
  );

  const reset = useCallback(() => {
    setVerifyToken(null);
    setError(null);
    setIsVerifying(false);
  }, []);

  const isEnabled = enabled && loaded && !loadError;

  return {
    isVerifying,
    error,
    verifyToken,
    execute,
    reset,
    isEnabled,
  };
}
