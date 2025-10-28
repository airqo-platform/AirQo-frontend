import BaseApiService, { ServiceOptions } from '../base';

/**
 * Press API Endpoints
 */
const PRESS_ENDPOINTS = {
  PRESS: '/website/api/v2/press/',
} as const;

class PressService extends BaseApiService {
  constructor() {
    super('PressService');
  }

  /**
   * Get all press articles
   */
  async getPressArticles(
    options: ServiceOptions = {},
    params: { page?: number; page_size?: number } = {},
  ): Promise<any> {
    const response = await this.get<any>(PRESS_ENDPOINTS.PRESS, params, {
      ...options,
      throwOnError: false,
    });

    if (response.success) {
      return response.data; // Return full paginated response
    }

    // Return empty array on error to match legacy behavior
    return [];
  }
}

// Export singleton instance
export const pressService = new PressService();
export default pressService;
