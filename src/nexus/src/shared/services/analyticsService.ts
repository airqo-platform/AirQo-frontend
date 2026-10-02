import { ApiClient, createServerClient } from './apiClient';
import { isAbortError } from '../lib/retryPolicy';
import {
  buildReportWindows,
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
// `REPORT_429_MAX_ATTEMPTS` 429 attempts for a single window, at most
// `REPORT_MAX_SPLIT_DEPTH` halvings of a rejected window, and a hard ceiling
// on total network POSTs (`REPORT_MAX_POSTS`) — counted per request actually
// sent, never per loop iteration — so pathological windows can neither loop
// indefinitely nor turn one selection into a request storm.
const REPORT_429_RETRY_DELAY_MS = 5_000;
const REPORT_429_MAX_ATTEMPTS = 2;

// The analytics service rate-limits every route to 10 requests / 60 s per
// client IP, and sequential execution alone does not stay under that ceiling
// (a rejected window answers in ~200 ms), so every report POST is spaced out
// instead. Spacing only guards the ceiling — it is not a licence to send
// dozens of requests, which is why the POST count is capped above.
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
 * Hard ceiling on network POSTs for a single `getReport` call.
 *
 * A small absolute number, not a function of the range. The report view caps a
 * period at 31 days, so a request starts as at most two `REPORT_WINDOW_DAYS`
 * windows; with `REPORT_MAX_SPLIT_DEPTH` halvings and one 429 retry per window
 * the worst case is 12 POSTs.
 *
 * The previous `2 * D + 8` formula existed so a full binary split down to 1-day
 * leaves would always fit, which turned one rejected date selection into ~60
 * paced POSTs at 31 days and ~183 at the 92-day service cap — minutes of
 * requests that also tripped the backend's own 10 req/60 s limit and piled 429
 * retries on top. Splitting is a bounded fallback, not a brute-force search, so
 * the cap has to be a real ceiling.
 *
 * Windows still queued when the cap is hit are recorded as unavailable so
 * nothing is silently dropped.
 */
export const REPORT_MAX_POSTS = 12;

/**
 * How many times a rejected window may be halved before it is written off.
 * One halving is enough to tell "this range is too wide" (both halves succeed)
 * apart from "this month has no usable data" (both halves still fail). Going
 * deeper only multiplies requests without changing the outcome.
 */
export const REPORT_MAX_SPLIT_DEPTH = 1;

/**
 * Longest server-supplied message accepted for display. The report service
 * answers with short human sentences ("The requested date range is too wide.
 * Shorten the date range."), so this only ever trims a pathological payload
 * rather than shaping normal ones.
 */
const MAX_SERVER_MESSAGE_LENGTH = 300;

/**
 * The report service's own explanation from a failed response body, or `null`.
 *
 * The backend rejects a bad range with a message written for the person looking
 * at the screen, and discarding it in favour of our own generic copy leaves the
 * user with "temporarily unavailable" and no idea what to change. Only a string
 * field on a JSON object is read, so an HTML error page from a proxy or gateway
 * cannot leak through as a message.
 */
const readServerMessage = (error: unknown): string | null => {
  const body = (error as { response?: { data?: unknown } } | null)?.response
    ?.data;
  if (!body || typeof body !== 'object') return null;

  const fields = body as { message?: unknown; error?: unknown };
  const raw =
    typeof fields.message === 'string'
      ? fields.message
      : typeof fields.error === 'string'
        ? fields.error
        : null;
  if (!raw) return null;

  const trimmed = raw.trim();
  if (!trimmed) return null;
  return trimmed.length > MAX_SERVER_MESSAGE_LENGTH
    ? `${trimmed.slice(0, MAX_SERVER_MESSAGE_LENGTH - 1).trimEnd()}…`
    : trimmed;
};

const getReportErrorMessage = (error: unknown): string => {
  const candidate = error as {
    response?: { status?: number };
    status?: number;
  } | null;
  const status = candidate?.response?.status ?? candidate?.status;

  // Auth failures keep our own copy: the server's text is not written for this
  // screen, and there is no reason to echo anything auth-related back.
  if (status === 401 || status === 403) {
    return 'You do not have permission to view this organization report.';
  }
  if (status === 404) {
    return 'This cohort is no longer available for reporting.';
  }

  // Everywhere else the service's own wording is more specific than ours —
  // it names the actual reason ("too wide", "month not processed") instead of
  // guessing from a status code.
  const serverMessage = readServerMessage(error);
  if (serverMessage) return serverMessage;

  if (status === 400) {
    return 'The report service could not process that date range. Choose a shorter period.';
  }
  if (status === 422) {
    return 'Choose a valid cohort and date range to load the report.';
  }
  if (status === 429) {
    return 'The report service is busy. Wait a moment and try again.';
  }
  return 'The organization report is temporarily unavailable. Try again shortly.';
};

const createReportError = (error: unknown, fallbackMessage?: string): Error =>
  Object.defineProperty(
    new Error(fallbackMessage ?? getReportErrorMessage(error)),
    'cause',
    {
      value: error,
      enumerable: false,
      configurable: true,
      writable: true,
    }
  );

/**
 * Shown when the whole period produced no usable windows and the service gave
 * no reason of its own. Says what is missing and what to try, instead of the
 * old "temporarily unavailable", which described a transient fault the user
 * could do nothing about and hid the fact that this is about missing data.
 */
const NO_REPORT_DATA_MESSAGE =
  'No air quality readings were returned for this period. Try a different date range, or check that the selected cohort has devices reporting.';

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
 * window could not be fetched and should be recorded as unavailable — either
 * because it exhausted its 429 retries or because the caller's POST budget ran
 * out first. The caller handles both the same way, so the kind does not
 * distinguish them.
 *
 * A failure carries the underlying `error` even when it is not rethrown: a 400
 * becomes a split rather than an exception, so without this the service's own
 * explanation of *why* the range was refused is gone by the time the loop gives
 * up, and the user is left with a generic "temporarily unavailable".
 */
type ReportWindowOutcome =
  | { kind: 'success'; report: AnalyticsReport }
  | { kind: 'split'; error: unknown }
  | { kind: 'rate-limited'; error?: unknown };

/** A queued window plus how many times it has already been halved. */
type ReportQueueEntry = {
  window: AnalyticsReportRequest;
  depth: number;
};

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
   * does a response without a successful `airquality` payload. `hasBudget` is
   * consulted before every attempt so the caller's POST ceiling holds across
   * the 429 retry, not just across queued windows.
   */
  private async postReportWindow(
    window: AnalyticsReportRequest,
    signal: AbortSignal | undefined,
    hasBudget: () => boolean,
    onAttempt: () => void
  ): Promise<ReportWindowOutcome> {
    for (let attempt = 1; attempt <= REPORT_429_MAX_ATTEMPTS; attempt += 1) {
      // The budget must be re-checked per attempt, not once per queued
      // window: a 429 retry is a second POST, so a window entered with the
      // counter one short of the cap would otherwise overshoot
      // `REPORT_MAX_POSTS` by one. Stopping here keeps the ceiling hard —
      // the window surfaces as rate-limited, which the caller records as
      // unavailable just like a window that exhausted its retries.
      if (!hasBudget()) {
        return { kind: 'rate-limited' };
      }
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
        // let the caller split instead of failing the whole report. The error
        // rides along so the caller can still explain the refusal.
        if (status === 400 || status === 422) {
          return { kind: 'split', error };
        }

        if (status === 429) {
          // Bounded per-window retry. Exhausting it makes this window
          // unavailable rather than discarding the windows that succeeded.
          if (attempt >= REPORT_429_MAX_ATTEMPTS) {
            return { kind: 'rate-limited', error };
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
   * Aug 2026 always fail, Jun→Jul boundary fails). So this is a bounded
   * adaptive loop rather than a fire-and-merge `Promise.all`:
   *
   * 1. Queue the initial ≤27-day windows.
   * 2. For each window: skip it when it lies entirely inside a known-bad month
   *    (`failedMonths`); POST it through `postReportWindow`; on success collect
   *    it.
   * 3. On a splittable failure (HTTP 400 / 422), halve the window once via
   *    `splitReportWindow` and push the parts to the front of the queue
   *    (depth-first). Two things stop the recursion: a 1-day window that still
   *    fails is terminal (its month is recorded as bad so later windows inside
   *    it are skipped without a POST), and the depth budget running out, which
   *    writes the window off without blacklisting its month.
   * 4. HTTP 429 is retried per window by `postReportWindow`; when a window
   *    exhausts its retries it is recorded as unavailable so already-fetched
   *    windows still render. Any other error (401/403/404/5xx/abort) throws
   *    immediately.
   * 5. If nothing succeeded, throw. Otherwise merge the successful reports
   *    with the `unavailablePeriods` list (possibly empty).
   *
   * Requests are paced to the analytics service's 10 req/60 s per-route limit
   * rather than relying on sequential execution, which a fast 400 would
   * otherwise outrun. Two independent ceilings keep that pacing from turning
   * into a request storm: `REPORT_MAX_SPLIT_DEPTH` bounds how far a rejected
   * window is chased, and `REPORT_MAX_POSTS` is a hard ceiling on POSTs (skipped
   * windows never count). When the cap is hit every window still queued is
   * recorded as unavailable so none is silently dropped, and the user sees the
   * written-off days in the warning banner instead of watching the page retry
   * for minutes.
   */
  async getReport(
    request: AnalyticsReportRequest,
    signal?: AbortSignal
  ): Promise<AnalyticsReport> {
    const payload = buildReportPayload(request);
    const maxAttempts = REPORT_MAX_POSTS;
    // `depth` counts halvings so a rejected window cannot be split down to
    // 1-day leaves (see `REPORT_MAX_SPLIT_DEPTH`).
    const queue: ReportQueueEntry[] = buildReportWindows(payload).map(
      window => ({ window, depth: 0 })
    );

    const successful: AnalyticsReport[] = [];
    const unavailable: AnalyticsReportPeriod[] = [];
    const failedMonths = new Set<string>();
    // Counted per network POST actually sent (the 429 retry counts too);
    // skipped and queued windows never increment it.
    let attempts = 0;
    // Most recent window rejection, kept so that giving up can explain itself.
    // A 400/422 becomes a split rather than a throw, so without this the
    // service's reason for refusing the range is gone by the time the loop
    // ends, and the user only ever sees a generic failure.
    let lastWindowError: unknown = null;

    const monthKeyOf = (datePart: string): string => datePart.slice(0, 7);

    while (queue.length > 0) {
      if (attempts >= maxAttempts) {
        // POST cap reached: record every window still queued as unavailable
        // so nothing is silently lost, while keeping the windows that already
        // succeeded. If nothing succeeded, the post-loop check throws.
        while (queue.length > 0) {
          const leftover = queue.shift()!.window;
          unavailable.push({
            startTime: String(leftover.start_time ?? '').trim(),
            endTime: String(leftover.end_time ?? '').trim(),
          });
        }
        break;
      }

      const { window, depth } = queue.shift()!;
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

      const outcome = await this.postReportWindow(
        window,
        signal,
        () => attempts < maxAttempts,
        () => {
          attempts += 1;
        }
      );

      if (outcome.kind === 'success') {
        successful.push(outcome.report);
        continue;
      }

      if (outcome.kind === 'rate-limited') {
        // Retries exhausted for this window. Record it and keep the windows
        // that already succeeded instead of discarding the whole report.
        lastWindowError = outcome.error ?? lastWindowError;
        unavailable.push({
          startTime: String(window.start_time ?? '').trim(),
          endTime: String(window.end_time ?? '').trim(),
        });
        continue;
      }

      // Splittable range error (400/422). Halve the window once and push the
      // parts to the front of the queue (depth-first) while the depth budget
      // allows it. Two outcomes stop the recursion:
      //
      // - the window cannot be split any further (a 1-day leaf): terminal, so
      //   its month is recorded as bad and later windows inside it are skipped
      //   without spending a POST;
      // - the depth budget is spent but the window is still splittable: the
      //   rejection is not yet localised, so the window is simply written off.
      //   Its month is NOT marked bad — a genuinely too-wide range would
      //   otherwise blacklist the rest of a perfectly good month.
      const parts = splitReportWindow(window);
      if (parts && depth < REPORT_MAX_SPLIT_DEPTH) {
        lastWindowError = outcome.error;
        queue.unshift(
          ...parts.map(part => ({ window: part, depth: depth + 1 }))
        );
        continue;
      }
      if (!parts) {
        const winMonth = startDate.slice(0, 7);
        if (winMonth) failedMonths.add(winMonth);
      }
      unavailable.push({
        startTime: String(window.start_time ?? '').trim(),
        endTime: String(window.end_time ?? '').trim(),
      });
    }

    if (successful.length === 0) {
      // The service's own reason wins: it names what was actually wrong with
      // the range ("too wide", a month it cannot process) where a status code
      // only tells us something failed. Only when it said nothing is this a
      // genuine no-data outcome, and then the copy says so.
      const lastStatus =
        (lastWindowError as { response?: { status?: number } } | null)
          ?.response?.status ??
        (lastWindowError as { status?: number } | null)?.status;
      throw lastWindowError &&
        (readServerMessage(lastWindowError) || lastStatus === 429)
        ? createReportError(lastWindowError)
        : createReportError(null, NO_REPORT_DATA_MESSAGE);
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
