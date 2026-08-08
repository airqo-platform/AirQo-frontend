'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import useSWR from 'swr';
import { aqiConfigService } from '@/shared/services/aqiConfigService';
import { setActiveAqiConfig } from '@/shared/utils/airQuality';
import type { AqiConfig, AqiRangesResponse } from '@/shared/types/aqi';

export const AQI_RANGES_CACHE_KEY = 'config/aqi-ranges';

interface AqiConfigContextValue {
  config: AqiConfig | null;
  isLoading: boolean;
  error: unknown;
  refresh: () => Promise<AqiRangesResponse | undefined>;
}

const AqiConfigContext = createContext<AqiConfigContextValue | null>(null);

export function AqiConfigProvider({ children }: { children: React.ReactNode }) {
  const abortRef = useRef<AbortController | null>(null);
  const [activeConfig, setActiveConfig] = useState<AqiConfig | null>(null);
  const { data, error, isLoading: swrIsLoading, isValidating, mutate } =
    useSWR<AqiRangesResponse>(
    AQI_RANGES_CACHE_KEY,
    async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        return await aqiConfigService.getAqiRanges(controller.signal);
      } finally {
        if (abortRef.current === controller) {
          abortRef.current = null;
        }
      }
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
      dedupingInterval: 1000 * 60 * 5,
      }
    );

  useEffect(() => () => abortRef.current?.abort(), []);

  const fetchedConfig = data?.data ?? null;

  useEffect(() => {
    // Keep synchronous utility consumers aligned without mutating shared state
    // during render. SWR retains the last successful value during revalidation.
    setActiveAqiConfig(fetchedConfig);
    setActiveConfig(fetchedConfig);
  }, [fetchedConfig]);

  const config = activeConfig ?? fetchedConfig;
  const isLoading = swrIsLoading || isValidating;

  const value = useMemo<AqiConfigContextValue>(
    () => ({
      config,
      isLoading,
      error,
      refresh: () => mutate(),
    }),
    [config, error, isLoading, mutate]
  );

  return (
    <AqiConfigContext.Provider value={value}>
      {children}
      <AqiConfigStatus
        error={error}
        hasConfig={Boolean(config)}
        isLoading={isLoading}
        onRetry={() => mutate()}
      />
    </AqiConfigContext.Provider>
  );
}

function AqiConfigStatus({
  error,
  hasConfig,
  isLoading,
  onRetry,
}: {
  error: unknown;
  hasConfig: boolean;
  isLoading: boolean;
  onRetry: () => Promise<AqiRangesResponse | undefined>;
}) {
  if (isLoading && !hasConfig) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="fixed left-1/2 top-2 z-[10001] -translate-x-1/2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-medium text-blue-800 shadow-sm"
      >
        Loading AQI configuration…
      </div>
    );
  }

  if (!error) {
    return null;
  }

  return (
    <div
      role="alert"
      className={`fixed left-1/2 top-2 z-[10001] flex max-w-[calc(100%-2rem)] -translate-x-1/2 items-center gap-3 rounded-lg border px-4 py-2 text-xs shadow-sm ${
        hasConfig
          ? 'border-amber-200 bg-amber-50 text-amber-900'
          : 'border-red-200 bg-red-50 text-red-900'
      }`}
    >
      <span>
        {hasConfig
          ? 'AQI configuration refresh failed. Showing the last successful configuration.'
          : 'AQI configuration is unavailable. AQI values will appear when it loads.'}
      </span>
      <button
        type="button"
        onClick={() => void onRetry()}
        disabled={isLoading}
        className="shrink-0 rounded-md border border-current px-2 py-1 font-semibold disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? 'Retrying…' : 'Retry'}
      </button>
    </div>
  );
}

export const useAqiConfig = (): AqiConfigContextValue => {
  const context = useContext(AqiConfigContext);
  if (!context) {
    throw new Error('useAqiConfig must be used within AqiConfigProvider');
  }
  return context;
};
