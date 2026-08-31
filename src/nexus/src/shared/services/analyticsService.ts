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
  ComparisonReadingsResponse,
  ComparisonSiteReading,
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
 * (2026-08-21 -> 2026-08-23, staging-analytics AND production):
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
 * unknown fields), so the key set is negotiated at runtime:
 *
 * - Single-flight probe: on a fresh session the FIRST in-flight request
 *   doubles as the probe (primary keys; on a contract-specific rejection it
 *   retries ONCE with the alternate key set). Every concurrent request joins
 *   the shared negotiation promise and only sends AFTER the contract
 *   settles — no caller ever surfaces the probe's 400, no matter how many
 *   charts mount at once.
 * - Stale-contract re-probe: a persisted contract the CURRENT backend
 *   rejects is wiped (memory + localStorage) and re-negotiated ONCE with the
 *   alternate key set, again single-flight. Persisted contracts are treated
 *   as disposable hints, never authoritative.
 * - Bounded: at most TWO HTTP attempts per getChartData call, and the
 *   winning contract is persisted only on success (AGENTS.md retry policy:
 *   fail once, no unbounded retries). Aborted requests are never retried.
 */
export type ChartDateContract = 'startDateTime' | 'startDate';

const PRIMARY_CHART_DATE_CONTRACT: ChartDateContract = 'startDateTime';

/** localStorage key for the persisted contract — survives hard reloads. */
const CHART_DATE_CONTRACT_STORAGE_KEY = 'nexus:analytics:chart-date-contract';

const isChartDateContract = (value: unknown): value is ChartDateContract =>
  value === 'startDateTime' || value === 'startDate';

/**
 * Read the previously-negotiated contract from localStorage. Synchronous,
 * SSR-safe (returns undefined on the server), and tolerant of corrupt
 * entries: anything that isn't a known contract value is treated as a
 * fresh session and triggers the normal probe.
 */
const readPersistedChartDateContract = (): ChartDateContract | undefined => {
  if (typeof window === 'undefined') return undefined;
  try {
    const stored = window.localStorage.getItem(CHART_DATE_CONTRACT_STORAGE_KEY);
    return isChartDateContract(stored) ? stored : undefined;
  } catch {
    return undefined;
  }
};

/**
 * Persist the contract so the next page load skips the probe. Best-effort:
 * storage may be unavailable (private mode, disabled cookies, quota), but
 * the in-memory cache still keeps the session itself on the right keys.
 */
const writePersistedChartDateContract = (contract: ChartDateContract): void => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(CHART_DATE_CONTRACT_STORAGE_KEY, contract);
  } catch {
    // Storage unavailable — session-only cache still applies.
  }
};

/**
 * Module-scope cache, hydrated from localStorage on first import. The
 * persisted value is preferred so a hard reload does NOT pay a 400 to
 * re-probe a contract we already know.
 */
let negotiatedChartDateContract: ChartDateContract | undefined =
  readPersistedChartDateContract();

/**
 * A settled negotiation round: the winning contract plus the response that
 * proved it. `data` belongs to the request that RAN the probe — concurrent
 * callers joining the shared promise must discard it and send their own
 * request with `contract`.
 */
interface ChartContractNegotiation {
  contract: ChartDateContract;
  data: AnalyticsChartResponse;
}

/**
 * Single-flight negotiation handle (initial probe AND stale-contract
 * re-probe). Non-null while one probe is in flight; every concurrent
 * getChartData call awaits this instead of firing its own probe, so at most
 * ONE extra 400 is paid per round no matter how many charts mount at once.
 */
let chartContractNegotiation: Promise<ChartContractNegotiation> | null = null;

const rememberChartDateContract = (contract: ChartDateContract): void => {
  negotiatedChartDateContract = contract;
  writePersistedChartDateContract(contract);
};

/** Wipes the in-memory AND persisted contract (stale-contract recovery). */
const forgetChartDateContract = (): void => {
  negotiatedChartDateContract = undefined;
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(CHART_DATE_CONTRACT_STORAGE_KEY);
  } catch {
    // Storage unavailable — nothing to clear.
  }
};

/** Test hook: resets the session-scoped contract negotiation + storage. */
export const resetChartDateContract = (): void => {
  forgetChartDateContract();
};

/**
 * Registers an in-flight negotiation so concurrent requests can share it,
 * clearing the handle once the round settles — unless a newer round already
 * replaced it.
 */
const trackNegotiation = (
  negotiation: Promise<ChartContractNegotiation>
): Promise<ChartContractNegotiation> => {
  const tracked = negotiation.finally(() => {
    if (chartContractNegotiation === tracked) {
      chartContractNegotiation = null;
    }
  });
  chartContractNegotiation = tracked;
  return tracked;
};

/**
 * Pure decision helper: does this error body match a CONTRACT-SPECIFIC
 * rejection? Returns the contract to switch to, or null for anything else
 * (unrelated 400/422, network failure, ...). Exported for unit tests — no
 * network involved.
 *
 * Both rejection signatures are recognized so negotiation works in either
 * backend direction:
 * - legacy marshmallow body rejecting the `startDateTime`/`endDateTime`
 *   keys ("Unknown field") → switch to `startDate`;
 * - current-schema pydantic body reporting `startDateTime` as
 *   "Field required" (what a `startDate`-contract request gets from a
 *   CURRENT-schema backend) → switch to `startDateTime`.
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
  // Legacy signature: the primary keys are rejected as unknown while
  // startDate/endDate are reported missing. Require both key families so a
  // coincidental "Unknown field" elsewhere never flips us.
  if (
    text.includes('Unknown field') &&
    text.includes('endDateTime') &&
    text.includes('startDate')
  ) {
    return 'startDate';
  }
  // Mirror signature: a startDate-contract request against a CURRENT-schema
  // backend reports the now-missing startDateTime key as "Field required".
  if (text.includes('startDateTime') && text.includes('Field required')) {
    return 'startDateTime';
  }
  return null;
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

const CHART_DATA_PATH = '/analytics/dashboard/chart/d3/data';

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

  private postChartData(
    request: AnalyticsChartRequest,
    contract: ChartDateContract,
    signal?: AbortSignal
  ) {
    return this.serverClient.post<AnalyticsChartResponse>(
      CHART_DATA_PATH,
      buildChartPayload(request, contract),
      { signal }
    );
  }

  /**
   * Sends with a known contract; if the response is a CONTRACT-SPECIFIC
   * rejection (the backend flapped schemas since this contract was settled
   * or persisted), hands off to the bounded single-flight recovery.
   * Anything else — aborts, unrelated 400s, network errors — surfaces as-is.
   */
  private async sendWithContractRecovery(
    request: AnalyticsChartRequest,
    contract: ChartDateContract,
    signal?: AbortSignal
  ): Promise<AnalyticsChartResponse> {
    try {
      const response = await this.postChartData(request, contract, signal);
      return response.data;
    } catch (error) {
      // Aborted requests are never retried (AGENTS.md).
      if (isCancellation(error) || signal?.aborted) throw error;
      const alternate = chartContractToRetryForErrorBody(
        extractErrorResponseBody(error)
      );
      if (!alternate || alternate === contract) throw error;
      return this.recoverFromContractRejection(
        request,
        contract,
        alternate,
        error,
        signal
      );
    }
  }

  /**
   * Bounded recovery after a request was rejected by the very contract it
   * used. Wipes the stale contract from memory AND localStorage, then
   * retries ONCE with the alternate key set — joining an in-flight
   * negotiation when one exists so only ONE re-probe ever runs, no matter
   * how many concurrent requests failed at the same moment. If the
   * alternate attempt also fails, the ORIGINAL error is surfaced. At most
   * two HTTP attempts per call; never a loop.
   */
  private async recoverFromContractRejection(
    request: AnalyticsChartRequest,
    sentContract: ChartDateContract,
    alternate: ChartDateContract,
    originalError: unknown,
    signal?: AbortSignal
  ): Promise<AnalyticsChartResponse> {
    // A concurrent request may have renegotiated while ours was in flight —
    // adopt the freshly settled contract instead of wiping it.
    const settledNow = negotiatedChartDateContract;
    if (settledNow !== undefined && settledNow !== sentContract) {
      try {
        const response = await this.postChartData(request, settledNow, signal);
        return response.data;
      } catch (caught) {
        if (isCancellation(caught) || signal?.aborted) throw caught;
        throw originalError;
      }
    }

    forgetChartDateContract();

    // Single-flight re-probe: another request already owns it — await the
    // shared settlement and send with whatever contract won.
    if (chartContractNegotiation) {
      try {
        const { contract } = await chartContractNegotiation;
        const response = await this.postChartData(request, contract, signal);
        return response.data;
      } catch (caught) {
        if (isCancellation(caught) || signal?.aborted) throw caught;
        throw originalError;
      }
    }

    // We own the shared re-probe: ONE alternate attempt whose settlement is
    // shared with every concurrent caller.
    const negotiation = (async (): Promise<ChartContractNegotiation> => {
      try {
        const response = await this.postChartData(request, alternate, signal);
        rememberChartDateContract(alternate);
        return { contract: alternate, data: response.data };
      } catch (caught) {
        // Alternate failed too — surface the ORIGINAL error so the caller
        // sees the primary failure, not a secondary symptom. This rejection
        // also fails the shared promise; joiners surface their OWN original
        // errors. Fail once; never loop.
        // However, if the attempt was cancelled, propagate the cancellation
        // so AbortError never surfaces as a user failure (AGENTS.md).
        if (isCancellation(caught) || signal?.aborted) throw caught;
        throw originalError;
      }
    })();

    return (await trackNegotiation(negotiation)).data;
  }

  // Get chart data - direct backend call via API token
  async getChartData(
    request: AnalyticsChartRequest,
    signal?: AbortSignal
  ): Promise<AnalyticsChartResponse> {
    // Defensive guard: a request with missing/empty date strings is a
    // client bug — BOTH schemas (current + legacy) require the date keys to
    // carry a value. A draft that resolves to empty dates (corrupted
    // sidecar, draft-construction regression) would otherwise fire, get
    // 400'd, and burn the once-per-session retry on a request we already
    // know is malformed. Surface a clear error instead.
    if (!request.startDateTime?.trim() && !request.endDateTime?.trim()) {
      throw new Error('Chart data request is missing start and end dates.');
    }
    if (!request.startDateTime?.trim()) {
      throw new Error('Chart data request is missing a start date.');
    }
    if (!request.endDateTime?.trim()) {
      throw new Error('Chart data request is missing an end date.');
    }

    // Settled session: use the cached contract directly; a contract-specific
    // rejection triggers the bounded re-probe inside the sender.
    const settled = negotiatedChartDateContract;
    if (settled !== undefined) {
      return this.sendWithContractRecovery(request, settled, signal);
    }

    // Contract unknown — join any in-flight probe so concurrent chart
    // requests share ONE negotiation instead of each paying a 400. No
    // joiner ever surfaces the probe's 400.
    if (chartContractNegotiation) {
      let outcome: ChartContractNegotiation | null = null;
      try {
        outcome = await chartContractNegotiation;
      } catch {
        outcome = null; // shared probe failed — make our own bounded attempt
      }
      if (outcome) {
        return this.sendWithContractRecovery(request, outcome.contract, signal);
      }
      // Fall through: we are now the first requester of a fresh round.
    }

    // Fresh-session probe: this request's first attempt doubles as probe
    // step one (primary keys); on a contract-specific rejection it retries
    // ONCE with the alternate key set. The settlement is shared with every
    // caller that joined above; the winning contract is remembered only on
    // success.
    const negotiation = (async (): Promise<ChartContractNegotiation> => {
      try {
        const response = await this.postChartData(
          request,
          PRIMARY_CHART_DATE_CONTRACT,
          signal
        );
        rememberChartDateContract(PRIMARY_CHART_DATE_CONTRACT);
        return { contract: PRIMARY_CHART_DATE_CONTRACT, data: response.data };
      } catch (error) {
        if (isCancellation(error) || signal?.aborted) throw error;
        const alternate = chartContractToRetryForErrorBody(
          extractErrorResponseBody(error)
        );
        if (!alternate) throw error;
        try {
          const retried = await this.postChartData(request, alternate, signal);
          rememberChartDateContract(alternate);
          return { contract: alternate, data: retried.data };
        } catch (caught) {
          // The alternate contract failed too — surface the ORIGINAL error.
          // But if the alternate attempt itself was cancelled, propagate
          // the cancellation so AbortError never surfaces as a user failure.
          if (isCancellation(caught) || signal?.aborted) throw caught;
          throw error;
        }
      }
    })();

    return (await trackNegotiation(negotiation)).data;
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

  /**
   * Latest reading per site for the Comparison tab — POST
   * /devices/readings/comparisons.
   *
   * Mirrors `getRecentReadings` exactly: server client (API_TOKEN via the BFF),
   * empty input short-circuits to `[]` without a network call, `success: false`
   * throws a fixed safe message, aborted requests propagate as cancellations.
   */
  async getComparisonReadings(
    siteIds: string[],
    signal?: AbortSignal
  ): Promise<ComparisonSiteReading[]> {
    const trimmedSiteIds = siteIds.map(siteId => siteId.trim()).filter(Boolean);

    if (trimmedSiteIds.length === 0) {
      return [];
    }

    const response = await this.serverClient.post<ComparisonReadingsResponse>(
      '/devices/readings/comparisons',
      { site_ids: trimmedSiteIds },
      { signal }
    );

    const payload = response.data;
    if (!payload?.success) {
      throw new Error('Failed to fetch the latest readings.');
    }

    return Array.isArray(payload.readings) ? payload.readings : [];
  }
}

export const analyticsService = new AnalyticsService();
