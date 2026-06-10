import BaseApiService, { ServiceOptions } from '../base';

/**
 * Highlights API Endpoints
 */
const HIGHLIGHTS_ENDPOINTS = {
  HIGHLIGHTS: '/website/api/v2/highlights/',
} as const;

class HighlightsService extends BaseApiService {
  constructor() {
    super('HighlightsService');
  }

  /**
   * Get all highlights
   */
  async getHighlights(
    options: ServiceOptions = {},
    params: { page?: number; page_size?: number } = {},
  ): Promise<any> {
    const response = await this.get<any>(
      HIGHLIGHTS_ENDPOINTS.HIGHLIGHTS,
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
export const highlightsService = new HighlightsService();
export default highlightsService;
