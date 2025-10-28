import BaseApiService, { ServiceOptions } from '../base';

/**
 * Clean Air Resources API Endpoints
 */
const CLEAN_AIR_RESOURCES_ENDPOINTS = {
  CLEAN_AIR_RESOURCES: '/website/api/v2/clean-air-resources/',
} as const;

class CleanAirResourcesService extends BaseApiService {
  constructor() {
    super('CleanAirResourcesService');
  }

  /**
   * Get all clean air resources
   */
  async getCleanAirResources(
    options: ServiceOptions = {},
    params: { page?: number; page_size?: number } = {},
  ): Promise<any> {
    const response = await this.get<any>(
      CLEAN_AIR_RESOURCES_ENDPOINTS.CLEAN_AIR_RESOURCES,
      params,
      {
        ...options,
        throwOnError: false,
      },
    );

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
}

// Export singleton instance
export const cleanAirResourcesService = new CleanAirResourcesService();
export default cleanAirResourcesService;
