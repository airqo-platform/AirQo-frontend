/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ApiClient,
  createAuthenticatedClient,
  createServerClient,
} from './apiClient';
import { syncClientSessionToken } from './sessionAuthToken';
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
  CohortResponse,
} from '../types/api';

type LegacyCohortPagination = {
  total?: number;
  limit?: number;
  skip?: number;
  page?: number;
  totalPages?: number;
  nextPage?: string;
};

type LegacyCohortSitesResponse = {
  success: boolean;
  message: string;
  sites: Record<string, unknown>[];
  cache_generated_at?: string;
} & LegacyCohortPagination;

type LegacyCohortDevicesResponse = {
  success: boolean;
  message: string;
  devices: Record<string, unknown>[];
  cache_generated_at?: string;
} & LegacyCohortPagination;

type ApiEnvelope = {
  success?: boolean;
  message?: string;
  data?: unknown;
};

const extractEnvelopeData = <T>(payload: unknown): T | null => {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const envelope = payload as ApiEnvelope;
  const data = envelope.data === undefined ? payload : envelope.data;

  return data as T;
};

const extractGroupCohortIds = (payload: unknown): string[] => {
  const unwrapped = extractEnvelopeData<unknown>(payload);

  if (Array.isArray(unwrapped)) {
    return unwrapped.filter(
      (cohortId): cohortId is string => typeof cohortId === 'string'
    );
  }

  if (
    unwrapped &&
    typeof unwrapped === 'object' &&
    Array.isArray((unwrapped as { data?: unknown }).data)
  ) {
    return (unwrapped as { data: unknown[] }).data.filter(
      (cohortId): cohortId is string => typeof cohortId === 'string'
    );
  }

  if (
    payload &&
    typeof payload === 'object' &&
    Array.isArray((payload as { data?: unknown }).data)
  ) {
    return (payload as { data: unknown[] }).data.filter(
      (cohortId): cohortId is string => typeof cohortId === 'string'
    );
  }

  return [];
};

const isAbortLikeError = (error: unknown): boolean => {
  const candidate = error as {
    name?: string;
    code?: string;
    message?: string;
  } | null;
  if (!candidate) return false;

  return (
    candidate.name === 'AbortError' ||
    candidate.name === 'CanceledError' ||
    candidate.code === 'ERR_CANCELED' ||
    candidate.message === 'canceled'
  );
};

const shouldFallbackToLegacyCohortEndpoint = (error: unknown): boolean => {
  if (isAbortLikeError(error)) {
    return false;
  }

  const candidate = error as {
    code?: string;
    response?: { status?: number };
  } | null;

  const status = candidate?.response?.status;
  return status === 404 || status === 405;
};

const normalizeLegacyMeta = (
  source: LegacyCohortPagination,
  itemCount: number
): {
  total: number;
  limit: number;
  skip: number;
  page: number;
  totalPages: number;
  nextPage?: string;
} => {
  const limit = Number(source.limit ?? itemCount ?? 0) || 0;
  const skip = Number(source.skip ?? 0) || 0;
  const total = Number(source.total ?? itemCount ?? 0) || 0;
  const page =
    Number(source.page ?? 0) || (limit > 0 ? Math.floor(skip / limit) + 1 : 1);
  const totalPages =
    Number(source.totalPages ?? 0) ||
    (limit > 0 ? Math.max(1, Math.ceil(total / limit)) : 1);

  return {
    total,
    limit,
    skip,
    page,
    totalPages,
    ...(source.nextPage ? { nextPage: source.nextPage } : {}),
  };
};

const normalizeSitesResponse = (
  response: CohortSitesResponse | LegacyCohortSitesResponse,
  envelope?: ApiEnvelope
): CohortSitesResponse => {
  if ('meta' in response) {
    return {
      ...response,
      success:
        typeof envelope?.success === 'boolean'
          ? envelope.success
          : response.success,
      message:
        typeof envelope?.message === 'string' && envelope.message.trim()
          ? envelope.message
          : response.message,
    };
  }

  const sites = response.sites ?? [];

  return {
    success:
      typeof envelope?.success === 'boolean'
        ? envelope.success
        : response.success,
    message:
      typeof envelope?.message === 'string' && envelope.message.trim()
        ? envelope.message
        : response.message,
    meta: normalizeLegacyMeta(response, sites.length),
    sites,
    ...(response.cache_generated_at
      ? { cache_generated_at: response.cache_generated_at }
      : {}),
  };
};

const normalizeDevicesResponse = (
  response: CohortDevicesResponse | LegacyCohortDevicesResponse,
  envelope?: ApiEnvelope
): CohortDevicesResponse => {
  if ('meta' in response) {
    return {
      ...response,
      success:
        typeof envelope?.success === 'boolean'
          ? envelope.success
          : response.success,
      message:
        typeof envelope?.message === 'string' && envelope.message.trim()
          ? envelope.message
          : response.message,
    };
  }

  const devices = response.devices ?? [];

  return {
    success:
      typeof envelope?.success === 'boolean'
        ? envelope.success
        : response.success,
    message:
      typeof envelope?.message === 'string' && envelope.message.trim()
        ? envelope.message
        : response.message,
    meta: normalizeLegacyMeta(response, devices.length),
    devices,
    ...(response.cache_generated_at
      ? { cache_generated_at: response.cache_generated_at }
      : {}),
  };
};

const DEVICE_COHORTS_PATH = '/devices/cohorts';

export class DeviceService {
  private authenticatedClient: ApiClient;
  private serverClient: ApiClient;

  constructor() {
    this.authenticatedClient = createAuthenticatedClient();
    this.serverClient = createServerClient();
  }

  private async ensureAuthenticated() {
    await syncClientSessionToken(this.authenticatedClient);
  }

  // Get sites summary - authenticated endpoint
  async getSitesSummaryAuthenticated(
    params: SitesSummaryParams = {},
    signal?: AbortSignal
  ): Promise<SitesSummaryResponse> {
    await this.ensureAuthenticated();
    const response = await this.authenticatedClient.get<
      SitesSummaryResponse | ApiErrorResponse
    >('/devices/sites/summary', { params, signal });
    const data = response.data;

    if ('success' in data && !data.success) {
      throw new Error(data.message || 'Failed to get sites summary');
    }

    return data as SitesSummaryResponse;
  }

  // Get sites summary - API token endpoint
  async getSitesSummaryWithToken(
    params: SitesSummaryParams = {},
    signal?: AbortSignal
  ): Promise<SitesSummaryResponse> {
    const response = await this.serverClient.get<
      SitesSummaryResponse | ApiErrorResponse
    >('/devices/sites/summary', { params, signal });
    const data = response.data;

    if ('success' in data && !data.success) {
      throw new Error(data.message || 'Failed to get sites summary');
    }

    return data as SitesSummaryResponse;
  }

  // Get sites using cohort - authenticated endpoint
  async getCohortSites(
    request: CohortSitesRequest,
    params: CohortSitesParams = {},
    signal?: AbortSignal
  ): Promise<CohortSitesResponse> {
    try {
      return await this.getCohortSitesCached(request, params, signal);
    } catch (error) {
      if (!shouldFallbackToLegacyCohortEndpoint(error)) {
        throw error;
      }

      return this.getCohortSitesLegacy(request, params, signal);
    }
  }

  async getCohortSitesCached(
    request: CohortSitesRequest,
    params: CohortSitesParams = {},
    signal?: AbortSignal
  ): Promise<CohortSitesResponse> {
    await this.ensureAuthenticated();
    const response = await this.authenticatedClient.post<
      CohortSitesResponse | LegacyCohortSitesResponse | ApiErrorResponse
    >(`${DEVICE_COHORTS_PATH}/cached-sites`, request, {
      params,
      signal,
      suppressErrorLogging: true,
    });
    const responsePayload = response.data;

    if ('success' in responsePayload && !responsePayload.success) {
      throw new Error(responsePayload.message || 'Failed to get cohort sites');
    }

    const unwrapped =
      extractEnvelopeData<CohortSitesResponse | LegacyCohortSitesResponse>(
        responsePayload
      ) || (responsePayload as CohortSitesResponse | LegacyCohortSitesResponse);

    return normalizeSitesResponse(unwrapped, responsePayload);
  }

  async getCohortSitesLegacy(
    request: CohortSitesRequest,
    params: CohortSitesParams = {},
    signal?: AbortSignal
  ): Promise<CohortSitesResponse> {
    await this.ensureAuthenticated();
    const response = await this.authenticatedClient.post<
      LegacyCohortSitesResponse | ApiErrorResponse
    >(`${DEVICE_COHORTS_PATH}/sites`, request, { params, signal });
    const responsePayload = response.data;

    if ('success' in responsePayload && !responsePayload.success) {
      throw new Error(responsePayload.message || 'Failed to get cohort sites');
    }

    const unwrapped =
      extractEnvelopeData<LegacyCohortSitesResponse>(responsePayload) ||
      (responsePayload as LegacyCohortSitesResponse);

    return normalizeSitesResponse(unwrapped, responsePayload);
  }

  // Get devices using cohort - authenticated endpoint
  async getCohortDevices(
    request: CohortDevicesRequest,
    params: CohortDevicesParams = {},
    signal?: AbortSignal
  ): Promise<CohortDevicesResponse> {
    try {
      return await this.getCohortDevicesCached(request, params, signal);
    } catch (error) {
      if (!shouldFallbackToLegacyCohortEndpoint(error)) {
        throw error;
      }

      return this.getCohortDevicesLegacy(request, params, signal);
    }
  }

  async getCohortDevicesCached(
    request: CohortDevicesRequest,
    params: CohortDevicesParams = {},
    signal?: AbortSignal
  ): Promise<CohortDevicesResponse> {
    await this.ensureAuthenticated();
    const response = await this.authenticatedClient.post<
      CohortDevicesResponse | LegacyCohortDevicesResponse | ApiErrorResponse
    >(`${DEVICE_COHORTS_PATH}/cached-devices`, request, {
      params,
      signal,
      suppressErrorLogging: true,
    });
    const responsePayload = response.data;

    if ('success' in responsePayload && !responsePayload.success) {
      throw new Error(
        responsePayload.message || 'Failed to get cohort devices'
      );
    }

    const unwrapped =
      extractEnvelopeData<CohortDevicesResponse | LegacyCohortDevicesResponse>(
        responsePayload
      ) ||
      (responsePayload as CohortDevicesResponse | LegacyCohortDevicesResponse);

    return normalizeDevicesResponse(unwrapped, responsePayload);
  }

  async getCohortDevicesLegacy(
    request: CohortDevicesRequest,
    params: CohortDevicesParams = {},
    signal?: AbortSignal
  ): Promise<CohortDevicesResponse> {
    await this.ensureAuthenticated();
    const response = await this.authenticatedClient.post<
      LegacyCohortDevicesResponse | ApiErrorResponse
    >(`${DEVICE_COHORTS_PATH}/devices`, request, { params, signal });
    const responsePayload = response.data;

    if ('success' in responsePayload && !responsePayload.success) {
      throw new Error(
        responsePayload.message || 'Failed to get cohort devices'
      );
    }

    const unwrapped =
      extractEnvelopeData<LegacyCohortDevicesResponse>(responsePayload) ||
      (responsePayload as LegacyCohortDevicesResponse);

    return normalizeDevicesResponse(unwrapped, responsePayload);
  }

  // Get active groups cohort ids - authenticated endpoint
  async getGroupCohorts(
    groupId: string,
    signal?: AbortSignal
  ): Promise<GroupCohortsResponse> {
    await this.ensureAuthenticated();
    const response = await this.authenticatedClient.get<
      GroupCohortsResponse | ApiErrorResponse
    >(`/users/groups/${groupId}/cohorts`, { signal });
    const responsePayload = response.data;

    if ('success' in responsePayload && !responsePayload.success) {
      throw new Error(responsePayload.message || 'Failed to get group cohorts');
    }

    const normalizedCohortIds = Array.from(
      new Set(
        extractGroupCohortIds(responsePayload)
          .map(cohortId => cohortId?.trim())
          .filter((cohortId): cohortId is string => Boolean(cohortId))
      )
    );

    const envelope = responsePayload as ApiEnvelope;

    return {
      success: typeof envelope.success === 'boolean' ? envelope.success : true,
      message:
        typeof envelope.message === 'string' && envelope.message.trim()
          ? envelope.message
          : 'Group cohorts retrieved successfully',
      data: normalizedCohortIds,
    };
  }

  // Get cohort details - authenticated endpoint
  async getCohort(
    cohortId: string,
    signal?: AbortSignal
  ): Promise<CohortResponse> {
    const resolvedCohortId = (cohortId || '')
      .split(',')
      .map(value => value.trim())
      .find(Boolean);

    if (!resolvedCohortId) {
      throw new Error('Cohort id is required');
    }

    await this.ensureAuthenticated();

    try {
      const response = await this.authenticatedClient.get<
        CohortResponse | ApiErrorResponse
      >(`${DEVICE_COHORTS_PATH}/${resolvedCohortId}`, {
        signal,
        suppressErrorLogging: true,
      });
      const data = response.data;

      if ('success' in data && !data.success) {
        throw new Error(data.message || 'Failed to get cohort details');
      }

      return data as CohortResponse;
    } catch (error) {
      if (!shouldFallbackToLegacyCohortEndpoint(error)) {
        throw error;
      }

      return {
        success: true,
        message: 'Cohort details endpoint unavailable; continuing without details',
        meta: {
          total: 0,
          limit: 0,
          skip: 0,
          page: 1,
          totalPages: 1,
        },
        cohorts: [],
      };
    }
  }

  // Get grids summary - authenticated endpoint
  async getGridsSummaryAuthenticated(
    params: GridsSummaryParams = {},
    cohort_id?: string,
    signal?: AbortSignal
  ): Promise<GridsSummaryResponse> {
    await this.ensureAuthenticated();
    const queryParams: Record<string, any> = { ...params };
    if (cohort_id) {
      queryParams.cohort_id = cohort_id;
    }
    const response = await this.authenticatedClient.get<
      GridsSummaryResponse | ApiErrorResponse
    >('/devices/grids/summary', { params: queryParams, signal });
    const data = response.data;

    if ('success' in data && !data.success) {
      throw new Error(data.message || 'Failed to get grids summary');
    }

    return data as GridsSummaryResponse;
  }

  // Get grids summary - API token endpoint
  async getGridsSummaryWithToken(
    params: GridsSummaryParams = {},
    cohort_id?: string,
    signal?: AbortSignal
  ): Promise<GridsSummaryResponse> {
    const queryParams: Record<string, any> = { ...params };
    if (cohort_id) {
      queryParams.cohort_id = cohort_id;
    }
    const response = await this.serverClient.get<
      GridsSummaryResponse | ApiErrorResponse
    >('/devices/grids/summary', { params: queryParams, signal });
    const data = response.data;

    if ('success' in data && !data.success) {
      throw new Error(data.message || 'Failed to get grids summary');
    }

    return data as GridsSummaryResponse;
  }

  // Get countries list - authenticated endpoint
  async getCountriesAuthenticated(
    cohort_id?: string,
    signal?: AbortSignal
  ): Promise<CountriesResponse> {
    await this.ensureAuthenticated();
    const params: Record<string, string> = {};
    if (cohort_id) {
      params.cohort_id = cohort_id;
    }
    const response = await this.authenticatedClient.get<
      CountriesResponse | ApiErrorResponse
    >('/devices/grids/countries', { params, signal });
    const data = response.data;

    if ('success' in data && !data.success) {
      throw new Error(data.message || 'Failed to get countries');
    }

    return data as CountriesResponse;
  }

  // Get countries list - API token endpoint
  async getCountriesWithToken(
    cohort_id?: string,
    signal?: AbortSignal
  ): Promise<CountriesResponse> {
    const params: Record<string, string> = {};
    if (cohort_id) {
      params.cohort_id = cohort_id;
    }
    const response = await this.serverClient.get<
      CountriesResponse | ApiErrorResponse
    >('/devices/grids/countries', { params, signal });
    const data = response.data;

    if ('success' in data && !data.success) {
      throw new Error(data.message || 'Failed to get countries');
    }

    return data as CountriesResponse;
  }

  // Get map readings - API token endpoint
  async getMapReadingsWithToken(
    cohort_id?: string,
    signal?: AbortSignal
  ): Promise<MapReadingsResponse> {
    const params: Record<string, string> = {};
    if (cohort_id) {
      params.cohort_id = cohort_id;
    }

    const response = await this.serverClient.get<
      MapReadingsResponse | ApiErrorResponse
    >('/devices/readings/map', { params, signal });
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
