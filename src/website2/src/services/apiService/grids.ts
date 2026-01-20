import {
  GridRepresentativeReadingResponse,
  GridsSummaryResponse,
} from '@/types/grids';

import BaseApiService, { ServiceOptions } from '../base';

/**
 * Grids API Endpoints
 */
const GRIDS_ENDPOINTS = {
  GRIDS_SUMMARY: '/api/v2/devices/grids/summary',
  GRIDS_REPRESENTATIVE: '/api/v2/devices/readings/grids',
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
      tenant?: string;
      detailLevel?: string;
      admin_level?: string;
    } = {},
    options: ServiceOptions = {},
  ): Promise<GridsSummaryResponse> {
    const {
      tenant = 'airqo',
      detailLevel = 'summary',
      limit = 30,
      skip,
      page,
      admin_level,
    } = params;
    const defaultParams = {
      tenant,
      detailLevel,
      limit,
      skip,
      page,
      admin_level,
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
}

const gridsService = new GridsService();
export default gridsService;
