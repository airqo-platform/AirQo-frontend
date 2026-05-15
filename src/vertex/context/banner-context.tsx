'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Banner, type BannerProps, type BannerSeverity } from '@/components/ui/banner';

// ============================================================================
// Types
// ============================================================================

interface BannerState {
  severity: BannerSeverity;
  message?: React.ReactNode;
  title?: React.ReactNode;
  isVisible: boolean;
  isScoped: boolean;
}

type ShowBannerOptions = Omit<BannerProps, 'dismissible' | 'onDismiss'> & {
  scoped?: boolean;
};

interface BannerContextValue {
  state: BannerState;
  showBanner: (options: ShowBannerOptions) => void;
  hideBanner: () => void;
}

// ============================================================================
// Context
// ============================================================================

const BannerContext = createContext<BannerContextValue | null>(null);

const DEFAULT_STATE: BannerState = {
  severity: 'info',
  isVisible: false,
  isScoped: false,
};

// ============================================================================
// Provider
// ============================================================================

export function BannerProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<BannerState>(DEFAULT_STATE);

  const showBanner = useCallback((options: ShowBannerOptions) => {
    const { scoped = false, severity, message, title } = options;
    setState({ severity, message, title, isVisible: true, isScoped: scoped });
  }, []);

  const hideBanner = useCallback(() => {
    setState(DEFAULT_STATE);
  }, []);

  return (
    <BannerContext.Provider value={{ state, showBanner, hideBanner }}>
      {children}
    </BannerContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

export function useBanner() {
  const ctx = useContext(BannerContext);
  if (!ctx) throw new Error('useBanner must be used within a BannerProvider');
  return {
    showBanner: ctx.showBanner,
    hideBanner: ctx.hideBanner,
    BannerSlot,
  };
}

// ============================================================================
// BannerSlot — drop inside any Dialog or Page to receive scoped banners
// ============================================================================

export function BannerSlot() {
  const ctx = useContext(BannerContext);
  if (!ctx) return null;

  const { state, hideBanner } = ctx;
  if (!state.isVisible || !state.isScoped) return null;

  return (
    <Banner
      severity={state.severity}
      title={state.title}
      message={state.message}
      dismissible
      onDismiss={hideBanner}
      className="rounded-none border-x-0 border-t-0"
    />
  );
}

// ============================================================================
// GlobalBannerContainer — lives in the root layout, handles non-scoped banners
// ============================================================================

export function GlobalBannerContainer() {
  const ctx = useContext(BannerContext);
  if (!ctx) return null;

  const { state, hideBanner } = ctx;
  if (!state.isVisible || state.isScoped) return null;

  return (
    <div className="px-4 pt-3">
      <Banner
        severity={state.severity}
        title={state.title}
        message={state.message}
        dismissible
        onDismiss={hideBanner}
      />
    </div>
  );
}
