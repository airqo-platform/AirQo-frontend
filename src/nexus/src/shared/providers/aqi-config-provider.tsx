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
import { useGlobalLoading } from '@/shared/providers/global-loading-provider';
import { setActiveAqiConfig } from '@/shared/utils/airQuality';
import type {
  AqiConfig,
  AqiPollutant,
  AqiRangesResponse,
} from '@/shared/types/aqi';

const isAbortError = (value: unknown): boolean => {
  if (typeof DOMException !== 'undefined' && value instanceof DOMException) {
    return value.name === 'AbortError';
  }

  const error = value as { code?: string; name?: string } | null;
  return error?.name === 'AbortError' || error?.code === 'ERR_CANCELED';
};

export const AQI_RANGES_CACHE_KEY = 'config/aqi-ranges';

interface AqiConfigContextValue {
  config: AqiConfig | null;
  enabled: boolean;
  isLoading: boolean;
  error: unknown;
  refresh: () => Promise<AqiRangesResponse | undefined>;
}

const AqiConfigContext = createContext<AqiConfigContextValue | null>(null);

const getAqiRangesCacheKey = (pollutant: AqiPollutant) =>
  `${AQI_RANGES_CACHE_KEY}:${pollutant}`;

export function AqiConfigProvider({
  children,
  enabled = true,
}: {
  children: React.ReactNode;
  enabled?: boolean;
}) {
  const abortRef = useRef<AbortController | null>(null);
  const [activeConfig, setActiveConfig] = useState<AqiConfig | null>(null);
  const {
    data,
    error,
    isLoading: swrIsLoading,
    isValidating,
    mutate,
  } = useSWR<AqiRangesResponse | undefined>(
    enabled ? getAqiRangesCacheKey('pm2_5') : null,
    async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        return await aqiConfigService.getAqiRanges('pm2_5', controller.signal);
      } catch (fetchError) {
        if (isAbortError(fetchError)) return undefined;
        throw fetchError;
      } finally {
        if (abortRef.current === controller) {
          abortRef.current = null;
        }
      }
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      // The scoped SWR provider discards persisted entries after 30 minutes.
      // Reuse valid cached configuration instead of refetching on every mount.
      revalidateIfStale: false,
      shouldRetryOnError: false,
      dedupingInterval: 1000 * 60 * 5,
    }
  );

  // NOTE: no abort-on-unmount here. This provider lives at the app root and
  // React StrictMode double-mounts it in development; aborting the first
  // in-flight fetch there leaves SWR serving an aborted (undefined) result
  // and the app runs without an AQI config. A completed background fetch is
  // harmless — SWR discards results from unmounted consumers safely.

  // Belt-and-braces: if a fetch ever resolves undefined (e.g. aborted by the
  // next fetch starting), re-trigger once so the app regains its AQI config.
  const recoveredAbortRef = useRef(false);
  useEffect(() => {
    if (enabled && data === undefined && !recoveredAbortRef.current) {
      recoveredAbortRef.current = true;
      void mutate();
    }
  }, [data, enabled, mutate]);

  const fetchedConfig = data?.data ?? null;

  useEffect(() => {
    // Keep synchronous utility consumers aligned without mutating shared state
    // during render. SWR retains the last successful value during revalidation.
    setActiveAqiConfig(fetchedConfig);
    setActiveConfig(fetchedConfig);
  }, [fetchedConfig]);

  const config = activeConfig ?? fetchedConfig;
  const isLoading = enabled && (swrIsLoading || isValidating);

  useGlobalLoading(Boolean(enabled && isLoading && !config), {
    priority: 95,
  });

  const value = useMemo<AqiConfigContextValue>(
    () => ({
      config,
      enabled,
      isLoading,
      error: enabled ? error : undefined,
      refresh: () => mutate(),
    }),
    [config, enabled, error, isLoading, mutate]
  );

  return (
    <AqiConfigContext.Provider value={value}>
      {children}
      {enabled && error && !isAbortError(error) && !config && (
        <AqiConfigFailure onRetry={mutate} />
      )}
    </AqiConfigContext.Provider>
  );
}

function AqiConfigFailure({
  onRetry,
}: {
  onRetry: () => Promise<AqiRangesResponse | undefined>;
}) {
  const retryRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    retryRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || !retryRef.current) return;
      event.preventDefault();
      retryRef.current.focus();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="aqi-config-failure-title"
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-background/80 p-6 backdrop-blur-sm"
    >
      <div className="max-w-md rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
        <h2
          id="aqi-config-failure-title"
          className="text-base font-semibold text-foreground"
        >
          AQI configuration unavailable
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          We could not load the shared AQI ranges. Retry to continue once the
          configuration service is available.
        </p>
        <button
          ref={retryRef}
          type="button"
          onClick={() => void onRetry()}
          className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          Retry
        </button>
      </div>
    </div>
  );
}

export const useAqiConfig = (
  pollutant: AqiPollutant = 'pm2_5'
): AqiConfigContextValue => {
  const context = useContext(AqiConfigContext);
  if (!context) {
    throw new Error('useAqiConfig must be used within AqiConfigProvider');
  }
  const isDefaultPollutant = pollutant === 'pm2_5';
  const [activePollutantConfig, setActivePollutantConfig] =
    useState<AqiConfig | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const { data, error, isLoading, isValidating, mutate } =
    useSWR<AqiRangesResponse | undefined>(
      context.enabled && !isDefaultPollutant
        ? getAqiRangesCacheKey(pollutant)
        : null,
      async () => {
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        try {
          return await aqiConfigService.getAqiRanges(
            pollutant,
            controller.signal
          );
        } catch (fetchError) {
          if (isAbortError(fetchError)) return undefined;
          throw fetchError;
        } finally {
          if (abortRef.current === controller) {
            abortRef.current = null;
          }
        }
      },
      {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        revalidateIfStale: false,
        shouldRetryOnError: false,
        dedupingInterval: 1000 * 60 * 5,
      }
    );

  // No abort-on-unmount (see the provider note above).
  const recoveredAbortRef = useRef(false);
  useEffect(() => {
    if (context.enabled && data === undefined && !recoveredAbortRef.current) {
      recoveredAbortRef.current = true;
      void mutate();
    }
  }, [context.enabled, data, mutate]);

  useEffect(() => {
    if (!isDefaultPollutant) {
      const nextConfig = data?.data ?? null;
      setActiveAqiConfig(nextConfig);
      setActivePollutantConfig(nextConfig);
    }
  }, [data?.data, isDefaultPollutant]);

  if (isDefaultPollutant) return context;

  const hasUnactivatedConfig =
    Boolean(data?.data) && activePollutantConfig?.pollutant !== pollutant;

  return {
    // Keep the returned config in lockstep with the registry update above.
    // This second render prevents consumers from displaying a loaded legend
    // while markers/cards still classify against the previous pollutant.
    config: activePollutantConfig ?? data?.data ?? null,
    enabled: context.enabled,
    isLoading: isLoading || isValidating || hasUnactivatedConfig,
    error,
    refresh: () => mutate(),
  };
};
