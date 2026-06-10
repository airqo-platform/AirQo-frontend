import BaseApiService, { ServiceOptions } from '../base';
import { Partner } from '../types/api';

/**
 * Partners API Endpoints
 */
const PARTNERS_ENDPOINTS = {
  PARTNERS: '/website/api/v2/partners/',
} as const;

class PartnersService extends BaseApiService {
  constructor() {
    super('PartnersService');
  }

  /**
   * Get all partners
   */
  async getPartners(
    options: ServiceOptions = {},
    params: { page?: number; page_size?: number; featured?: boolean } = {},
  ): Promise<any> {
    const response = await this.get<any>(PARTNERS_ENDPOINTS.PARTNERS, params, {
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
   * Get partner details by public identifier
   */
  async getPartnerDetails(
    publicIdentifier: string,
    options: ServiceOptions = {},
  ): Promise<Partner | null> {
    const response = await this.get<Partner>(
      `${PARTNERS_ENDPOINTS.PARTNERS}${publicIdentifier}/`,
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
export const partnersService = new PartnersService();
export default partnersService;
