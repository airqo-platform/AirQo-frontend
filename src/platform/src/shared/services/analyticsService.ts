/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ApiClient,
  createAuthenticatedClient,
  createServerClient,
} from './apiClient';
import { getSession } from 'next-auth/react';
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
    const session = await getSession();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const token = (session as any)?.accessToken;
    if (token) {
      this.authenticatedClient.setAuthToken(token);
    }
  }

  // Get chart data - authenticated endpoint
  async getChartData(
    request: AnalyticsChartRequest
  ): Promise<AnalyticsChartResponse> {
    await this.ensureAuthenticated();
    const response =
      await this.authenticatedClient.post<AnalyticsChartResponse>(
        '/analytics/dashboard/chart/d3/data',
        request
      );
    return response.data;
  }

  // Get recent readings data
  async getRecentReadings(
    request: RecentReadingRequest
  ): Promise<RecentReadingsResponse> {
    const response = await this.serverClient.get<RecentReadingsResponse>(
      `/devices/readings/recent?site_id=${request.site_id}`
    );
    return response.data;
  }

  // Download data - authenticated endpoint
  async downloadData(
    request: DataDownloadRequest
  ): Promise<DataDownloadResponse | string> {
    await this.ensureAuthenticated();
    const response = await this.authenticatedClient.post<
      DataDownloadResponse | string
    >('/analytics/data-download', request);
    return response.data;
  }
}

export const analyticsService = new AnalyticsService();
