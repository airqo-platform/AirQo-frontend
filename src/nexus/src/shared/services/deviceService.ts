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
  CohortSummary,
  CohortsSummaryResponse,
  GroupCohortsResponse,
  GridsSummaryResponse,
  GridsSummaryParams,
  CountriesResponse,
  MapReadingsResponse,
  DailyForecastResponse,
  HourlyForecastResponse,
  CohortResponse,
  MeasurementsResponse,
  MeasurementsQueryParams,
  SiteAveragesResponse,
  DeviceSummaryCount,
  DeviceSummaryCountParams,
  DeviceSummaryCountRawResponse,
} from '../types/api';
import { normalizeCohortIds } from '../utils/cohortUtils';
import { isAbortError } from '../lib/retryPolicy';

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

const shouldFallbackToLegacyCohortEndpoint = (error: unknown): boolean => {
  if (isAbortError(error)) {
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

// /devices/cohorts/summary is paginated (default limit 30, server cap 80),
// so a call must ask for as many rows as it requests ids; larger id sets are
// split into sequential ≤80-id calls and merged by `_id`.
const SUMMARY_MAX_LIMIT = 80;

const normalizeCohortSummaryEntry = (entry: unknown): CohortSummary | null => {
  if (!entry || typeof entry !== 'object') {
    return null;
  }

  const candidate = entry as {
    _id?: unknown;
    name?: unknown;
    network?: unknown;
    visibility?: unknown;
    cohort_tags?: unknown;
    groups?: unknown;
    createdAt?: unknown;
  };

  if (typeof candidate._id !== 'string' || !candidate._id.trim()) {
    return null;
  }

  return {
    _id: candidate._id,
    name: typeof candidate.name === 'string' ? candidate.name.trim() : '',
    ...(typeof candidate.network === 'string'
      ? { network: candidate.network }
      : {}),
    ...(typeof candidate.visibility === 'boolean'
      ? { visibility: candidate.visibility }
      : {}),
    ...(Array.isArray(candidate.cohort_tags)
      ? {
          cohort_tags: candidate.cohort_tags.filter(
            (tag): tag is string => typeof tag === 'string'
          ),
        }
      : {}),
    ...(Array.isArray(candidate.groups)
      ? {
          groups: candidate.groups.filter(
            (group): group is string => typeof group === 'string'
          ),
        }
      : {}),
    ...(typeof candidate.createdAt === 'string'
      ? { createdAt: candidate.createdAt }
      : {}),
  };
};

// The summary endpoint's envelope has drifted across releases: the cohort
// list may sit at `cohorts`, at `data` (array) or at `data.cohorts`.
// Normalize all three shapes.
const extractCohortSummaries = (payload: unknown): CohortSummary[] => {
  if (!payload || typeof payload !== 'object') {
    return [];
  }

  const envelope = payload as { cohorts?: unknown; data?: unknown };

  const fromArray = (value: unknown): CohortSummary[] | null =>
    Array.isArray(value)
      ? value
          .map(normalizeCohortSummaryEntry)
          .filter((entry): entry is CohortSummary => entry !== null)
      : null;

  return (
    fromArray(envelope.cohorts) ??
    fromArray(envelope.data) ??
    fromArray((envelope.data as { cohorts?: unknown } | undefined)?.cohorts) ??
    []
  );
};

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

  // Get sites summary - API token endpoint (direct backend call)
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

    const normalizedCohortIds = normalizeCohortIds(
      extractGroupCohortIds(responsePayload)
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

  // Resolve cohort summaries (name, visibility, ...) for a whole id set —
  // replaces per-cohort detail lookups. The endpoint paginates (cap 80), so
  // the request asks for `limit = <chunk id count>` and id sets above the
  // cap are fetched in parallel chunks and merged by `_id`. Chunks settle
  // independently (`Promise.allSettled`): a transient failure on one chunk
  // returns the summaries the other chunks already produced; only when every
  // chunk rejects does the call reject.
  async getCohortsSummary(
    cohortIds: string[],
    signal?: AbortSignal
  ): Promise<CohortSummary[]> {
    const normalizedIds = normalizeCohortIds(cohortIds ?? []);
    if (normalizedIds.length === 0) {
      return [];
    }

    await this.ensureAuthenticated();

    const chunks: string[][] = [];
    for (
      let index = 0;
      index < normalizedIds.length;
      index += SUMMARY_MAX_LIMIT
    ) {
      chunks.push(normalizedIds.slice(index, index + SUMMARY_MAX_LIMIT));
    }

    const merged = new Map<string, CohortSummary>();
    const rejections: unknown[] = [];
    let fulfilledChunks = 0;

    const results = await Promise.allSettled(
      chunks.map(async chunkIds => {
        const response = await this.authenticatedClient.get<
          CohortsSummaryResponse | ApiErrorResponse
        >(`${DEVICE_COHORTS_PATH}/summary`, {
          params: {
            cohort_id: chunkIds.join(','),
            include_devices: false,
            limit: chunkIds.length,
          },
          signal,
          suppressErrorLogging: true,
        });
        const responsePayload = response.data;

        if ('success' in responsePayload && !responsePayload.success) {
          throw new Error(
            responsePayload.message || 'Failed to get cohort summaries'
          );
        }

        return extractCohortSummaries(responsePayload);
      })
    );

    for (const result of results) {
      if (result.status === 'rejected') {
        rejections.push(result.reason);
        continue;
      }
      fulfilledChunks += 1;
      for (const summary of result.value) {
        merged.set(summary._id, summary);
      }
    }

    if (fulfilledChunks === 0) {
      throw rejections[0];
    }

    return Array.from(merged.values());
  }

  // Get cohort details - authenticated endpoint
  async getCohort(
    cohortId: string,
    signal?: AbortSignal
  ): Promise<CohortResponse> {
    const resolvedCohortId = normalizeCohortIds(cohortId)[0];

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
        message:
          'Cohort details endpoint unavailable; continuing without details',
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

  // Get grids summary - API token endpoint (direct backend call)
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

  // Get countries list - API token endpoint (direct backend call)
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

  // Get device summary count by category - authenticated endpoint.
  //
  // The /devices/summary/count endpoint is read inconsistently across apps:
  // some consumers expect counts under `data`, others under `summary`, others
  // at the top level. This method normalizes all three shapes into a single
  // `DeviceSummaryCount` and coerces every field to a finite number (default 0).
  async getDeviceSummaryCountAuthenticated(
    params: DeviceSummaryCountParams,
    signal?: AbortSignal
  ): Promise<DeviceSummaryCount> {
    await this.ensureAuthenticated();

    // Drop undefined/empty query params so the request stays clean.
    const queryParams: Record<string, any> = { category: params.category };
    if (params.status) {
      queryParams.status = params.status;
    }
    if (params.network) {
      queryParams.network = params.network;
    }
    if (params.group_id) {
      queryParams.group_id = params.group_id;
    }
    if (params.cohort_id) {
      queryParams.cohort_id = params.cohort_id;
    }

    const response = await this.authenticatedClient.get<
      DeviceSummaryCountRawResponse | ApiErrorResponse
    >('/devices/summary/count', {
      params: queryParams,
      signal,
      suppressErrorLogging: true,
    });
    const data = response.data;

    if ('success' in data && !data.success) {
      throw new Error(data.message || 'Failed to get device summary count');
    }

    const raw = data as DeviceSummaryCountRawResponse;
    const bucket = raw.data ?? raw.summary ?? raw;

    const toNumber = (value: unknown): number =>
      typeof value === 'number' && Number.isFinite(value) ? value : 0;

    return {
      total_monitors: toNumber(bucket.total_monitors),
      operational: toNumber(bucket.operational),
      transmitting: toNumber(bucket.transmitting),
      not_transmitting: toNumber(bucket.not_transmitting),
      data_available: toNumber(bucket.data_available),
    };
  }

  // Get map readings - API token endpoint (direct backend call)
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

  // ---- Measurements v2 endpoints (direct backend calls via API token) ----

  private async getMeasurements<T extends MeasurementsResponse>(
    path: string,
    params: MeasurementsQueryParams = {},
    signal?: AbortSignal
  ): Promise<T> {
    const response = await this.serverClient.get<T | ApiErrorResponse>(path, {
      params,
      signal,
    });
    const data = response.data;

    if ('success' in data && !data.success) {
      throw new Error(data.message || 'Failed to get measurements');
    }

    return data as T;
  }

  // Recent measurements for a cohort (organization fleet live snapshot)
  async getRecentCohortMeasurements(
    cohortId: string,
    params: MeasurementsQueryParams = {},
    signal?: AbortSignal
  ): Promise<MeasurementsResponse> {
    return this.getMeasurements(
      `/devices/measurements/cohorts/${cohortId}/recent`,
      params,
      signal
    );
  }

  // Historical measurements for a cohort (fleet trend series)
  async getHistoricalCohortMeasurements(
    cohortId: string,
    params: MeasurementsQueryParams = {},
    signal?: AbortSignal
  ): Promise<MeasurementsResponse> {
    return this.getMeasurements(
      `/devices/measurements/cohorts/${cohortId}/historical`,
      params,
      signal
    );
  }

  // Historical measurements for a single site
  async getHistoricalSiteMeasurements(
    siteId: string,
    params: MeasurementsQueryParams = {},
    signal?: AbortSignal
  ): Promise<MeasurementsResponse> {
    return this.getMeasurements(
      `/devices/measurements/sites/${siteId}/historical`,
      params,
      signal
    );
  }

  // Air quality averages for a single site (daily + week-over-week delta)
  async getSiteAverages(
    siteId: string,
    params: MeasurementsQueryParams = {},
    signal?: AbortSignal
  ): Promise<SiteAveragesResponse> {
    const response = await this.serverClient.get<
      SiteAveragesResponse | ApiErrorResponse
    >(`/devices/measurements/sites/${siteId}/averages`, {
      params,
      signal,
    });
    const data = response.data;

    if ('success' in data && !data.success) {
      throw new Error(data.message || 'Failed to get site averages');
    }

    return data as SiteAveragesResponse;
  }

  // Recent measurements for a single device
  async getRecentDeviceMeasurements(
    deviceId: string,
    params: MeasurementsQueryParams = {},
    signal?: AbortSignal
  ): Promise<MeasurementsResponse> {
    return this.getMeasurements(
      `/devices/measurements/devices/${deviceId}/recent`,
      params,
      signal
    );
  }

  // Historical measurements for a single device
  async getHistoricalDeviceMeasurements(
    deviceId: string,
    params: MeasurementsQueryParams = {},
    signal?: AbortSignal
  ): Promise<MeasurementsResponse> {
    return this.getMeasurements(
      `/devices/measurements/devices/${deviceId}/historical`,
      params,
      signal
    );
  }

  // Get daily forecast data - direct backend call via API token.
  // NOTE: the backend 404s this route WITH a trailing slash — keep the path
  // slash-free so direct calls also work.
  async getDailyForecast(
    siteId: string,
    signal?: AbortSignal
  ): Promise<DailyForecastResponse> {
    const response = await this.serverClient.get<
      DailyForecastResponse | ApiErrorResponse
    >(`/predict/daily-forecasting?site_id=${siteId}`, { signal });
    const data = response.data;

    if (
      'success' in data &&
      !data.success &&
      'message' in data &&
      typeof data.message === 'string'
    ) {
      throw new Error(data.message || 'Failed to get daily forecast data');
    }

    return data as DailyForecastResponse;
  }

  // Get hourly forecast data - direct backend call via API token.
  // Slash-free path — the backend 404s the trailing-slash form (same as
  // daily-forecasting).
  async getHourlyForecast(
    siteId: string,
    page = 1,
    limit = 24,
    signal?: AbortSignal
  ): Promise<HourlyForecastResponse> {
    const response = await this.serverClient.get<
      HourlyForecastResponse | ApiErrorResponse
    >(
      `/predict/hourly-forecasting?site_id=${siteId}&page=${page}&limit=${limit}`,
      { signal }
    );
    const data = response.data;

    if (
      'success' in data &&
      !data.success &&
      'message' in data &&
      typeof data.message === 'string'
    ) {
      throw new Error(data.message || 'Failed to get hourly forecast data');
    }

    return data as HourlyForecastResponse;
  }
}

// Export singleton instance
export const deviceService = new DeviceService();
