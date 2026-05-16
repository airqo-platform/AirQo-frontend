'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface HCaptchaContextType {
  loaded: boolean;
  error: boolean;
  resetKey: number;
  reset: () => void;
}

const HCaptchaContext = createContext<HCaptchaContextType | undefined>(undefined);

interface HCaptchaProviderProps {
  children: React.ReactNode;
  siteKey?: string;
  enabled?: boolean;
}

export function HCaptchaProvider({ children, siteKey, enabled = true }: HCaptchaProviderProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
    if (!enabled || !siteKey) {
      setLoaded(true);
      return;
    }

    // Check if hCaptcha script is already loaded
    if (window.hcaptcha) {
      setLoaded(true);
      return;
    }

    // Load hCaptcha script
    const script = document.createElement('script');
    script.src = 'https://hcaptcha.com/99checksite';
    script.async = true;
    script.defer = true;

    script.onload = () => {
      setLoaded(true);
    };

    script.onerror = () => {
      setError(true);
      console.error('Failed to load hCaptcha script');
    };

    document.body.appendChild(script);

    return () => {
      // Cleanup not needed as script stays in DOM
    };
  }, [siteKey, enabled]);

  const reset = () => {
    setResetKey((prev) => prev + 1);
  };

  return (
    <HCaptchaContext.Provider value={{ loaded, error, resetKey, reset }}>
      {children}
    </HCaptchaContext.Provider>
  );
}

export function useHCaptcha() {
  const context = useContext(HCaptchaContext);
  if (context === undefined) {
    throw new Error('useHCaptcha must be used within a HCaptchaProvider');
  }
  return context;
}
