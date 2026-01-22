import { DailyForecastResponse } from '@/types/cohorts';

import BaseApiService, { ServiceOptions } from '../base';

/**
 * Predict API Endpoints
 */
const PREDICT_ENDPOINTS = {
  DAILY_FORECAST: '/api/v2/predict/daily-forecast',
} as const;

class PredictService extends BaseApiService {
  constructor() {
    super('PredictService');
  }

  /**
   * Get daily forecast for a specific site
   */
  async getDailyForecast(
    siteId: string,
    options: ServiceOptions = {},
  ): Promise<DailyForecastResponse> {
    const response = await this.get<DailyForecastResponse>(
      PREDICT_ENDPOINTS.DAILY_FORECAST,
      { site_id: siteId },
      { ...options, throwOnError: false },
    );

    if (response.success && response.data) {
      return response.data;
    }

    // For forecast endpoint, the data is directly returned
    if (response.data && response.data.forecasts) {
      return response.data;
    }

    throw new Error('Failed to fetch daily forecast');
  }
}

const predictService = new PredictService();
export default predictService;
