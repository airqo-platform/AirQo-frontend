import {
  type CityPopulationEntry,
  type NetworkCoverageCitiesResponse,
  type NetworkCoverageCountryResponse,
  type NetworkCoverageImpactResponse,
  type NetworkCoverageMonitorResponse,
  type NetworkCoverageQueryParams,
  type NetworkCoverageSummaryResponse,
  normalizeCityPopulationEntry,
  normalizeNetworkCoverageCities,
  normalizeNetworkCoverageImpact,
  normalizeNetworkCoverageMonitor,
  normalizeNetworkCoverageSummary,
} from '@/views/solutions/NetworkCoverage/networkCoverageTypes';

import BaseApiService, { ServiceOptions } from '../base';

const NETWORK_COVERAGE_ENDPOINTS = {
  SUMMARY: 'devices/network-coverage',
  MONITOR_DETAIL: 'devices/network-coverage/monitors',
  COUNTRY_MONITORS: 'devices/network-coverage/countries',
  EXPORT_CSV: 'devices/network-coverage/export.csv',
  REGISTRY: 'devices/network-coverage/registry',
  IMPACT: 'devices/network-coverage/impact',
  CITIES: 'devices/network-coverage/cities',
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
    if (params.network) queryParams.network = params.network;

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
      'tenant' | 'activeOnly' | 'types' | 'network'
    > = {},
    options: ServiceOptions = {},
  ): Promise<NetworkCoverageCountryResponse> {
    const queryParams: Record<string, unknown> = {};

    if (params.tenant) queryParams.tenant = params.tenant;
    if (params.activeOnly !== undefined)
      queryParams.activeOnly = params.activeOnly;
    if (params.types) queryParams.types = params.types;
    if (params.network) queryParams.network = params.network;

    const response = await this.get<NetworkCoverageCountryResponse>(
      `${NETWORK_COVERAGE_ENDPOINTS.COUNTRY_MONITORS}/${encodeURIComponent(
        countryId,
      )}/monitors`,
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
      `${NETWORK_COVERAGE_ENDPOINTS.MONITOR_DETAIL}/${encodeURIComponent(
        monitorId,
      )}`,
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
    if (params.network) queryParams.set('network', params.network);
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

  async upsertNetworkCoverageRegistry(
    body: Record<string, unknown>,
    options: ServiceOptions = {},
  ): Promise<any> {
    const response = await this.post(
      NETWORK_COVERAGE_ENDPOINTS.REGISTRY,
      body,
      { ...options, throwOnError: false },
    );

    if (response.success) {
      return response.data ?? null;
    }

    throw new Error(response.message || 'Failed to save registry record');
  }

  async getNetworkCoverageImpact(
    params: Pick<
      NetworkCoverageQueryParams,
      'tenant' | 'activeOnly' | 'types' | 'network'
    > = {},
    options: ServiceOptions = {},
  ): Promise<NetworkCoverageImpactResponse> {
    const queryParams: Record<string, unknown> = {};

    if (params.tenant) queryParams.tenant = params.tenant;
    if (params.activeOnly !== undefined)
      queryParams.activeOnly = params.activeOnly;
    if (params.types) queryParams.types = params.types;
    if (params.network) queryParams.network = params.network;

    const response = await this.get<NetworkCoverageImpactResponse>(
      NETWORK_COVERAGE_ENDPOINTS.IMPACT,
      queryParams,
      { ...options, throwOnError: false },
    );

    if (response.success && response.data) {
      return normalizeNetworkCoverageImpact(response.data as any);
    }

    throw new Error(
      response.message || 'Failed to fetch network coverage impact',
    );
  }

  async getNetworkCoverageCities(
    params: { country?: string } = {},
    options: ServiceOptions = {},
  ): Promise<NetworkCoverageCitiesResponse> {
    const queryParams: Record<string, unknown> = {};
    if (params.country) queryParams.country = params.country;

    const response = await this.get<NetworkCoverageCitiesResponse>(
      NETWORK_COVERAGE_ENDPOINTS.CITIES,
      queryParams,
      { ...options, throwOnError: false },
    );

    if (response.success && response.data) {
      return normalizeNetworkCoverageCities(response.data as any);
    }

    throw new Error(response.message || 'Failed to fetch city population data');
  }

  async createCityPopulation(
    body: {
      city: string;
      country: string;
      iso2: string;
      population: number;
      year: number;
      source: string;
      notes?: string;
    },
    options: ServiceOptions = {},
  ): Promise<CityPopulationEntry> {
    const response = await this.post<NetworkCoverageCitiesResponse>(
      NETWORK_COVERAGE_ENDPOINTS.CITIES,
      body,
      { ...options, throwOnError: false },
    );

    if (response.success && response.data) {
      const data = response.data as any;
      if (data.city) {
        return normalizeCityPopulationEntry(data.city);
      }
      if (Array.isArray(data.cities) && data.cities.length > 0) {
        return normalizeCityPopulationEntry(data.cities[0]);
      }
    }

    throw new Error(response.message || 'Failed to save city population');
  }
}

const networkCoverageService = new NetworkCoverageService();

export default networkCoverageService;
