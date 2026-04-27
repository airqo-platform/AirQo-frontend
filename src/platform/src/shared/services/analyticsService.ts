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
  RecentReadingRequest,
  RecentReadingsResponse,
  DataDownloadRequest,
  DataDownloadResponse,
} from '../types/api';

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

  // Get chart data - authenticated endpoint
  async getChartData(
    request: AnalyticsChartRequest,
    signal?: AbortSignal
  ): Promise<AnalyticsChartResponse> {
    await this.ensureAuthenticated();
    const response =
      await this.authenticatedClient.post<AnalyticsChartResponse>(
        '/analytics/dashboard/chart/d3/data',
        request,
        { signal }
      );
    return response.data;
  }

  // Get recent readings data
  async getRecentReadings(
    request: RecentReadingRequest,
    signal?: AbortSignal
  ): Promise<RecentReadingsResponse> {
    const normalizedSiteIds = (request.site_id || '')
      .split(',')
      .map(siteId => siteId.trim())
      .filter(Boolean)
      .join(',');

    if (!normalizedSiteIds) {
      return {
        success: true,
        message: 'No site IDs provided',
        measurements: [],
      };
    }

    const response = await this.serverClient.get<RecentReadingsResponse>(
      '/devices/readings/recent',
      {
        params: {
          site_id: normalizedSiteIds,
          ...(request.user_id ? { user_id: request.user_id } : {}),
        },
        signal,
      }
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
