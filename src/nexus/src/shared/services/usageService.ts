import { ApiClient, createAuthenticatedClient } from './apiClient';
import { syncClientSessionToken } from './sessionAuthToken';
import type {
  UsageBreakdownParams,
  UsageBreakdownResponse,
  UsageCalendarParams,
  UsageCalendarResponse,
  UsageCsvExportResult,
  UsageExportCsvParams,
  UsageOverviewParams,
  UsageOverviewResponse,
  UsagePagesParams,
  UsagePagesResponse,
  UsageRetentionParams,
  UsageRetentionResponse,
  UsageRhythmParams,
  UsageRhythmResponse,
  UsageSummaryParams,
  UsageSummaryResponse,
  UsageTimelineParams,
  UsageTimelineResponse,
  UsageUsersParams,
  UsageUsersResponse,
} from '../types/usage';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

/**
 * Builds a query string from a params object, dropping undefined/null/empty
 * values and only emitting `exclude_internal` when it is `true`.
 */
const buildUsageQuery = (params: object): string => {
  const searchParams = new URLSearchParams();

  Object.entries(params as Record<string, unknown>).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    if (key === 'exclude_internal') {
      if (value === true) {
        searchParams.set('exclude_internal', 'true');
      }
      return;
    }

    searchParams.set(key, String(value));
  });

  const query = searchParams.toString();
  return query ? `?${query}` : '';
};

/**
 * Unwraps the backend envelope `{ success, message, data }` used by every
 * usage read endpoint except the beacon and CSV.
 *
 * - If the payload carries a `data` object, that is the response.
 * - Otherwise the payload itself is returned (defensive: tolerate unwrapped
 *   responses without throwing).
 * - When `success === false`, throws `new Error(message)` so callers surface
 *   a clean failure.
 */
const unwrapUsageEnvelope = <T>(payload: unknown): T => {
  if (!isRecord(payload)) {
    return payload as T;
  }

  if (payload.success === false) {
    const message =
      typeof payload.message === 'string' && payload.message
        ? payload.message
        : 'Usage request failed';
    throw new Error(message);
  }

  if ('data' in payload && isRecord(payload.data)) {
    return payload.data as T;
  }

  return payload as T;
};

export class UsageService {
  private authenticatedClient: ApiClient;

  constructor() {
    this.authenticatedClient = createAuthenticatedClient();
  }

  private async ensureAuthenticated() {
    await syncClientSessionToken(this.authenticatedClient);
  }

  /**
   * Shared plumbing for every envelope-wrapped read: authenticate, append
   * the built query string to `path`, GET, then unwrap `{ success, message,
   * data }`. The `AbortSignal` is forwarded verbatim so React Query /
   * caller cancellations propagate untouched (never swallowed or rewritten).
   *
   * Paths are relative to the `ApiClient` base URL (which already ends in
   * `/api/v2`) — no hard-coded version strings (AGENTS.md).
   */
  private async getUnwrapped<T>(
    path: string,
    params: object = {},
    signal?: AbortSignal
  ): Promise<T> {
    await this.ensureAuthenticated();
    const response = await this.authenticatedClient.get<unknown>(
      `${path}${buildUsageQuery(params)}`,
      { signal }
    );
    return unwrapUsageEnvelope<T>(response.data);
  }

  // Calendar
  async getCalendar(
    userId: string,
    params: UsageCalendarParams = {},
    signal?: AbortSignal
  ): Promise<UsageCalendarResponse> {
    return this.getUnwrapped<UsageCalendarResponse>(
      `/users/usage/users/${encodeURIComponent(userId)}/calendar`,
      params,
      signal
    );
  }

  // Summary
  async getSummary(
    userId: string,
    params: UsageSummaryParams = {},
    signal?: AbortSignal
  ): Promise<UsageSummaryResponse> {
    return this.getUnwrapped<UsageSummaryResponse>(
      `/users/usage/users/${encodeURIComponent(userId)}/summary`,
      params,
      signal
    );
  }

  // Breakdown
  async getBreakdown(
    userId: string,
    params: UsageBreakdownParams = {},
    signal?: AbortSignal
  ): Promise<UsageBreakdownResponse> {
    return this.getUnwrapped<UsageBreakdownResponse>(
      `/users/usage/users/${encodeURIComponent(userId)}/breakdown`,
      params,
      signal
    );
  }

  // Timeline
  async getTimeline(
    userId: string,
    params: UsageTimelineParams,
    signal?: AbortSignal
  ): Promise<UsageTimelineResponse> {
    return this.getUnwrapped<UsageTimelineResponse>(
      `/users/usage/users/${encodeURIComponent(userId)}/timeline`,
      params,
      signal
    );
  }

  // Rhythm
  async getRhythm(
    userId: string,
    params: UsageRhythmParams = {},
    signal?: AbortSignal
  ): Promise<UsageRhythmResponse> {
    return this.getUnwrapped<UsageRhythmResponse>(
      `/users/usage/users/${encodeURIComponent(userId)}/rhythm`,
      params,
      signal
    );
  }

  // Overview
  async getOverview(
    params: UsageOverviewParams = {},
    signal?: AbortSignal
  ): Promise<UsageOverviewResponse> {
    return this.getUnwrapped<UsageOverviewResponse>(
      '/users/usage/overview',
      params,
      signal
    );
  }

  // Pages
  async getPages(
    params: UsagePagesParams = {},
    signal?: AbortSignal
  ): Promise<UsagePagesResponse> {
    return this.getUnwrapped<UsagePagesResponse>(
      '/users/usage/pages',
      params,
      signal
    );
  }

  // Users table
  async getUsers(
    params: UsageUsersParams = {},
    signal?: AbortSignal
  ): Promise<UsageUsersResponse> {
    return this.getUnwrapped<UsageUsersResponse>(
      '/users/usage/users',
      params,
      signal
    );
  }

  // Retention
  async getRetention(
    params: UsageRetentionParams = {},
    signal?: AbortSignal
  ): Promise<UsageRetentionResponse> {
    return this.getUnwrapped<UsageRetentionResponse>(
      '/users/usage/retention',
      params,
      signal
    );
  }

  // CSV export — no envelope unwrap; returns the blob plus filename.
  async exportUsersCsv(
    params: UsageExportCsvParams = {},
    signal?: AbortSignal
  ): Promise<UsageCsvExportResult> {
    await this.ensureAuthenticated();
    const query = buildUsageQuery({
      ...params,
      format: 'csv',
    });

    const response = await this.authenticatedClient.get<Blob>(
      `/users/usage/users${query}`,
      { responseType: 'blob', signal }
    );

    const blob = response.data;

    let filename: string | undefined;
    const disposition = response.headers?.['content-disposition'];
    if (typeof disposition === 'string') {
      const match = /filename="?([^"]+)"?/i.exec(disposition);
      if (match?.[1]) {
        filename = match[1];
      }
    }

    const month =
      typeof params.month === 'string' && params.month
        ? params.month
        : 'current';

    return {
      blob,
      filename: filename ?? `nexus-usage-${month}.csv`,
    };
  }
}

export const usageService = new UsageService();
