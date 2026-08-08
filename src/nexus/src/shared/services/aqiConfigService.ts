import { ApiClient, createAuthenticatedClient } from './apiClient';
import { resolveSessionAccessToken } from './sessionAuthToken';
import { AQI_RANGE_KEYS } from '../types/aqi';
import type {
  AqiPollutant,
  AqiRangesResponse,
  UpdateAqiRangesRequest,
} from '../types/aqi';

const extractSuccessData = <T extends { success?: boolean; message?: string }>(
  data: T,
  fallbackMessage: string
): T => {
  if (data?.success === false) {
    throw new Error(data.message || fallbackMessage);
  }

  return data;
};

const validateAqiRangesResponse = (
  response: AqiRangesResponse,
  requestedPollutant: AqiPollutant
): AqiRangesResponse => {
  const ranges = response?.data?.ranges;
  const responsePollutant = response?.data?.pollutant;
  const hasExpectedKeys = ranges?.every(
    (range, index) => range.key === AQI_RANGE_KEYS[index]
  );
  const hasValidBoundaries = ranges?.every((range, index) => {
    const nextRange = ranges[index + 1];
    const isLastRange = index === ranges.length - 1;

    return (
      Number.isFinite(range.min_value) &&
      range.min_value >= 0 &&
      (isLastRange
        ? range.max_value === null
        : Number.isFinite(range.max_value)) &&
      (range.max_value === null || range.max_value > range.min_value) &&
      (!nextRange ||
        range.max_value === null ||
        range.max_value < nextRange.min_value) &&
      /^#[0-9A-Fa-f]{6}$/.test(range.color) &&
      range.label.trim().length > 0
    );
  });

  if (
    response?.success !== true ||
    responsePollutant !== requestedPollutant ||
    !ranges ||
    ranges.length !== AQI_RANGE_KEYS.length ||
    !hasExpectedKeys ||
    !hasValidBoundaries
  ) {
    throw new Error('AQI configuration response has an invalid format');
  }

  return response;
};

export class AqiConfigService {
  private readonly authenticatedClient: ApiClient;

  constructor() {
    this.authenticatedClient = createAuthenticatedClient();
  }

  private async requireAuthenticatedClient(): Promise<ApiClient> {
    const { fetchSucceeded, token } = await resolveSessionAccessToken();
    if (!fetchSucceeded) {
      throw new Error('Unable to verify the current session');
    }
    if (!token) {
      throw new Error('AQI configuration requires an authenticated session');
    }

    this.authenticatedClient.setAuthToken(token);
    return this.authenticatedClient;
  }

  async getAqiRanges(
    pollutant: AqiPollutant = 'pm2_5',
    signal?: AbortSignal
  ): Promise<AqiRangesResponse> {
    const client = await this.requireAuthenticatedClient();
    const response = await client.get<AqiRangesResponse>(
      '/devices/aqi-ranges',
      {
        params: { pollutant },
        signal,
        // The provider renders a dedicated retry state for this shared config;
        // avoid turning an expected unavailable-config state into Slack noise.
        suppressErrorLogging: true,
      }
    );
    return validateAqiRangesResponse(
      extractSuccessData(response.data, 'Failed to load AQI ranges'),
      pollutant
    );
  }

  async updateAqiRanges(
    payload: UpdateAqiRangesRequest
  ): Promise<AqiRangesResponse> {
    const client = await this.requireAuthenticatedClient();
    const response = await client.put<AqiRangesResponse>(
      '/devices/aqi-ranges',
      payload
    );
    return extractSuccessData(response.data, 'Failed to update AQI ranges');
  }

  async resetAqiRanges(adminSecret: string): Promise<AqiRangesResponse> {
    const client = await this.requireAuthenticatedClient();
    const response = await client.delete<AqiRangesResponse>(
      '/devices/aqi-ranges',
      {
        params: { admin_secret: adminSecret },
        data: { admin_secret: adminSecret },
      }
    );
    return extractSuccessData(response.data, 'Failed to reset AQI ranges');
  }
}

export const aqiConfigService = new AqiConfigService();
