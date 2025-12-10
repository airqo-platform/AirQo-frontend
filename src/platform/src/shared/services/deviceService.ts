/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ApiClient,
  createAuthenticatedClient,
  createServerClient,
} from './apiClient';
import { getSession } from 'next-auth/react';
import type {
  SitesSummaryResponse,
  SitesSummaryParams,
  ApiErrorResponse,
  CohortSitesRequest,
  CohortSitesParams,
  CohortSitesResponse,
  CohortDevicesRequest,
  CohortDevicesParams,
  CohortDevicesResponse,
  GroupCohortsResponse,
  GridsSummaryResponse,
  GridsSummaryParams,
  CountriesResponse,
  MapReadingsResponse,
  ForecastResponse,
} from '../types/api';

export class DeviceService {
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

  // Get sites summary - authenticated endpoint
  async getSitesSummaryAuthenticated(
    params: SitesSummaryParams = {}
  ): Promise<SitesSummaryResponse> {
    await this.ensureAuthenticated();
    const response = await this.authenticatedClient.get<
      SitesSummaryResponse | ApiErrorResponse
    >('/devices/sites/summary', { params });
    const data = response.data;

    if ('success' in data && !data.success) {
      throw new Error(data.message || 'Failed to get sites summary');
    }

    return data as SitesSummaryResponse;
  }

  // Get sites summary - API token endpoint
  async getSitesSummaryWithToken(
    params: SitesSummaryParams = {}
  ): Promise<SitesSummaryResponse> {
    const response = await this.serverClient.get<
      SitesSummaryResponse | ApiErrorResponse
    >('/devices/sites/summary', { params });
    const data = response.data;

    if ('success' in data && !data.success) {
      throw new Error(data.message || 'Failed to get sites summary');
    }

    return data as SitesSummaryResponse;
  }

  // Get sites using cohort - authenticated endpoint
  async getCohortSites(
    request: CohortSitesRequest,
    params: CohortSitesParams = {}
  ): Promise<CohortSitesResponse> {
    await this.ensureAuthenticated();
    const response = await this.authenticatedClient.post<
      CohortSitesResponse | ApiErrorResponse
    >('/devices/cohorts/sites', request, { params });
    const data = response.data;

    if ('success' in data && !data.success) {
      throw new Error(data.message || 'Failed to get cohort sites');
    }

    return data as CohortSitesResponse;
  }

  // Get devices using cohort - authenticated endpoint
  async getCohortDevices(
    request: CohortDevicesRequest,
    params: CohortDevicesParams = {}
  ): Promise<CohortDevicesResponse> {
    await this.ensureAuthenticated();
    const response = await this.authenticatedClient.post<
      CohortDevicesResponse | ApiErrorResponse
    >('/devices/cohorts/devices', request, { params });
    const data = response.data;

    if ('success' in data && !data.success) {
      throw new Error(data.message || 'Failed to get cohort devices');
    }

    return data as CohortDevicesResponse;
  }

  // Get active groups cohort ids - authenticated endpoint
  async getGroupCohorts(groupId: string): Promise<GroupCohortsResponse> {
    await this.ensureAuthenticated();
    const response = await this.authenticatedClient.get<
      GroupCohortsResponse | ApiErrorResponse
    >(`/users/groups/${groupId}/cohorts`);
    const data = response.data;

    if ('success' in data && !data.success) {
      throw new Error(data.message || 'Failed to get group cohorts');
    }

    return data as GroupCohortsResponse;
  }

  // Get grids summary - authenticated endpoint
  async getGridsSummaryAuthenticated(
    params: GridsSummaryParams = {},
    cohort_id?: string
  ): Promise<GridsSummaryResponse> {
    await this.ensureAuthenticated();
    const queryParams: Record<string, any> = { ...params };
    if (cohort_id) {
      queryParams.cohort_id = cohort_id;
    }
    const response = await this.authenticatedClient.get<
      GridsSummaryResponse | ApiErrorResponse
    >('/devices/grids/summary', { params: queryParams });
    const data = response.data;

    if ('success' in data && !data.success) {
      throw new Error(data.message || 'Failed to get grids summary');
    }

    return data as GridsSummaryResponse;
  }

  // Get grids summary - API token endpoint
  async getGridsSummaryWithToken(
    params: GridsSummaryParams = {},
    cohort_id?: string
  ): Promise<GridsSummaryResponse> {
    const queryParams: Record<string, any> = { ...params };
    if (cohort_id) {
      queryParams.cohort_id = cohort_id;
    }
    const response = await this.serverClient.get<
      GridsSummaryResponse | ApiErrorResponse
    >('/devices/grids/summary', { params: queryParams });
    const data = response.data;

    if ('success' in data && !data.success) {
      throw new Error(data.message || 'Failed to get grids summary');
    }

    return data as GridsSummaryResponse;
  }

  // Get countries list - authenticated endpoint
  async getCountriesAuthenticated(
    cohort_id?: string
  ): Promise<CountriesResponse> {
    await this.ensureAuthenticated();
    const params: Record<string, string> = {};
    if (cohort_id) {
      params.cohort_id = cohort_id;
    }
    const response = await this.authenticatedClient.get<
      CountriesResponse | ApiErrorResponse
    >('/devices/grids/countries', { params });
    const data = response.data;

    if ('success' in data && !data.success) {
      throw new Error(data.message || 'Failed to get countries');
    }

    return data as CountriesResponse;
  }

  // Get map readings - API token endpoint
  async getMapReadingsWithToken(
    cohort_id?: string
  ): Promise<MapReadingsResponse> {
    const params: Record<string, string> = {};
    if (cohort_id) {
      params.cohort_id = cohort_id;
    }

    const response = await this.serverClient.get<
      MapReadingsResponse | ApiErrorResponse
    >('/devices/readings/map', { params });
    const data = response.data;

    if ('success' in data && !data.success) {
      throw new Error(data.message || 'Failed to get map readings');
    }

    return data as MapReadingsResponse;
  }

  // Get forecast data - authenticated endpoint
  async getForecastAuthenticated(siteId: string): Promise<ForecastResponse> {
    await this.ensureAuthenticated();
    const response = await this.authenticatedClient.get<
      ForecastResponse | ApiErrorResponse
    >(`/predict/daily-forecast?site_id=${siteId}`);
    const data = response.data;

    if ('success' in data && !data.success) {
      throw new Error(data.message || 'Failed to get forecast data');
    }

    return data as ForecastResponse;
  }
}

// Export singleton instance
export const deviceService = new DeviceService();
