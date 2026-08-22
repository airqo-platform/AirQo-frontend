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
  RecentReadingsResponse,
  RecentReading,
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
export const toDateString = (value: string): string => {
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

  /**
   * Latest reading per site — POST /devices/readings/recent.
   *
   * Goes through the server client (API_TOKEN via the BFF route), mirroring
   * `getChartData`: device endpoints need the shared API token, which the
   * BFF attaches server-side so it never reaches the browser.
   *
   * The backend rejects an empty `site_ids` array with 400, so empty input
   * short-circuits to `[]` without a network call. A `success: false` body
   * (or a malformed one) throws a fixed safe message — the backend error is
   * not interpolated into the thrown Error to prevent server-internal wording
   * from reaching the UI. Aborted requests propagate as cancellations and
   * must never be retried by callers (AGENTS.md retry policy).
   */
  async getRecentReadings(
    siteIds: string[],
    signal?: AbortSignal
  ): Promise<RecentReading[]> {
    const trimmedSiteIds = siteIds.map(siteId => siteId.trim()).filter(Boolean);

    if (trimmedSiteIds.length === 0) {
      return [];
    }

    const response = await this.serverClient.post<RecentReadingsResponse>(
      '/devices/readings/recent',
      { site_ids: trimmedSiteIds },
      { signal }
    );

    const payload = response.data;
    if (!payload?.success) {
      throw new Error('Failed to fetch the latest readings.');
    }

    return Array.isArray(payload.measurements) ? payload.measurements : [];
  }
}

export const analyticsService = new AnalyticsService();
