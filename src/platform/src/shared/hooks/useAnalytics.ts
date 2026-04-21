import useSWRMutation from 'swr/mutation';
import { analyticsService } from '../services/analyticsService';
import type {
  AnalyticsChartRequest,
  AnalyticsChartResponse,
  RecentReadingRequest,
  RecentReadingsResponse,
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
      { arg }: { arg: AnalyticsChartRequest }
    ): Promise<AnalyticsChartResponse> => {
      return await analyticsService.getChartData(arg);
    }
  );
};

// Get recent readings data
export const useGetRecentReadings = () => {
  return useSWRMutation(
    'analytics/recent-readings',
    async (
      key,
      { arg }: { arg: RecentReadingRequest }
    ): Promise<RecentReadingsResponse> => {
      return await analyticsService.getRecentReadings(arg);
    }
  );
};

// Download data
export const useDownloadData = () => {
  return useSWRMutation(
    'analytics/data-download',
    async (
      key,
      { arg }: { arg: DataDownloadRequest }
    ): Promise<DataDownloadResponse | string> => {
      return await analyticsService.downloadData(arg);
    }
  );
};
