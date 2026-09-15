/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiClient, createServerClient } from './apiClient';
import type {
  RankingsParams,
  RankingsHistoryParams,
  RankingsResponse,
  RankingsHistoryResponse,
  RankingsCountriesResponse,
  ApiErrorResponse,
} from '../types/api';

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

/**
 * Client for the African AQI rankings endpoints
 * (`/devices/readings/rankings` and `/devices/readings/rankings/history`).
 *
 * These endpoints authenticate with the shared API token (via query params)
 * rather than a user JWT, matching how chart data and recent readings are
 * fetched.
 */
export class RankingsService {
  private serverClient: ApiClient;

  constructor() {
    this.serverClient = createServerClient();
  }

  // Get current air quality rankings
  async getRankings(
    params: RankingsParams = {},
    signal?: AbortSignal
  ): Promise<RankingsResponse> {
    const response = await this.serverClient.get<
      RankingsResponse | ApiErrorResponse
    >('/devices/readings/rankings', { params, signal });
    const data = response.data;

    if ('success' in data && !data.success) {
      throw new Error(data.message || 'Failed to get air quality rankings');
    }

    return data as RankingsResponse;
  }

  // Get historical air quality rankings (year-by-year)
  async getRankingsHistory(
    params: RankingsHistoryParams,
    signal?: AbortSignal
  ): Promise<RankingsHistoryResponse> {
    const response = await this.serverClient.get<
      RankingsHistoryResponse | ApiErrorResponse
    >('/devices/readings/rankings/history', { params, signal });
    const data = response.data;

    if ('success' in data && !data.success) {
      throw new Error(
        data.message || 'Failed to get historical air quality rankings'
      );
    }

    return data as RankingsHistoryResponse;
  }

  // Get the list of countries that have rankable locations (reading in the
  // last 3 days). Used to populate the country filter dropdowns.
  async getRankingCountries(
    signal?: AbortSignal
  ): Promise<RankingsCountriesResponse> {
    const response = await this.serverClient.get<
      RankingsCountriesResponse | ApiErrorResponse
    >('/devices/readings/rankings/countries', { signal });
    const data = response.data;

    if ('success' in data && !data.success) {
      throw new Error(data.message || 'Failed to get ranking countries');
    }

    return data as RankingsCountriesResponse;
  }
}

export const rankingsService = new RankingsService();

export { isAbortError };
