import {
  CohortMeasurementsResponse,
  CohortsQueryParams,
  CohortsSummaryResponse,
} from '@/types/cohorts';

import BaseApiService, { ServiceOptions } from '../base';

/**
 * Cohorts API Endpoints
 */
const COHORTS_ENDPOINTS = {
  COHORTS_SUMMARY: '/api/v2/devices/cohorts/summary',
  COHORT_MEASUREMENTS: '/api/v2/devices/measurements/cohorts',
} as const;

class CohortsService extends BaseApiService {
  constructor() {
    super('CohortsService');
  }

  /**
   * Get cohorts summary with pagination and filtering
   */
  async getCohortsSummary(
    params: CohortsQueryParams = {},
    options: ServiceOptions = {},
  ): Promise<CohortsSummaryResponse> {
    const { limit = 30, skip, page, search } = params;

    const defaultParams = {
      limit,
      skip,
      page,
      search,
    };

    const response = await this.get<CohortsSummaryResponse>(
      COHORTS_ENDPOINTS.COHORTS_SUMMARY,
      defaultParams,
      { ...options, throwOnError: false },
    );

    if (response.success && response.data) {
      return response.data;
    }

    return {
      success: false,
      message: 'Failed to fetch cohorts summary',
      meta: {
        total: 0,
        limit: defaultParams.limit,
        skip: defaultParams.skip || 0,
        page: defaultParams.page || 1,
        totalPages: 0,
      },
      cohorts: [],
    };
  }

  /**
   * Get recent measurements for a specific cohort
   */
  async getCohortMeasurements(
    cohortId: string,
    params: {
      limit?: number;
      skip?: number;
      page?: number;
      startTime?: string;
      endTime?: string;
      frequency?: string;
    } = {},
    options: ServiceOptions = {},
  ): Promise<CohortMeasurementsResponse> {
    const endpoint = `${COHORTS_ENDPOINTS.COHORT_MEASUREMENTS}/${cohortId}/recent`;

    const { limit = 30, skip, page, startTime, endTime, frequency } = params;

    const queryParams = {
      limit,
      skip,
      page,
      startTime,
      endTime,
      frequency,
    };

    const response = await this.get<CohortMeasurementsResponse>(
      endpoint,
      queryParams,
      { ...options, throwOnError: false },
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(
      response.data?.message || 'Failed to fetch cohort measurements',
    );
  }
}

const cohortsService = new CohortsService();
export default cohortsService;
