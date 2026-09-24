import { ApiClient, createServerClient } from './apiClient';
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

const CHART_DATA_PATH = '/analytics/dashboard/chart/data';
const DATA_DOWNLOAD_PATH = '/analytics/data-download';
const MAX_CHART_PAGES = 1_000;
const MAX_DOWNLOAD_PAGES = 1_000;

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

const isCancellation = (error: unknown): boolean => {
  const candidate = error as { name?: string; code?: string } | null;
  return (
    candidate?.name === 'AbortError' ||
    candidate?.name === 'CanceledError' ||
    candidate?.code === 'ERR_CANCELED'
  );
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
      if (isCancellation(error) || signal?.aborted) throw error;

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
