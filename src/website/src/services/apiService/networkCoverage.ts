import {
  type NetworkCoverageCountryResponse,
  type NetworkCoverageMonitorResponse,
  type NetworkCoverageQueryParams,
  type NetworkCoverageSummaryResponse,
  normalizeNetworkCoverageMonitor,
  normalizeNetworkCoverageSummary,
} from '@/views/solutions/NetworkCoverage/networkCoverageTypes';

import BaseApiService, { ServiceOptions } from '../base';

const NETWORK_COVERAGE_ENDPOINTS = {
  SUMMARY: 'devices/network-coverage',
  MONITOR_DETAIL: 'devices/network-coverage/monitors',
  COUNTRY_MONITORS: 'devices/network-coverage/countries',
  EXPORT_CSV: 'devices/network-coverage/export.csv',
} as const;

class NetworkCoverageService extends BaseApiService {
  constructor() {
    super('NetworkCoverageService');
  }

  async getNetworkCoverageSummary(
    params: NetworkCoverageQueryParams = {},
    options: ServiceOptions = {},
  ): Promise<NetworkCoverageSummaryResponse> {
    const queryParams: Record<string, unknown> = {};

    if (params.tenant) queryParams.tenant = params.tenant;
    if (params.search) queryParams.search = params.search;
    if (params.activeOnly !== undefined)
      queryParams.activeOnly = params.activeOnly;
    if (params.types) queryParams.types = params.types;

    const response = await this.get<NetworkCoverageSummaryResponse>(
      NETWORK_COVERAGE_ENDPOINTS.SUMMARY,
      queryParams,
      { ...options, throwOnError: false },
    );

    if (response.success && response.data) {
      return normalizeNetworkCoverageSummary(response.data as any);
    }

    throw new Error(
      response.message || 'Failed to fetch network coverage data',
    );
  }

  async getNetworkCoverageCountryMonitors(
    countryId: string,
    params: Pick<
      NetworkCoverageQueryParams,
      'tenant' | 'activeOnly' | 'types'
    > = {},
    options: ServiceOptions = {},
  ): Promise<NetworkCoverageCountryResponse> {
    const queryParams: Record<string, unknown> = {};

    if (params.tenant) queryParams.tenant = params.tenant;
    if (params.activeOnly !== undefined)
      queryParams.activeOnly = params.activeOnly;
    if (params.types) queryParams.types = params.types;

    const response = await this.get<NetworkCoverageCountryResponse>(
      `${NETWORK_COVERAGE_ENDPOINTS.COUNTRY_MONITORS}/${countryId}/monitors`,
      queryParams,
      { ...options, throwOnError: false },
    );

    if (response.success && response.data) {
      return {
        ...response.data,
        monitors: response.data.monitors.map((monitor) =>
          normalizeNetworkCoverageMonitor(monitor as any),
        ),
      };
    }

    throw new Error(
      response.message || 'Failed to fetch country network coverage data',
    );
  }

  async getNetworkCoverageMonitor(
    monitorId: string,
    params: Pick<NetworkCoverageQueryParams, 'tenant'> = {},
    options: ServiceOptions = {},
  ): Promise<NetworkCoverageMonitorResponse> {
    const queryParams: Record<string, unknown> = {};

    if (params.tenant) queryParams.tenant = params.tenant;

    const response = await this.get<NetworkCoverageMonitorResponse>(
      `${NETWORK_COVERAGE_ENDPOINTS.MONITOR_DETAIL}/${monitorId}`,
      queryParams,
      { ...options, throwOnError: false },
    );

    if (response.success && response.data) {
      return {
        ...response.data,
        monitor: normalizeNetworkCoverageMonitor(response.data.monitor as any),
      };
    }

    throw new Error(
      response.message || 'Failed to fetch network coverage monitor',
    );
  }

  async downloadNetworkCoverageCsv(
    params: NetworkCoverageQueryParams = {},
  ): Promise<Blob> {
    const queryParams = new URLSearchParams();

    if (params.tenant) queryParams.set('tenant', params.tenant);
    if (params.search) queryParams.set('search', params.search);
    if (params.activeOnly !== undefined) {
      queryParams.set('activeOnly', String(params.activeOnly));
    }
    if (params.types) queryParams.set('types', params.types);
    if (params.countryId) queryParams.set('countryId', params.countryId);

    const response = await fetch(
      `/api/v2/${NETWORK_COVERAGE_ENDPOINTS.EXPORT_CSV}${
        queryParams.toString() ? `?${queryParams.toString()}` : ''
      }`,
      {
        method: 'GET',
        headers: {
          Accept: 'text/csv',
        },
      },
    );

    if (!response.ok) {
      let errorMessage = 'Failed to download network coverage CSV';

      try {
        const payload = (await response.json()) as { message?: string };
        if (payload?.message) {
          errorMessage = payload.message;
        }
      } catch {
        // Ignore JSON parsing errors for non-JSON responses.
      }

      throw new Error(errorMessage);
    }

    return response.blob();
  }
}

const networkCoverageService = new NetworkCoverageService();

export default networkCoverageService;
