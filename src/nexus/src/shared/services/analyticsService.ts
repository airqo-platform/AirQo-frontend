/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ApiClient,
  createAuthenticatedClient,
  createServerClient,
} from './apiClient';
import { syncClientSessionToken } from './sessionAuthToken';
import type {
  AnalyticsChartRequest,
  AnalyticsChartResponse,
  RecentReading,
  RecentReadingRequest,
  RecentReadingsResponse,
  DataDownloadRequest,
  DataDownloadResponse,
} from '../types/api';

/**
 * Strip time components from a date string so the API receives `YYYY-MM-DD`.
 *
 * The chart-data endpoint (`/analytics/dashboard/chart/d3/data`) validates
 * `startDate` / `endDate` as plain date strings. Callers that pass full ISO
 * datetime strings (e.g. `2025-08-21T00:00:00.000Z`) trigger a 422
 * Unprocessable Entity from the backend.  This helper is a no-op when the
 * input is already in `YYYY-MM-DD` format.
 */
const toDateString = (value: string): string => {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  return value.slice(0, 10);
};

const RECENT_READINGS_BATCH_SIZE = 10;

type RecentReadingsPayload =
  | RecentReadingsResponse
  | {
      success?: boolean;
      message?: string;
      measurements?: RecentReading[];
      data?: RecentReading[] | { measurements?: RecentReading[] };
    };

const normalizeRecentReadingsResponse = (
  payload: RecentReadingsPayload,
  fallbackMessage: string
): RecentReadingsResponse => {
  const nestedData = 'data' in payload ? payload.data : undefined;
  const measurements = Array.isArray(payload.measurements)
    ? payload.measurements
    : Array.isArray(nestedData)
      ? nestedData
      : nestedData && Array.isArray(nestedData.measurements)
        ? nestedData.measurements
        : [];

  return {
    success: payload.success !== false,
    message: payload.message || fallbackMessage,
    measurements,
  };
};

export class AnalyticsService {
  private authenticatedClient: ApiClient;
  private serverClient: ApiClient;

  constructor() {
    this.authenticatedClient = createAuthenticatedClient();
    this.serverClient = createServerClient();
  }

  private async ensureAuthenticated() {
    await syncClientSessionToken(this.authenticatedClient);
  }

  // Get chart data - direct backend call via API token
  async getChartData(
    request: AnalyticsChartRequest,
    signal?: AbortSignal
  ): Promise<AnalyticsChartResponse> {
    // The chart-data endpoint expects YYYY-MM-DD date strings. Some callers
    // pass full ISO datetime strings (e.g. "2025-08-21T00:00:00.000Z") which
    // cause 422 Unprocessable Entity. Normalize here so all callers are safe.
    const response =
      await this.serverClient.post<AnalyticsChartResponse>(
        '/analytics/dashboard/chart/d3/data',
        {
          ...request,
          startDate: toDateString(request.startDate),
          endDate: toDateString(request.endDate),
        },
        { signal }
      );
    return response.data;
  }

  // Get recent readings data
  async getRecentReadings(
    request: RecentReadingRequest,
    signal?: AbortSignal
  ): Promise<RecentReadingsResponse> {
    const normalizedSiteIds = Array.from(
      new Set(
        (request.site_id || '')
          .split(',')
          .map(siteId => siteId.trim())
          .filter(Boolean)
      )
    );

    if (normalizedSiteIds.length === 0) {
      return {
        success: true,
        message: 'No site IDs provided',
        measurements: [],
      };
    }

    // For small lists, use the existing single GET with comma-joined site_ids.
    // For larger lists, the backend now supports a POST endpoint that accepts
    // a JSON body, avoiding the request-storm of N parallel batched GETs.
    if (normalizedSiteIds.length <= RECENT_READINGS_BATCH_SIZE) {
      const response = await this.serverClient.get<RecentReadingsPayload>(
        '/devices/readings/recent',
        {
          params: {
            site_id: normalizedSiteIds.join(','),
          },
          signal,
        }
      );

      return normalizeRecentReadingsResponse(
        response.data,
        'Recent readings fetched successfully'
      );
    }

    // Large site_id list — single POST to the backend.
    const response = await this.serverClient.post<RecentReadingsPayload>(
      '/devices/readings/recent',
      { site_ids: normalizedSiteIds },
      { signal }
    );

    return normalizeRecentReadingsResponse(
      response.data,
      'Recent readings fetched successfully'
    );
  }

  // Download data - authenticated endpoint
  async downloadData(
    request: DataDownloadRequest
  ): Promise<DataDownloadResponse | string> {
    const response = await this.serverClient.post<
      DataDownloadResponse | string
    >('/analytics/data-download', request);
    return response.data;
  }
}

export const analyticsService = new AnalyticsService();
