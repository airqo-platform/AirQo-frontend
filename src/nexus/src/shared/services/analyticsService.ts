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
  RecentReading,
  RecentReadingRequest,
  RecentReadingsResponse,
  DataDownloadRequest,
  DataDownloadResponse,
} from '../types/api';

const RECENT_READINGS_BATCH_SIZE = 10;

type RecentReadingsPayload =
  | RecentReadingsResponse
  | {
      success?: boolean;
      message?: string;
      measurements?: RecentReading[];
      data?: RecentReading[] | { measurements?: RecentReading[] };
    };

const normalizeRecentReadingsResponse = (
  payload: RecentReadingsPayload,
  fallbackMessage: string
): RecentReadingsResponse => {
  const nestedData = 'data' in payload ? payload.data : undefined;
  const measurements = Array.isArray(payload.measurements)
    ? payload.measurements
    : Array.isArray(nestedData)
      ? nestedData
      : nestedData && Array.isArray(nestedData.measurements)
        ? nestedData.measurements
        : [];

  return {
    success: payload.success !== false,
    message: payload.message || fallbackMessage,
    measurements,
  };
};

const isAbortError = (error: unknown): boolean => {
  const candidate = error as {
    name?: string;
    code?: string;
    message?: string;
  } | null;

  if (!candidate) {
    return false;
  }

  return (
    candidate.name === 'AbortError' ||
    candidate.name === 'CanceledError' ||
    candidate.code === 'ERR_CANCELED' ||
    candidate.message === 'canceled'
  );
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

  // Get chart data - proxied to avoid CORS issues with direct browser-to-API calls
  async getChartData(
    request: AnalyticsChartRequest,
    signal?: AbortSignal
  ): Promise<AnalyticsChartResponse> {
    const response =
      await this.serverClient.post<AnalyticsChartResponse>(
        '/analytics/dashboard/chart/d3/data',
        request,
        { signal }
      );
    return response.data;
  }

  // Get recent readings data
  async getRecentReadings(
    request: RecentReadingRequest,
    signal?: AbortSignal
  ): Promise<RecentReadingsResponse> {
    const normalizedSiteIds = Array.from(
      new Set(
        (request.site_id || '')
          .split(',')
          .map(siteId => siteId.trim())
          .filter(Boolean)
      )
    );

    if (normalizedSiteIds.length === 0) {
      return {
        success: true,
        message: 'No site IDs provided',
        measurements: [],
      };
    }

    // The backend can fail on larger comma-joined site_id lists, so keep
    // recent-readings requests small and merge the results for the caller.
    const siteIdBatches: string[][] = [];

    for (
      let index = 0;
      index < normalizedSiteIds.length;
      index += RECENT_READINGS_BATCH_SIZE
    ) {
      siteIdBatches.push(
        normalizedSiteIds.slice(index, index + RECENT_READINGS_BATCH_SIZE)
      );
    }

    const responses = await Promise.allSettled(
      siteIdBatches.map(async siteIdBatch => {
        const response = await this.serverClient.get<RecentReadingsPayload>(
          '/devices/readings/recent',
          {
            params: {
              site_id: siteIdBatch.join(','),
            },
            signal,
          }
        );

        return normalizeRecentReadingsResponse(
          response.data,
          'Recent readings fetched successfully'
        );
      })
    );

    const abortedResponse = responses.find(
      (response): response is PromiseRejectedResult =>
        response.status === 'rejected' &&
        (signal?.aborted || isAbortError(response.reason))
    );

    if (abortedResponse) {
      throw abortedResponse.reason;
    }

    const successfulResponses = responses
      .filter(
        (
          response
        ): response is PromiseFulfilledResult<RecentReadingsResponse> =>
          response.status === 'fulfilled'
      )
      .map(response => response.value);

    const failedBatches = responses.reduce<
      { batchIndex: number; siteIds: string[]; error: unknown }[]
    >((acc, response, idx) => {
      if (response.status === 'rejected' && !isAbortError(response.reason)) {
        acc.push({
          batchIndex: idx,
          siteIds: siteIdBatches[idx] ?? [],
          error: response.reason,
        });
      }
      return acc;
    }, []);

    if (successfulResponses.length === 0) {
      const failedResponse = responses.find(
        (response): response is PromiseRejectedResult =>
          response.status === 'rejected'
      );

      throw (
        failedResponse?.reason || new Error('Failed to fetch recent readings')
      );
    }

    // Warn about partial failures but still return successful data
    if (failedBatches.length > 0) {
      const failedSiteIds = failedBatches.flatMap(b => b.siteIds).join(', ');
      console.warn(
        `Partial forecast data: some readings failed to load (sites: ${failedSiteIds}). ` +
          `${successfulResponses.length}/${responses.length} batches succeeded.`
      );
    }

    return {
      success:
        successfulResponses.length === responses.length &&
        successfulResponses.every(response => response.success !== false),
      message:
        successfulResponses
          .map(response => response.message)
          .filter(Boolean)
          .join('; ') || 'Recent readings fetched successfully',
      measurements: successfulResponses.flatMap(
        response => response.measurements ?? []
      ),
    };
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
}

export const analyticsService = new AnalyticsService();
