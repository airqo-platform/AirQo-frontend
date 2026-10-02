import useSWR from 'swr';
import { useCallback } from 'react';
import { apiKeyUsageService } from '../services/apiKeyUsageService';
import { STABLE_SWR_OPTIONS, useAbortableFetcher } from './useAbortableSWR';
import { isAbortError } from '../lib/retryPolicy';
import type {
  ApiKeyUsageDetailData,
  ApiKeyUsageDetailParams,
  ApiKeyUsageLeaderboardData,
  ApiKeyUsageLeaderboardParams,
  ApiKeyUsageTimeseriesData,
  ApiKeyUsageTimeseriesParams,
} from '../types/apiKeyUsage';

/** Server default page size for the leaderboard table. */
export const API_KEY_USAGE_DEFAULT_LIMIT = 20;
/** Longest `from`→`to` range (inclusive UTC days) the endpoints accept. */
export const API_KEY_USAGE_MAX_RANGE_DAYS = 92;
/** Extra cap applied when charting with `interval=hour`. */
export const API_KEY_USAGE_MAX_HOURLY_RANGE_DAYS = 14;

// Top API keys (leaderboard / table)
export const useApiKeyUsageLeaderboard = (
  params: ApiKeyUsageLeaderboardParams,
  enabled = true
) => {
  const key = enabled ? ['system/api-key-usage/leaderboard', params] : null;
  const { fetcher } = useAbortableFetcher(
    useCallback(
      (signal: AbortSignal) =>
        apiKeyUsageService.getLeaderboard(params, signal),
      [params]
    )
  );

  const result = useSWR<ApiKeyUsageLeaderboardData>(key, fetcher, {
    ...STABLE_SWR_OPTIONS,
    keepPreviousData: true,
  });

  return {
    ...result,
    error: isAbortError(result.error) ? null : result.error,
  };
};

// Usage over time (graph)
export const useApiKeyUsageTimeseries = (
  params: ApiKeyUsageTimeseriesParams,
  enabled = true
) => {
  const key = enabled ? ['system/api-key-usage/timeseries', params] : null;
  const { fetcher } = useAbortableFetcher(
    useCallback(
      (signal: AbortSignal) => apiKeyUsageService.getTimeseries(params, signal),
      [params]
    )
  );

  const result = useSWR<ApiKeyUsageTimeseriesData>(key, fetcher, {
    ...STABLE_SWR_OPTIONS,
    keepPreviousData: true,
  });

  return {
    ...result,
    error: isAbortError(result.error) ? null : result.error,
  };
};

// One key in detail (drill-down)
export const useApiKeyUsageDetail = (
  clientId: string | null,
  params: ApiKeyUsageDetailParams
) => {
  const key = clientId
    ? ['system/api-key-usage/detail', clientId, params]
    : null;
  const { fetcher } = useAbortableFetcher(
    useCallback(
      (signal: AbortSignal) =>
        // Only called while the key above is non-null, so clientId is set.
        apiKeyUsageService.getDetail(clientId!, params, signal),
      [clientId, params]
    )
  );

  const result = useSWR<ApiKeyUsageDetailData>(key, fetcher, {
    ...STABLE_SWR_OPTIONS,
    keepPreviousData: true,
  });

  return {
    ...result,
    error: isAbortError(result.error) ? null : result.error,
  };
};
