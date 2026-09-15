import useSWRMutation from 'swr/mutation';
import { analyticsService } from '../services/analyticsService';
import type {
  AnalyticsChartRequest,
  AnalyticsChartResponse,
  DataDownloadRequest,
  DataDownloadResponse,
} from '../types/api';

// Get chart data
export const useGetChartData = (keyParts?: unknown[]) => {
  const swrKey = Array.isArray(keyParts)
    ? ['analytics/chart-data', ...keyParts]
    : ['analytics/chart-data'];

  return useSWRMutation(
    swrKey,
    async (
      key,
      { arg, signal }: { arg: AnalyticsChartRequest; signal?: AbortSignal }
    ): Promise<AnalyticsChartResponse> => {
      return await analyticsService.getChartData(arg, signal);
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
