import { ApiClient, createAuthenticatedClient, createOpenClient } from './apiClient';
import { syncClientSessionToken } from './sessionAuthToken';
import { AQI_RANGE_KEYS } from '../types/aqi';
import type {
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
  response: AqiRangesResponse
): AqiRangesResponse => {
  const ranges = response?.data?.ranges;
  const hasExpectedKeys = ranges?.every(
    (range, index) => range.key === AQI_RANGE_KEYS[index]
  );
  const hasValidBoundaries = ranges?.every((range, index) => {
    const nextRange = ranges[index + 1];
    const isLastRange = index === ranges.length - 1;

    return (
      Number.isFinite(range.min_value) &&
      range.min_value >= 0 &&
      (isLastRange ? range.max_value === null : Number.isFinite(range.max_value)) &&
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
  private readonly openClient: ApiClient;
  private readonly authenticatedClient: ApiClient;

  constructor() {
    this.openClient = createOpenClient();
    this.authenticatedClient = createAuthenticatedClient();
  }

  async getAqiRanges(signal?: AbortSignal): Promise<AqiRangesResponse> {
    const response = await this.openClient.get<AqiRangesResponse>(
      '/devices/aqi-ranges',
      { signal }
    );
    return validateAqiRangesResponse(
      extractSuccessData(response.data, 'Failed to load AQI ranges')
    );
  }

  async updateAqiRanges(
    payload: UpdateAqiRangesRequest
  ): Promise<AqiRangesResponse> {
    await syncClientSessionToken(this.authenticatedClient);
    const response = await this.authenticatedClient.put<AqiRangesResponse>(
      '/devices/aqi-ranges',
      payload
    );
    return extractSuccessData(response.data, 'Failed to update AQI ranges');
  }

  async resetAqiRanges(adminSecret: string): Promise<AqiRangesResponse> {
    await syncClientSessionToken(this.authenticatedClient);
    const response = await this.authenticatedClient.delete<AqiRangesResponse>(
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
