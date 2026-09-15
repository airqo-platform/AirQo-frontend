import useSWRMutation from 'swr/mutation';
import { analyticsService } from '../services/analyticsService';
import type {
  AnalyticsChartRequest,
  AnalyticsChartResponse,
  DataDownloadRequest,
  DataDownloadResponse,
} from '../types/api';

// Get chart data. The mutation arg carries the request plus an optional
// AbortSignal so callers can cancel in-flight requests on unmount/re-run.
// The signal is destructured out of the arg here — it must never be passed
// to the service as part of the HTTP request body.
type ChartDataMutationArg = AnalyticsChartRequest & { signal?: AbortSignal };

export const useGetChartData = (keyParts?: unknown[]) => {
  const swrKey = Array.isArray(keyParts)
    ? ['analytics/chart-data', ...keyParts]
    : ['analytics/chart-data'];

  return useSWRMutation(
    swrKey,
    async (
      key,
      { arg }: { arg: ChartDataMutationArg }
    ): Promise<AnalyticsChartResponse> => {
      const { signal, ...request } = arg;
      return await analyticsService.getChartData(request, signal);
    }
  );
};

// Download data
export const useDownloadData = () => {
  return useSWRMutation(
    'analytics/data-download',
    async (
      key,
      { arg }: { arg: { request: DataDownloadRequest; signal?: AbortSignal } }
    ): Promise<DataDownloadResponse | string> => {
      return await analyticsService.downloadData(arg.request, arg.signal);
    }
  );
};
