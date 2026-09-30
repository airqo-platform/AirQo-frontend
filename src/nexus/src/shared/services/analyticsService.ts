import { ApiClient, createServerClient } from './apiClient';
import { isAbortError } from '../lib/retryPolicy';
import {
  buildReportWindows,
  countWindowDays,
  getWindowDateParts,
  MAX_REPORT_RANGE_DAYS,
  mergeReportWindows,
  splitReportWindow,
} from './utils/reportWindows';
import type {
  AnalyticsChartRequest,
  AnalyticsChartResponse,
  AnalyticsReport,
  AnalyticsReportPeriod,
  AnalyticsReportRequest,
  AnalyticsReportResponse,
  ComparisonReadingsResponse,
  ComparisonSiteReading,
  DataDownloadRequest,
  DataDownloadResponse,
  RecentReadingsResponse,
  RecentReading,
} from '../types/api';

const CHART_DATA_PATH = '/analytics/dashboard/chart/data';
const DATA_DOWNLOAD_PATH = '/analytics/data-download';
const REPORT_PATH = '/analytics/report';
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const MAX_CHART_PAGES = 1_000;
const MAX_DOWNLOAD_PAGES = 1_000;

// Report adaptive-fetch constants. Per-window retry policy is bounded: at most
// `REPORT_429_MAX_ATTEMPTS` 429 attempts for a single window and a hard cap on
// total network POSTs — counted per request actually sent, never per loop
// iteration — so pathological windows can't loop indefinitely. The cap is
// derived from the requested range (see `getReportMaxAttempts`) instead of a
// fixed constant, so worst-case splitting of any supported range always fits
// below it.
const REPORT_429_RETRY_DELAY_MS = 5_000;
const REPORT_429_MAX_ATTEMPTS = 2;
const REPORT_MIN_MAX_ATTEMPTS = 24;

// The analytics service rate-limits every route to 10 requests / 60 s per
// client IP, and isolating a rejected month can need ~50 windows. Sequential
// execution alone does not stay under that ceiling (a rejected window answers
// in ~200 ms), so every report POST is spaced out instead.
const REPORT_RATE_LIMIT_MAX = 10;
const REPORT_RATE_LIMIT_WINDOW_MS = 60_000;
const REPORT_MIN_SPACING_MS = 6_000;

// Windowing constants for the report route: `REPORT_WINDOW_DAYS` is the
// per-request safe window and `MAX_REPORT_RANGE_DAYS` the overall cap for a
// single report view. Re-exported so consumers (and tests) share one source
// of truth with `buildReportWindows`.
export {
  REPORT_WINDOW_DAYS,
  MAX_REPORT_RANGE_DAYS,
} from './utils/reportWindows';

/**
 * Keep the legacy date-only helper for cache keys, filenames and callers that
 * need a calendar date. The API wire payload is built with `toApiDateTime`
 * below because the staging routers require ISO-8601 datetimes.
 */
export const toDateString = (value: string): string => {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  return value.slice(0, 10);
};

/** Return the ISO-8601 wire value required by the analytics routers. */
const toApiDateTime = (value: string, endOfDay = false): string => {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return `${trimmed}T${endOfDay ? '23:59:59.999' : '00:00:00.000'}Z`;
  }
  return trimmed;
};

const CHART_API_FREQUENCIES: ReadonlySet<string> = new Set([
  'raw',
  'hourly',
  'daily',
  'weekly',
  'monthly',
  'yearly',
]);

const CHART_API_TYPES: ReadonlySet<string> = new Set(['line', 'pie', 'bar']);

export const normalizeChartApiFrequency = (value: string): string =>
  CHART_API_FREQUENCIES.has(value.toLowerCase())
    ? value.toLowerCase()
    : 'daily';

export const normalizeChartApiType = (
  value: string
): 'line' | 'pie' | 'bar' => {
  const normalized = value.trim().toLowerCase();
  return CHART_API_TYPES.has(normalized)
    ? (normalized as 'line' | 'pie' | 'bar')
    : 'line';
};

export const buildReportPayload = (
  request: AnalyticsReportRequest
): AnalyticsReportRequest => {
  const cohortId = String(request.cohort_id ?? '').trim();
  const startTime = toApiDateTime(String(request.start_time ?? ''));
  const endTime = toApiDateTime(String(request.end_time ?? ''), true);
  const startMs = Date.parse(startTime);
  const endMs = Date.parse(endTime);

  if (!cohortId) {
    throw new Error('A cohort is required to load an organization report.');
  }
  if (
    !startTime ||
    !endTime ||
    !Number.isFinite(startMs) ||
    !Number.isFinite(endMs)
  ) {
    throw new Error('Choose a valid report date range.');
  }
  if (endMs <= startMs) {
    throw new Error('The report end date must be after the start date.');
  }
  if (startMs > Date.now()) {
    throw new Error('The report start date cannot be in the future.');
  }
  // Count UTC calendar dates so the cap matches the window splitting below.
  const rangeDays =
    Math.floor(endMs / MS_PER_DAY) - Math.floor(startMs / MS_PER_DAY) + 1;
  if (rangeDays > MAX_REPORT_RANGE_DAYS) {
    throw new Error(
      `The report period cannot exceed ${MAX_REPORT_RANGE_DAYS} days.`
    );
  }

  return {
    cohort_id: cohortId,
    start_time: startTime,
    end_time: endTime,
  };
};

/**
 * Hard cap on network POSTs for a single `getReport` call, derived from the
 * requested range rather than a fixed constant. Fully splitting a D-day range
 * down to 1-day windows issues at most `2 * D - 1` POSTs (one per split node
 * plus one per leaf) and only one 429 retry is ever allowed, so `2 * D + 8`
 * always leaves headroom for the worst case. `REPORT_MIN_MAX_ATTEMPTS` keeps
 * the backstop sane for very short ranges. Skipped known-bad-month windows
 * are never POSTed and therefore never count against the cap.
 */
export const getReportMaxAttempts = (request: AnalyticsReportRequest): number =>
  Math.max(REPORT_MIN_MAX_ATTEMPTS, 2 * countWindowDays(request) + 8);

const getReportErrorMessage = (error: unknown): string => {
  const candidate = error as {
    response?: { status?: number };
    status?: number;
  } | null;
  const status = candidate?.response?.status ?? candidate?.status;

  if (status === 400) {
    return 'The report service could not process that date range. Choose a range of 27 days or fewer.';
  }
  if (status === 404) {
    return 'This cohort is no longer available for reporting.';
  }
  if (status === 422) {
    return 'Choose a valid cohort and date range to load the report.';
  }
  if (status === 429) {
    return 'The report service is busy. Wait a moment and try again.';
  }
  if (status === 401 || status === 403) {
    return 'You do not have permission to view this organization report.';
  }
  return 'The organization report is temporarily unavailable. Try again shortly.';
};

const createReportError = (error: unknown): Error =>
  Object.defineProperty(new Error(getReportErrorMessage(error)), 'cause', {
    value: error,
    enumerable: false,
    configurable: true,
    writable: true,
  });

/**
 * Error to surface when the caller aborts while `getReport` is waiting out a
 * 429 retry delay. Prefers the signal's own `reason` when it is already
 * abort-shaped so callers keep seeing the original cancellation; otherwise
 * synthesizes an `AbortError` that `isAbortError` recognises — the wrapped
 * 429 must never surface as the failure once the signal has fired.
 */
const abortErrorFor = (signal?: AbortSignal): unknown => {
  const reason = (signal as { reason?: unknown } | undefined)?.reason;
  if (isAbortError(reason)) return reason;
  const error = new Error('The report request was aborted.');
  error.name = 'AbortError';
  return error;
};

/**
 * Abort-aware delay for the bounded 429 retry: resolves after `ms`, or
 * rejects immediately with an abort error when `signal` fires during the wait
 * (or was already aborted), so `isAbortError` sees a cancellation instead of
 * the original 429.
 */
const delayWithAbort = (ms: number, signal?: AbortSignal): Promise<void> =>
  new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(abortErrorFor(signal));
      return;
    }
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    const onAbort = (): void => {
      clearTimeout(timer);
      reject(abortErrorFor(signal));
    };
    signal?.addEventListener('abort', onAbort, { once: true });
  });

/**
 * Rethrow `error` when it is a cancellation. When the caller's signal fired
 * instead (the failure raced the abort), throw an abort-shaped error so the
 * caller never sees the wrapped HTTP failure — e.g. a 429 — as if it were
 * the real outcome.
 */
const rethrowCancellation = (error: unknown, signal?: AbortSignal): void => {
  if (isAbortError(error)) throw error;
  if (signal?.aborted) throw abortErrorFor(signal);
};

/**
 * Result of one windowed report POST. `split` means the backend rejected the
 * window's range and the caller should halve it; `rate-limited` means the
 * window exhausted its 429 retries and should be recorded as unavailable.
 */
type ReportWindowOutcome =
  | { kind: 'success'; report: AnalyticsReport }
  | { kind: 'split' }
  | { kind: 'rate-limited' };

/**
 * Sliding-window gate for report POSTs: at most `REPORT_RATE_LIMIT_MAX`
 * requests per `REPORT_RATE_LIMIT_WINDOW_MS`, and never closer together than
 * `REPORT_MIN_SPACING_MS`. Module-level because the limit is enforced by the
 * analytics service per client, so every caller on this origin shares it.
 */
const reportRequestTimestamps: number[] = [];

/**
 * Spacing between report POSTs. Held in a mutable record so tests can drop it
 * to zero and exercise the adaptive loop without real delays; production code
 * never reassigns it.
 */
const reportPacing = {
  minSpacingMs: REPORT_MIN_SPACING_MS,
  windowMs: REPORT_RATE_LIMIT_WINDOW_MS,
  maxRequests: REPORT_RATE_LIMIT_MAX,
};

export const resetReportRateLimiter = (): void => {
  reportRequestTimestamps.length = 0;
};

/** Test-only: override report pacing and clear any reserved slots. */
export const setReportPacingForTests = (overrides: {
  minSpacingMs?: number;
  windowMs?: number;
  maxRequests?: number;
}): void => {
  if (typeof overrides.minSpacingMs === 'number') {
    reportPacing.minSpacingMs = overrides.minSpacingMs;
  }
  if (typeof overrides.windowMs === 'number') {
    reportPacing.windowMs = overrides.windowMs;
  }
  if (typeof overrides.maxRequests === 'number') {
    reportPacing.maxRequests = overrides.maxRequests;
  }
  resetReportRateLimiter();
};

const reserveReportRequestSlot = async (
  signal?: AbortSignal
): Promise<void> => {
  for (;;) {
    const now = Date.now();
    while (
      reportRequestTimestamps.length > 0 &&
      now - reportRequestTimestamps[0] >= reportPacing.windowMs
    ) {
      reportRequestTimestamps.shift();
    }

    // Two independent ceilings: the sliding window caps how many requests fit
    // in `windowMs` (using the oldest entry), while the minimum spacing is
    // measured from the most recent reservation — otherwise, once `minSpacingMs`
    // had elapsed since the first request, later ones would go unspaced.
    const windowFull =
      reportRequestTimestamps.length >= reportPacing.maxRequests;
    const newest = reportRequestTimestamps[reportRequestTimestamps.length - 1];
    const spacingWait =
      newest === undefined
        ? 0
        : Math.max(0, newest + reportPacing.minSpacingMs - now);

    if (!windowFull && spacingWait === 0) {
      reportRequestTimestamps.push(now);
      return;
    }

    await delayWithAbort(
      windowFull ? reportPacing.windowMs : spacingWait,
      signal
    );
  }
};

/**
 * `Retry-After` may be a delay in seconds or an HTTP date. Returns the delay
 * in ms, or null when absent/unparseable so the caller falls back to its own.
 */
const readRetryAfterMs = (error: unknown): number | null => {
  const header = (
    error as { response?: { headers?: Record<string, unknown> } } | null
  )?.response?.headers?.['retry-after'];
  if (typeof header !== 'string' || !header.trim()) return null;

  const seconds = Number(header);
  if (Number.isFinite(seconds) && seconds >= 0) {
    return Math.min(seconds * 1_000, reportPacing.windowMs);
  }
  const retryAt = Date.parse(header);
  if (Number.isFinite(retryAt)) {
    return Math.min(Math.max(0, retryAt - Date.now()), reportPacing.windowMs);
  }
  return null;
};

/** Translate app chart filters to the current v2 analytics wire contract. */
export const buildChartPayload = (
  request: AnalyticsChartRequest
): Record<string, unknown> => {
  const pollutants = Array.from(
    new Set(
      request.pollutants.filter((value): value is string => Boolean(value))
    )
  );
  // Chart consumers need site identity to resolve backend display names,
  // especially for categorical pie rows.
  const metaDataFields = Array.from(
    new Set(['site_id', ...(request.metaDataFields ?? [])])
  );

  return {
    sites: request.sites,
    startDateTime: toApiDateTime(request.startDateTime),
    endDateTime: toApiDateTime(request.endDateTime, true),
    chartType: normalizeChartApiType(request.chartType),
    frequency: normalizeChartApiFrequency(request.frequency),
    pollutants,
    metaDataFields,
    ...(request.organisationName
      ? { organisationName: request.organisationName }
      : {}),
    ...(request.cursor?.trim() ? { cursor: request.cursor.trim() } : {}),
  };
};

const getNextChartCursor = (
  response: AnalyticsChartResponse,
  seenCursors: Set<string>
): string | null => {
  if (!response.metadata?.has_more) return null;

  const nextCursor = response.metadata.next?.trim();
  if (!nextCursor) {
    throw new Error(
      'The chart data service reported more records but did not provide a next cursor.'
    );
  }
  if (seenCursors.has(nextCursor)) {
    throw new Error(
      'The chart data service returned a repeated pagination cursor.'
    );
  }

  seenCursors.add(nextCursor);
  return nextCursor;
};

const getNextCursor = (
  response: DataDownloadResponse,
  seenCursors: Set<string>
): string | null => {
  if (!response.metadata?.has_more) return null;

  const nextCursor = response.metadata.next?.trim();
  if (!nextCursor) {
    throw new Error(
      'The data service reported more records but did not provide a next cursor.'
    );
  }
  if (seenCursors.has(nextCursor)) {
    throw new Error('The data service returned a repeated pagination cursor.');
  }

  seenCursors.add(nextCursor);
  return nextCursor;
};

export class AnalyticsService {
  private serverClient: ApiClient;

  constructor() {
    this.serverClient = createServerClient();
  }

  async getChartData(
    request: AnalyticsChartRequest,
    signal?: AbortSignal
  ): Promise<AnalyticsChartResponse> {
    if (!request.startDateTime?.trim() && !request.endDateTime?.trim()) {
      throw new Error('Chart data request is missing start and end dates.');
    }
    if (!request.startDateTime?.trim()) {
      throw new Error('Chart data request is missing a start date.');
    }
    if (!request.endDateTime?.trim()) {
      throw new Error('Chart data request is missing an end date.');
    }

    const requestedCursor = request.cursor?.trim();
    const seenCursors = new Set<string>();
    if (requestedCursor) seenCursors.add(requestedCursor);

    let cursor = requestedCursor || null;
    let firstPage: AnalyticsChartResponse | null = null;
    const allData: AnalyticsChartResponse['data'] = [];

    for (let page = 0; page < MAX_CHART_PAGES; page += 1) {
      const pageRequest = cursor
        ? { ...request, cursor }
        : { ...request, cursor: undefined };
      const response = await this.serverClient.post<AnalyticsChartResponse>(
        CHART_DATA_PATH,
        buildChartPayload(pageRequest),
        { signal }
      );
      const pageBody = response.data;
      firstPage ??= pageBody;
      allData.push(...pageBody.data);

      cursor = getNextChartCursor(pageBody, seenCursors);
      if (!cursor) {
        if (page === 0) return pageBody;

        return {
          ...firstPage,
          data: allData,
          metadata: {
            total_count: allData.length,
            has_more: false,
            next: null,
          },
        };
      }
    }

    throw new Error(
      `Chart data exceeded the ${MAX_CHART_PAGES}-page safety limit.`
    );
  }

  /**
   * POST a single report window, pacing the request and applying the bounded
   * per-window 429 policy. Returns the outcome so the caller can decide
   * between splitting, recording the window as unavailable, or collecting the
   * report. Every non-recoverable error (401/403/404/5xx/abort) throws, and so
   * does a response without a successful `airquality` payload.
   */
  private async postReportWindow(
    window: AnalyticsReportRequest,
    signal: AbortSignal | undefined,
    onAttempt: () => void
  ): Promise<ReportWindowOutcome> {
    for (let attempt = 1; attempt <= REPORT_429_MAX_ATTEMPTS; attempt += 1) {
      await reserveReportRequestSlot(signal);

      try {
        onAttempt();
        const response = await this.serverClient.post<AnalyticsReportResponse>(
          REPORT_PATH,
          window,
          { signal, suppressErrorLogging: true }
        );
        const report = response.data?.airquality;
        if (!report || report.status !== 'success') {
          throw createReportError(new Error('Invalid report response.'));
        }
        return { kind: 'success', report };
      } catch (error) {
        rethrowCancellation(error, signal);

        const status =
          (error as { response?: { status?: number } } | null)?.response
            ?.status ?? (error as { status?: number } | null)?.status;

        // 400/422 is a splittable range error, on the first try or on a retry:
        // let the caller split instead of failing the whole report.
        if (status === 400 || status === 422) {
          return { kind: 'split' };
        }

        if (status === 429) {
          // Bounded per-window retry. Exhausting it makes this window
          // unavailable rather than discarding the windows that succeeded.
          if (attempt >= REPORT_429_MAX_ATTEMPTS) {
            return { kind: 'rate-limited' };
          }
          // Honour `Retry-After` when the analytics service sends it. The
          // wait races the abort signal, so cancelling during it surfaces as
          // an abort rather than a wrapped 429.
          await delayWithAbort(
            readRetryAfterMs(error) ?? REPORT_429_RETRY_DELAY_MS,
            signal
          );
          continue;
        }

        throw createReportError(error);
      }
    }

    return { kind: 'rate-limited' };
  }

  /**
   * Fetch the cohort report for the requested period. The backend enforces a
   * per-request window (27 UTC calendar dates on staging), and separately
   * rejects some month-crossing and bad-month ranges (verified live: May &
   * Aug 2026 always fail, Jun→Jul boundary fails). So this is an adaptive
   * loop rather than a fire-and-merge `Promise.all`:
   *
   * 1. Queue the initial ≤27-day windows.
   * 2. For each window: skip it when it lies entirely inside a known-bad month
   *    (`failedMonths`); POST it through `postReportWindow`; on success collect
   *    it.
   * 3. On a splittable failure (HTTP 400 / 422), split via `splitReportWindow`
   *    and push the parts to the front of the queue (depth-first). A 1-day
   *    window that fails as splittable is terminal — record its month as bad
   *    and mark the period unavailable.
   * 4. HTTP 429 is retried per window by `postReportWindow`; when a window
   *    exhausts its retries it is recorded as unavailable so already-fetched
   *    windows still render. Any other error (401/403/404/5xx/abort) throws
   *    immediately.
   * 5. If nothing succeeded, throw. Otherwise merge the successful reports
   *    with the `unavailablePeriods` list (possibly empty).
   *
   * Requests are paced to the analytics service's 10 req/60 s per-route limit
   * rather than relying on sequential execution, which a fast 400 would
   * otherwise outrun. `getReportMaxAttempts` bounds the network POSTs (skipped
   * windows never count); when the cap is hit every window still queued is
   * recorded as unavailable so none is silently dropped.
   */
  async getReport(
    request: AnalyticsReportRequest,
    signal?: AbortSignal
  ): Promise<AnalyticsReport> {
    const payload = buildReportPayload(request);
    const queue = buildReportWindows(payload);
    const maxAttempts = getReportMaxAttempts(payload);

    const successful: AnalyticsReport[] = [];
    const unavailable: AnalyticsReportPeriod[] = [];
    const failedMonths = new Set<string>();
    // Counted per network POST actually sent (the 429 retry counts too);
    // skipped and queued windows never increment it.
    let attempts = 0;

    const monthKeyOf = (datePart: string): string => datePart.slice(0, 7);

    while (queue.length > 0) {
      if (attempts >= maxAttempts) {
        // POST cap reached: record every window still queued as unavailable
        // so nothing is silently lost, while keeping the windows that already
        // succeeded. If nothing succeeded, the post-loop check throws.
        while (queue.length > 0) {
          const leftover = queue.shift()!;
          unavailable.push({
            startTime: String(leftover.start_time ?? '').trim(),
            endTime: String(leftover.end_time ?? '').trim(),
          });
        }
        break;
      }

      const window = queue.shift()!;
      const { startDate, endDate } = getWindowDateParts(window);
      const startMonth = monthKeyOf(startDate);
      const endMonth = monthKeyOf(endDate);

      // Skip windows entirely inside a known-bad month.
      if (startMonth === endMonth && failedMonths.has(startMonth)) {
        unavailable.push({
          startTime: String(window.start_time ?? '').trim(),
          endTime: String(window.end_time ?? '').trim(),
        });
        continue;
      }

      const outcome = await this.postReportWindow(window, signal, () => {
        attempts += 1;
      });

      if (outcome.kind === 'success') {
        successful.push(outcome.report);
        continue;
      }

      if (outcome.kind === 'rate-limited') {
        // Retries exhausted for this window. Record it and keep the windows
        // that already succeeded instead of discarding the whole report.
        unavailable.push({
          startTime: String(window.start_time ?? '').trim(),
          endTime: String(window.end_time ?? '').trim(),
        });
        continue;
      }

      // Splittable range error (400/422): split the window and push the parts
      // to the front of the queue (depth-first). A 1-day window that fails as
      // splittable is terminal — record its month as bad and mark the period
      // unavailable.
      const parts = splitReportWindow(window);
      if (!parts) {
        const { startDate: winStart } = getWindowDateParts(window);
        const winMonth = winStart.slice(0, 7);
        if (winMonth) failedMonths.add(winMonth);
        unavailable.push({
          startTime: String(window.start_time ?? '').trim(),
          endTime: String(window.end_time ?? '').trim(),
        });
      } else {
        queue.unshift(...parts);
      }
    }

    if (successful.length === 0) {
      throw createReportError(
        new Error(
          'The report service could not return data for any period in the selected range.'
        )
      );
    }

    // Single successful window and nothing unavailable: fast path.
    if (successful.length === 1 && unavailable.length === 0) {
      return successful[0];
    }

    return mergeReportWindows(successful, payload, unavailable);
  }

  /**
   * Fetch every cursor page from the synchronous data-download endpoint.
   * JSON is requested internally because its body carries pagination metadata;
   * the existing file builders render the combined records in the user's
   * selected output format afterwards.
   */
  async downloadData(
    request: DataDownloadRequest,
    signal?: AbortSignal
  ): Promise<DataDownloadResponse | string> {
    const requestedCursor = request.cursor?.trim();
    const seenCursors = new Set<string>();
    if (requestedCursor) seenCursors.add(requestedCursor);

    let cursor = requestedCursor || null;
    let firstPage: DataDownloadResponse | null = null;
    const allRecords: DataDownloadResponse['data'] = [];

    for (let page = 0; page < MAX_DOWNLOAD_PAGES; page += 1) {
      const payload: DataDownloadRequest = {
        ...request,
        downloadType: 'json',
        ...(cursor ? { cursor } : {}),
      };
      if (!cursor) delete payload.cursor;

      const response = await this.serverClient.post<
        DataDownloadResponse | string
      >(DATA_DOWNLOAD_PATH, payload, { signal });

      // Compatibility with an older deployment that may ignore downloadType.
      if (typeof response.data === 'string') return response.data;

      const pageBody = response.data;
      firstPage ??= pageBody;
      if (Array.isArray(pageBody.data)) allRecords.push(...pageBody.data);

      cursor = getNextCursor(pageBody, seenCursors);
      if (!cursor) {
        return {
          ...firstPage,
          data: allRecords,
          metadata: {
            total_count: allRecords.length,
            has_more: false,
            next: null,
          },
        };
      }
    }

    throw new Error(
      `Data download exceeded the ${MAX_DOWNLOAD_PAGES}-page safety limit.`
    );
  }

  async getRecentReadings(
    siteIds: string[],
    signal?: AbortSignal
  ): Promise<RecentReading[]> {
    const trimmedSiteIds = siteIds.map(siteId => siteId.trim()).filter(Boolean);
    if (trimmedSiteIds.length === 0) return [];

    let response;
    try {
      response = await this.serverClient.post<RecentReadingsResponse>(
        '/devices/readings/recent',
        { site_ids: trimmedSiteIds },
        { signal }
      );
    } catch (error) {
      if (isAbortError(error) || signal?.aborted) throw error;

      throw Object.defineProperty(
        new Error('Failed to fetch the latest readings.'),
        'cause',
        { value: error, enumerable: false, configurable: true, writable: true }
      );
    }

    const payload = response.data;
    if (!payload?.success) {
      throw new Error('Failed to fetch the latest readings.');
    }

    return Array.isArray(payload.measurements) ? payload.measurements : [];
  }

  async getComparisonReadings(
    siteIds: string[],
    signal?: AbortSignal
  ): Promise<ComparisonSiteReading[]> {
    const trimmedSiteIds = siteIds.map(siteId => siteId.trim()).filter(Boolean);
    if (trimmedSiteIds.length === 0) return [];

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
