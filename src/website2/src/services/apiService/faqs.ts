import BaseApiService, { ServiceOptions } from '../base';

/**
 * FAQ API Endpoints
 */
const FAQ_ENDPOINTS = {
  FAQ: '/website/api/v2/faq/',
} as const;

class FAQService extends BaseApiService {
  constructor() {
    super('FAQService');
  }

  /**
   * Get all FAQs
   */
  async getFAQs(
    options: ServiceOptions = {},
    params: { page?: number; page_size?: number } = {},
  ): Promise<any> {
    const response = await this.get<any>(FAQ_ENDPOINTS.FAQ, params, {
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
}

// Export singleton instance
export const faqService = new FAQService();
export default faqService;
