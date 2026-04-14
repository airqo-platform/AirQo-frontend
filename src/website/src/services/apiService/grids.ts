import {
  GridMeasurementsResponse,
  GridRepresentativeReadingResponse,
  GridsSummaryResponse,
} from '@/types/grids';

import BaseApiService, { ServiceOptions } from '../base';

/**
 * Grids API Endpoints
 */
const GRIDS_ENDPOINTS = {
  GRIDS_SUMMARY: 'devices/grids/summary',
  GRIDS_REPRESENTATIVE: 'devices/readings/grids',
  GRID_MEASUREMENTS: 'devices/measurements/grids',
} as const;

class GridsService extends BaseApiService {
  constructor() {
    super('GridsService');
  }

  /**
   * Get grids summary with pagination and filtering
   */
  async getGridsSummary(
    params: {
      limit?: number;
      skip?: number;
      page?: number;
      admin_level?: string;
      search?: string;
    } = {},
    options: ServiceOptions = {},
  ): Promise<GridsSummaryResponse> {
    // Use destructuring with defaults to prevent undefined values from overriding defaults
    // This ensures that if a caller passes { limit: undefined }, it doesn't wipe out the default limit of 30
    const { limit = 30, skip, page, admin_level, search } = params;
    const defaultParams = {
      limit,
      skip,
      page,
      admin_level,
      search,
    };

    const response = await this.get<GridsSummaryResponse>(
      GRIDS_ENDPOINTS.GRIDS_SUMMARY,
      defaultParams,
      { ...options, throwOnError: false },
    );

    if (response.success && response.data) {
      return response.data;
    }

    return {
      success: false,
      message: 'Failed to fetch grids summary',
      meta: {
        total: 0,
        limit: defaultParams.limit,
        skip: defaultParams.skip || 0,
        page: defaultParams.page || 1,
        totalPages: 0,
      },
      grids: [],
    };
  }

  /**
   * Get representative air quality reading for a specific grid
   */
  async getGridRepresentativeReading(
    gridId: string,
    options: ServiceOptions = {},
  ): Promise<GridRepresentativeReadingResponse> {
    const endpoint = `${GRIDS_ENDPOINTS.GRIDS_REPRESENTATIVE}/${gridId}/representative`;
    const response = await this.get<GridRepresentativeReadingResponse>(
      endpoint,
      {},
      { ...options, throwOnError: false },
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(
      response.data?.message || 'Failed to fetch representative reading',
    );
  }

  /**
   * Get recent measurements for a specific grid
   */
  async getGridMeasurements(
    gridId: string,
    params: {
      limit?: number;
      skip?: number;
      page?: number;
      startTime?: string;
      endTime?: string;
      frequency?: string;
    } = {},
    options: ServiceOptions = {},
  ): Promise<GridMeasurementsResponse> {
    const endpoint = `${GRIDS_ENDPOINTS.GRID_MEASUREMENTS}/${gridId}/recent`;

    const { limit = 30, skip, page, startTime, endTime, frequency } = params;

    const queryParams = {
      limit,
      skip,
      page,
      startTime,
      endTime,
      frequency,
    };

    const response = await this.get<GridMeasurementsResponse>(
      endpoint,
      queryParams,
      { ...options, throwOnError: false },
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(
      response.data?.message || 'Failed to fetch grid measurements',
    );
  }
}

const gridsService = new GridsService();
export default gridsService;
