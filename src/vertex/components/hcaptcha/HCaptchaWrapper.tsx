'use client';

import React from 'react';
import { HCaptchaProvider } from './HCaptchaProvider';
import { getHCaptchaConfig } from '@/lib/hcaptcha';

interface HCaptchaWrapperProps {
  children: React.ReactNode;
}

/**
 * Wraps the application with hCaptcha provider
 * Should be used at the app root level
 */
export function HCaptchaWrapper({ children }: HCaptchaWrapperProps) {
  const config = getHCaptchaConfig();
  const siteKey = config.siteKey;
  const enabled = config.enabled;

  if (!enabled || !siteKey) {
    return <>{children}</>;
  }

  return (
    <HCaptchaProvider siteKey={siteKey} enabled={enabled}>
      {children}
    </HCaptchaProvider>
  );
}
