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

/**
 * Frequencies the chart-data endpoint accepts.
 *
 * Empirically confirmed live (2026-08-22, staging-analytics): `raw` is
 * rejected with 400 "No data source configured for datatype=calibrated,
 * device_category=lowcost, frequency=raw" while hourly/daily/weekly/monthly
 * all return 200. `FrequencyType` still legally contains 'raw' (the UI uses
 * it for rendering decisions), so the request boundary maps it to `daily`
 * — the same fallback the analytics module's normalizeFrequency applies to
 * persisted drafts. Kept local to this shared service: shared code must not
 * import from modules.
 */
const CHART_API_FREQUENCIES: ReadonlySet<string> = new Set([
  'hourly',
  'daily',
  'weekly',
  'monthly',
]);

export const normalizeChartApiFrequency = (value: string): string =>
  CHART_API_FREQUENCIES.has(value) ? value : 'daily';

/**
 * Date-key contract negotiation for the chart-data endpoint.
 *
 * The live backend has been observed speaking TWO schemas for the same URL
 * (2026-08-21 -> 2026-08-23, staging-analytics):
 *
 * - Current schema: requires `startDateTime` / `endDateTime` (pydantic-style
 *   errors: `{"errors":[{"loc":["body","startDateTime"],"msg":"Field
 *   required"}]}`) and IGNORES unknown keys.
 * - Legacy schema: REQUIRES `startDate` / `endDate` and rejects the other
 *   pair with marshmallow-style errors:
 *   `{"errors":{"startDate":["Missing data for required field."],
 *   "endDateTime":["Unknown field."],"startDateTime":["Unknown field."]}}`.
 *
 * No request body satisfies both schemas at once (the legacy one rejects
 * unknown fields), so on the FIRST chart request of a browser session the
 * primary key set is sent; if the response body matches the legacy rejection
 * signature, the request is retried ONCE with the alternate key set and the
 * winning contract is cached in module scope. Subsequent requests use the
 * cached contract directly — at most ONE extra request per session, never a
 * loop (AGENTS.md retry policy: fail once, no unbounded retries).
 */
export type ChartDateContract = 'startDateTime' | 'startDate';

const PRIMARY_CHART_DATE_CONTRACT: ChartDateContract = 'startDateTime';

/** Module-scope cache: undefined = not negotiated yet this session. */
let negotiatedChartDateContract: ChartDateContract | undefined;

/** Test hook: resets the session-scoped contract negotiation. */
export const resetChartDateContract = (): void => {
  negotiatedChartDateContract = undefined;
};

/**
 * Pure decision helper: does this error body match the LEGACY contract's
 * rejection of `startDateTime`/`endDateTime`? Returns the contract to switch
 * to, or null for anything else (unrelated 400/422, network failure,
 * new-schema validation, ...). Exported for unit tests — no network involved.
 */
export const chartContractToRetryForErrorBody = (
  body: unknown
): ChartDateContract | null => {
  if (!body) return null;
  let text: string;
  try {
    text = typeof body === 'string' ? body : JSON.stringify(body);
  } catch {
    return null;
  }
  if (!text.includes('Unknown field')) return null;
  // The observed legacy body lists all four keys: startDate/endDate missing
  // plus startDateTime/endDateTime unknown. Require both pairs before
  // switching so a coincidental "Unknown field" elsewhere never flips us.
  if (!text.includes('startDateTime') || !text.includes('startDate')) {
    return null;
  }
  return 'startDate';
};

/** Extracts the HTTP response body from an axios-like rejected error. */
const extractErrorResponseBody = (error: unknown): unknown => {
  const candidate = error as { response?: { data?: unknown } } | null;
  return candidate?.response?.data;
};

const isCancellation = (error: unknown): boolean => {
  const candidate = error as { name?: string; code?: string } | null;
  return (
    candidate?.name === 'AbortError' ||
    candidate?.name === 'CanceledError' ||
    candidate?.code === 'ERR_CANCELED'
  );
};

/**
 * Builds the POST body for the given date-key contract. Only the date KEYS
 * change — every other field is identical, values stay YYYY-MM-DD (accepted
 * by both schemas) and frequency stays normalized.
 */
const buildChartPayload = (
  request: AnalyticsChartRequest,
  contract: ChartDateContract
): Record<string, unknown> => {
  const { startDateTime, endDateTime, ...rest } = request;
  const start = toDateString(startDateTime);
  const end = toDateString(endDateTime);
  return contract === PRIMARY_CHART_DATE_CONTRACT
    ? {
        ...rest,
        startDateTime: start,
        endDateTime: end,
        frequency: normalizeChartApiFrequency(request.frequency),
      }
    : {
        ...rest,
        startDate: start,
        endDate: end,
        frequency: normalizeChartApiFrequency(request.frequency),
      };
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
    const CHART_DATA_PATH = '/analytics/dashboard/chart/d3/data';
    const contract = negotiatedChartDateContract ?? PRIMARY_CHART_DATE_CONTRACT;

    try {
      const response = await this.serverClient.post<AnalyticsChartResponse>(
        CHART_DATA_PATH,
        buildChartPayload(request, contract),
        { signal }
      );
      negotiatedChartDateContract = contract;
      return response.data;
    } catch (error) {
      // Aborted requests are never retried (AGENTS.md). Negotiation only
      // runs while the contract is unknown and ONLY on the legacy schema's
      // exact rejection signature — anything else surfaces to the caller.
      if (
        negotiatedChartDateContract !== undefined ||
        isCancellation(error) ||
        signal?.aborted
      ) {
        throw error;
      }

      const retryContract = chartContractToRetryForErrorBody(
        extractErrorResponseBody(error)
      );
      if (!retryContract) {
        throw error;
      }

      negotiatedChartDateContract = retryContract;
      try {
        const response = await this.serverClient.post<AnalyticsChartResponse>(
          CHART_DATA_PATH,
          buildChartPayload(request, retryContract),
          { signal }
        );
        return response.data;
      } catch {
        // The alternate contract failed too — surface the ORIGINAL error so
        // the caller sees the primary failure, not a secondary symptom.
        // Fail once; never loop.
        throw error;
      }
    }
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
