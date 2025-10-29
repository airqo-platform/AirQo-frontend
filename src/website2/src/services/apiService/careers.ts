import BaseApiService, { ServiceOptions } from '../base';
import { Career } from '../types/api';

/**
 * Careers API Endpoints
 */
const CAREERS_ENDPOINTS = {
  CAREERS: '/website/api/v2/careers/',
} as const;

class CareersService extends BaseApiService {
  constructor() {
    super('CareersService');
  }

  /**
   * Get all careers
   */
  async getCareers(
    options: ServiceOptions = {},
    params: { page?: number; page_size?: number } = {},
  ): Promise<any> {
    const response = await this.get<any>(CAREERS_ENDPOINTS.CAREERS, params, {
      ...options,
      throwOnError: false,
    });

    if (response.success) {
      return response.data; // Return full paginated response
    }

    return {
      results: [],
      total_pages: 1,
      count: 0,
      next: null,
      previous: null,
      page_size: params.page_size || 10,
      current_page: 1,
    };
  }

  /**
   * Get career details by public identifier
   */
  async getCareerDetails(
    publicIdentifier: string,
    options: ServiceOptions = {},
  ): Promise<Career | null> {
    const response = await this.get<Career>(
      `${CAREERS_ENDPOINTS.CAREERS}${publicIdentifier}/`,
      undefined,
      {
        ...options,
        throwOnError: false,
      },
    );

    if (response.success) {
      return response.data;
    }

    return null;
  }
}

// Export singleton instance
export const careersService = new CareersService();
export default careersService;
