'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AqCheckCircle, AqLoading01, AqSignal02, AqXClose } from '@airqo/icons-react';
import { useConnectionRecovery, type ConnectionPhase } from '@/core/hooks/useConnectionRecovery';

const DEBOUNCE_DELAY = 300;
const AUTO_HIDE_DELAY = 5000;
const API_DEGRADED_EVENT = 'vertex-network-degraded';
const API_RECOVERED_EVENT = 'vertex-network-recovered';

type Tone = 'amber' | 'blue' | 'green';

// The amber pill matches Nexus's offline status (src/nexus AppNetworkGate); blue and green follow its shape
const TONES: Record<Tone, string> = {
  amber:
    'border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-200',
  blue: 'border-blue-200 bg-blue-100 text-blue-800 dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-200',
  green:
    'border-green-200 bg-green-100 text-green-800 dark:border-green-800 dark:bg-green-950/60 dark:text-green-200',
};

const STRONG_TEXT: Record<Tone, string> = {
  amber: 'text-amber-900 dark:text-amber-100',
  blue: 'text-blue-900 dark:text-blue-100',
  green: 'text-green-900 dark:text-green-100',
};

const ICON_CLASS = 'h-3.5 w-3.5 shrink-0';
const Spinner = <AqLoading01 className={`${ICON_CLASS} motion-safe:animate-spin`} aria-hidden="true" />;

const PROGRESS: Partial<Record<ConnectionPhase, { message: string; tone: Tone; icon: React.ReactNode }>> = {
  reconnecting: { message: 'Reconnecting…', tone: 'blue', icon: Spinner },
  refreshing: { message: 'Refreshing data…', tone: 'blue', icon: Spinner },
  restored: {
    message: 'Back online',
    tone: 'green',
    icon: <AqCheckCircle className={ICON_CLASS} aria-hidden="true" />,
  },
};

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debouncedValue;
}

function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

interface ApiHealthStatus {
  hasConnectivityIssue: boolean;
}

function useApiHealthStatus(): ApiHealthStatus {
  const [hasConnectivityIssue, setHasConnectivityIssue] = useState(false);
  const clearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleNetworkDegraded = () => {
      setHasConnectivityIssue(true);
      if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
      clearTimerRef.current = setTimeout(() => setHasConnectivityIssue(false), 12000);
    };

    const handleNetworkRecovered = () => {
      setHasConnectivityIssue(false);
      if (clearTimerRef.current) {
        clearTimeout(clearTimerRef.current);
        clearTimerRef.current = null;
      }
    };

    window.addEventListener(API_DEGRADED_EVENT, handleNetworkDegraded as EventListener);
    window.addEventListener(API_RECOVERED_EVENT, handleNetworkRecovered as EventListener);

    return () => {
      if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
      window.removeEventListener(API_DEGRADED_EVENT, handleNetworkDegraded as EventListener);
      window.removeEventListener(API_RECOVERED_EVENT, handleNetworkRecovered as EventListener);
    };
  }, []);

  return { hasConnectivityIssue };
}

interface StatusPillProps {
  tone: Tone;
  icon: React.ReactNode;
  message: string;
  onRetry?: () => void;
  retrying?: boolean;
  onDismiss?: () => void;
}

function StatusPill({ tone, icon, message, onRetry, retrying = false, onDismiss }: StatusPillProps) {
  const control = `rounded-full focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-current ${STRONG_TEXT[tone]}`;
  return (
    <div
      className={`pointer-events-auto flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium shadow-md backdrop-blur-sm transition-opacity duration-200 motion-reduce:transition-none ${TONES[tone]}`}
    >
      {icon}
      <span>{message}</span>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          disabled={retrying}
          className={`font-semibold underline-offset-2 hover:underline disabled:no-underline disabled:opacity-80 ${control}`}
        >
          {retrying ? 'Checking…' : 'Retry'}
        </button>
      )}
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss network status notification"
          className={`-my-1 -mr-2 inline-flex h-6 w-6 shrink-0 items-center justify-center opacity-70 hover:bg-black/5 hover:opacity-100 dark:hover:bg-white/10 ${control}`}
        >
          <AqXClose className={ICON_CLASS} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

interface NetworkStatusBannerProps {
  position?: 'top' | 'bottom';
  className?: string;
  autoHide?: boolean;
  autoHideDelay?: number;
}

export default function NetworkStatusBanner({
  position = 'top',
  className = '',
  autoHide = true,
  autoHideDelay = AUTO_HIDE_DELAY,
}: NetworkStatusBannerProps) {
  const isMounted = useMounted();
  const [dismissed, setDismissed] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const { phase, retry, clearRestored } = useConnectionRecovery();
  const { hasConnectivityIssue } = useApiHealthStatus();

  const isOffline = phase === 'offline';
  const isUnstable =
    phase === 'unreachable' ||
    phase === 'unstable' ||
    (hasConnectivityIssue && (phase === 'idle' || phase === 'restored'));
  const hasIssue = isOffline || isUnstable;
  const shouldShow = useDebounce(hasIssue && !dismissed, DEBOUNCE_DELAY);

  useEffect(() => {
    setDismissed(false);
  }, [phase]);

  useEffect(() => {
    if (!hasIssue) setDismissed(false);
  }, [hasIssue]);

  useEffect(() => {
    if (!autoHide || phase !== 'restored') return;
    const t = setTimeout(clearRestored, autoHideDelay);
    return () => clearTimeout(t);
  }, [autoHide, phase, autoHideDelay, clearRestored]);

  const handleDismiss = useCallback(() => setDismissed(true), []);

  const handleRetry = useCallback(() => {
    setRetrying(true);
    void retry().finally(() => setRetrying(false));
  }, [retry]);

  if (!isMounted) return null;

  const progress = isUnstable ? undefined : PROGRESS[phase];

  // Both live regions stay mounted so screen readers announce each change to their content.
  return (
    <div
      className={`pointer-events-none fixed inset-x-0 z-[2000] flex justify-center px-4 ${
        position === 'top' ? 'top-0 pt-2' : 'bottom-0 pb-6'
      } ${className}`}
    >
      <div role="status" aria-live="polite" aria-atomic="true">
        {progress && <StatusPill tone={progress.tone} icon={progress.icon} message={progress.message} />}
      </div>

      <div role="alert" aria-live="assertive" aria-atomic="true">
        {shouldShow && hasIssue && (
          <StatusPill
            tone="amber"
            icon={
              isOffline ? (
                <span
                  aria-hidden="true"
                  className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500 motion-safe:animate-pulse dark:bg-amber-400"
                />
              ) : (
                <AqSignal02 className={ICON_CLASS} aria-hidden="true" />
              )
            }
            message={isOffline ? "You're offline" : 'Connection is unstable'}
            onRetry={handleRetry}
            retrying={retrying}
            onDismiss={handleDismiss}
          />
        )}
      </div>
    </div>
  );
}
