import BaseApiService, { ServiceOptions } from '../base';

/**
 * Publications API Endpoints
 */
const PUBLICATIONS_ENDPOINTS = {
  PUBLICATIONS: '/website/api/v2/publications/',
} as const;

class PublicationsService extends BaseApiService {
  constructor() {
    super('PublicationsService');
  }

  /**
   * Get all publications
   */
  async getPublications(
    options: ServiceOptions = {},
    params: {
      page?: number;
      page_size?: number;
      category?: string | string[];
    } = {},
  ): Promise<any> {
    const queryParams: any = {};
    if (params.page !== undefined) queryParams.page = params.page;
    if (params.page_size !== undefined)
      queryParams.page_size = params.page_size;
    if (params.category !== undefined) {
      if (Array.isArray(params.category)) {
        queryParams.category = params.category.join(',');
      } else {
        queryParams.category = params.category;
      }
    }

    const response = await this.get<any>(
      PUBLICATIONS_ENDPOINTS.PUBLICATIONS,
      queryParams,
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
      page_size: 4,
      current_page: 1,
    };
  }
}

// Export singleton instance
export const publicationsService = new PublicationsService();
export default publicationsService;
