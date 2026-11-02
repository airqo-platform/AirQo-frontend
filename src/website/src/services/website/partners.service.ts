import { BaseApiService, ServiceOptions } from '@/services/api';
import { Partner } from '@/types/api';

/**
 * Partners API Endpoints
 */
const PARTNERS_ENDPOINTS = {
  PARTNERS: '/website/api/v2/partners/',
} as const;

export interface PartnerDetailsResult {
  partner: Partner | null;
  notFound: boolean;
}

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
    const result = await this.getPartnerDetailsResult(
      publicIdentifier,
      options,
    );
    return result.partner;
  }

  /**
   * Get partner details while distinguishing a confirmed 404 from a failed
   * lookup. This lets metadata avoid marking transient API failures noindex.
   */
  async getPartnerDetailsResult(
    publicIdentifier: string,
    options: ServiceOptions = {},
  ): Promise<PartnerDetailsResult> {
    const response = await this.get<Partner>(
      `${PARTNERS_ENDPOINTS.PARTNERS}${publicIdentifier}/`,
      undefined,
      {
        ...options,
        throwOnError: false,
      },
    );

    return {
      partner: response.success ? response.data : null,
      notFound: !response.success && response.statusCode === 404,
    };
  }
}

// Export singleton instance
export const partnersService = new PartnersService();
export default partnersService;
