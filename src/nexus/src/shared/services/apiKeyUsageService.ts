import { ApiClient, createAuthenticatedClient } from './apiClient';
import { syncClientSessionToken } from './sessionAuthToken';
import type {
  ApiKeyUsageDetailData,
  ApiKeyUsageDetailParams,
  ApiKeyUsageLeaderboardData,
  ApiKeyUsageLeaderboardParams,
  ApiKeyUsageTimeseriesData,
  ApiKeyUsageTimeseriesParams,
} from '../types/apiKeyUsage';

const LEADERBOARD_PATH = '/users/usage/api-keys';
const TIMESERIES_PATH = '/users/usage/api-keys/timeseries';

/** Wire envelope shared by the JSON API Key Usage endpoints. */
export interface ApiKeyUsageEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
}

const extractSuccessData = <T>(
  data: ApiKeyUsageEnvelope<T>,
  fallbackMessage: string
): ApiKeyUsageEnvelope<T> => {
  if (data?.success === false) {
    throw new Error(data.message || fallbackMessage);
  }

  return data;
};

type QueryValue = string | number | undefined | null;

/**
 * Builds the query string, dropping undefined/null/empty-string params so an
 * optional filter never becomes `?service=` on the wire.
 */
const buildQuery = (params: Record<string, QueryValue>): string => {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    query.set(key, String(value));
  }

  return query.toString();
};

/**
 * Leaderboard query. `format` is intentionally never emitted here: JSON calls
 * rely on the server default, only `getLeaderboardCsv` forces `format=csv`.
 */
const buildLeaderboardQuery = (params: ApiKeyUsageLeaderboardParams): string =>
  buildQuery({
    from: params.from,
    to: params.to,
    // Never send an empty/unknown service filter — falsy means "all services".
    service: params.service || undefined,
    user_id: params.user_id,
    sort: params.sort,
    order: params.order,
    page: params.page,
    limit: params.limit,
  });

const buildTimeseriesQuery = (params: ApiKeyUsageTimeseriesParams): string =>
  buildQuery({
    from: params.from,
    to: params.to,
    interval: params.interval,
    top: params.top,
    client_id: params.client_id,
    service: params.service || undefined,
    user_id: params.user_id,
  });

const buildDetailQuery = (params: ApiKeyUsageDetailParams): string =>
  buildQuery({
    from: params.from,
    to: params.to,
  });

const withQuery = (path: string, query: string): string =>
  query ? `${path}?${query}` : path;

const CSV_EXPORT_FALLBACK = 'Failed to export API key usage';

/**
 * Turns a non-CSV payload (e.g. a JSON error envelope served with a 200) into
 * an Error carrying the server's message when one is available.
 */
const csvPayloadToError = (payload: unknown): Error => {
  if (payload && typeof payload === 'object' && 'message' in payload) {
    const message = (payload as { message?: unknown }).message;
    if (typeof message === 'string' && message) {
      return new Error(message);
    }
  }

  return new Error(CSV_EXPORT_FALLBACK);
};

export class ApiKeyUsageService {
  private authenticatedClient: ApiClient;

  constructor() {
    this.authenticatedClient = createAuthenticatedClient();
  }

  private async ensureAuthenticated() {
    await syncClientSessionToken(this.authenticatedClient);
  }

  // Top API keys (leaderboard / table)
  async getLeaderboard(
    params: ApiKeyUsageLeaderboardParams = {},
    signal?: AbortSignal
  ): Promise<ApiKeyUsageLeaderboardData> {
    await this.ensureAuthenticated();
    const url = withQuery(LEADERBOARD_PATH, buildLeaderboardQuery(params));
    const response = await this.authenticatedClient.get<
      ApiKeyUsageEnvelope<ApiKeyUsageLeaderboardData>
    >(url, { signal });

    return extractSuccessData(
      response.data,
      'Failed to get API key usage leaderboard'
    ).data;
  }

  // Usage over time (graph)
  async getTimeseries(
    params: ApiKeyUsageTimeseriesParams = {},
    signal?: AbortSignal
  ): Promise<ApiKeyUsageTimeseriesData> {
    await this.ensureAuthenticated();
    const url = withQuery(TIMESERIES_PATH, buildTimeseriesQuery(params));
    const response = await this.authenticatedClient.get<
      ApiKeyUsageEnvelope<ApiKeyUsageTimeseriesData>
    >(url, { signal });

    return extractSuccessData(
      response.data,
      'Failed to get API key usage timeseries'
    ).data;
  }

  // One key in detail (drill-down)
  async getDetail(
    clientId: string,
    params: ApiKeyUsageDetailParams = {},
    signal?: AbortSignal
  ): Promise<ApiKeyUsageDetailData> {
    await this.ensureAuthenticated();
    const url = withQuery(
      `${LEADERBOARD_PATH}/${encodeURIComponent(clientId)}`,
      buildDetailQuery(params)
    );
    const response = await this.authenticatedClient.get<
      ApiKeyUsageEnvelope<ApiKeyUsageDetailData>
    >(url, { signal });

    return extractSuccessData(
      response.data,
      'Failed to get API key usage details'
    ).data;
  }

  // CSV export of the leaderboard (up to 10,000 rows)
  async getLeaderboardCsv(
    params: ApiKeyUsageLeaderboardParams = {},
    signal?: AbortSignal
  ): Promise<string> {
    await this.ensureAuthenticated();
    // Same filters as the JSON leaderboard, with `format=csv` forced on.
    const leaderboardQuery = buildLeaderboardQuery(params);
    const url = `${LEADERBOARD_PATH}?${
      leaderboardQuery ? `${leaderboardQuery}&` : ''
    }format=csv`;

    const response = await this.authenticatedClient.get<unknown>(url, {
      responseType: 'text',
      headers: { Accept: 'text/csv' },
      signal,
      timeout: 60000,
    });

    const payload = response.data;

    if (typeof payload !== 'string') {
      // Not CSV at all — defensively surface the error envelope's message.
      throw csvPayloadToError(payload);
    }

    const trimmed = payload.trim();
    if (trimmed.startsWith('{')) {
      let parsed: unknown;
      try {
        parsed = JSON.parse(trimmed);
      } catch {
        throw new Error(CSV_EXPORT_FALLBACK);
      }

      const message = (parsed as { message?: unknown } | null)?.message;
      throw new Error(
        typeof message === 'string' && message ? message : CSV_EXPORT_FALLBACK
      );
    }

    return payload;
  }
}

export const apiKeyUsageService = new ApiKeyUsageService();
