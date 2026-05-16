'use client';

import React, { useRef, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useHCaptcha } from './HCaptchaProvider';

export interface InvisibleHCaptchaProps {
  siteKey: string;
  onVerify: (token: string) => void;
  onError?: (error: string) => void;
  onExpire?: () => void;
  children?: React.ReactNode;
  enabled?: boolean;
}

export interface InvisibleHCaptchaRef {
  execute: () => void;
  reset: () => void;
}

const InvisibleHCaptcha = forwardRef<InvisibleHCaptchaRef, InvisibleHCaptchaProps>(
  function InvisibleHCaptcha(
    { siteKey, onVerify, onError, onExpire, children, enabled = true },
    ref
  ) {
    const { loaded, error: loadError, resetKey } = useHCaptcha();
    const widgetId = useRef<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
      execute: () => {
        if (widgetId.current && typeof window !== 'undefined' && window.hcaptcha) {
          window.hcaptcha.execute(widgetId.current);
        }
      },
      reset: () => {
        if (widgetId.current && typeof window !== 'undefined' && window.hcaptcha) {
          window.hcaptcha.reset(widgetId.current);
        }
      },
    }));

    useEffect(() => {
      if (!enabled || !loaded || loadError) return;

      if (containerRef.current && typeof window !== 'undefined' && window.hcaptcha) {
        const id = window.hcaptcha.render(containerRef.current, {
          sitekey: siteKey,
          size: 'invisible',
          callback: (token: string) => {
            onVerify(token);
          },
          'error-callback': (errorCode: string) => {
            onError?.(`hCaptcha error: ${errorCode}`);
          },
          'expired-callback': () => {
            onExpire?.();
          },
        });
        widgetId.current = id;
      }

      return () => {
        if (widgetId.current && typeof window !== 'undefined' && window.hcaptcha) {
          window.hcaptcha.remove(widgetId.current);
          widgetId.current = null;
        }
      };
    }, [siteKey, loaded, loadError, enabled, resetKey, onVerify, onError, onExpire]);

    if (!enabled || loadError) {
      return <>{children}</>;
    }

    return (
      <>
        <div ref={containerRef} style={{ display: 'none' }} />
        {children}
      </>
    );
  }
);

export default InvisibleHCaptcha;
