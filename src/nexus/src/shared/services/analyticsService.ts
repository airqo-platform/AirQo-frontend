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
  DataDownloadRequest,
  DataDownloadResponse,
} from '../types/api';

/**
 * Strip time components from a date string so the API receives `YYYY-MM-DD`.
 *
 * The chart-data endpoint (`/analytics/dashboard/chart/d3/data`) validates
 * `startDateTime` / `endDateTime` as plain date strings.  Callers that pass
 * full ISO datetime strings (e.g. `2025-08-21T00:00:00.000Z`) trigger a 422
 * Unprocessable Entity from the backend.  This helper is a no-op when the
 * input is already in `YYYY-MM-DD` format.
 *
 * Empirically confirmed (2026-08-21): the backend also accepts ISO datetimes,
 * but YYYY-MM-DD is the safest, most compact format.
 */
const toDateString = (value: string): string => {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  return value.slice(0, 10);
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
    // The chart-data endpoint expects YYYY-MM-DD date strings for
    // startDateTime/endDateTime. Some callers pass full ISO datetime strings
    // (e.g. "2025-08-21T00:00:00.000Z") which cause 422 Unprocessable Entity.
    // Normalize here so all callers are safe.
    const response = await this.serverClient.post<AnalyticsChartResponse>(
      '/analytics/dashboard/chart/d3/data',
      {
        ...request,
        startDateTime: toDateString(request.startDateTime),
        endDateTime: toDateString(request.endDateTime),
      },
      { signal }
    );
    return response.data;
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
