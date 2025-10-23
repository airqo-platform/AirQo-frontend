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
    params: GridsSummaryParams = {}
  ): Promise<GridsSummaryResponse> {
    await this.ensureAuthenticated();
    const response = await this.authenticatedClient.get<
      GridsSummaryResponse | ApiErrorResponse
    >('/devices/grids/summary', { params });
    const data = response.data;

    if ('success' in data && !data.success) {
      throw new Error(data.message || 'Failed to get grids summary');
    }

    return data as GridsSummaryResponse;
  }

  // Get grids summary - API token endpoint
  async getGridsSummaryWithToken(
    params: GridsSummaryParams = {}
  ): Promise<GridsSummaryResponse> {
    const response = await this.serverClient.get<
      GridsSummaryResponse | ApiErrorResponse
    >('/devices/grids/summary', { params });
    const data = response.data;

    if ('success' in data && !data.success) {
      throw new Error(data.message || 'Failed to get grids summary');
    }

    return data as GridsSummaryResponse;
  }
}

// Export singleton instance
export const deviceService = new DeviceService();
