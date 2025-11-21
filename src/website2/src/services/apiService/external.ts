import BaseApiService, { ServiceOptions } from '../base';

/**
 * External API Endpoints (for user interactions)
 */
const EXTERNAL_ENDPOINTS = {
  NEWSLETTER_SUBSCRIBE: '/api/v2/users/newsletter/subscribe',
  CONTACT_US: '/api/v2/users/inquiries/register',
  GRIDS_SUMMARY: '/api/v2/devices/grids/summary',
  COUNTRIES_DATA: '/api/v2/devices/grids/countries',
} as const;

class ExternalService extends BaseApiService {
  constructor() {
    super('ExternalService');
  }

  /**
   * Subscribe a user to the newsletter
   */
  async subscribeToNewsletter(
    data: any,
    options: ServiceOptions = {},
  ): Promise<any | null> {
    const response = await this.post<any>(
      EXTERNAL_ENDPOINTS.NEWSLETTER_SUBSCRIBE,
      data,
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

  /**
   * Post user feedback, inquiry, or contact us message
   */
  async postContactUs(
    data: any,
    options: ServiceOptions = {},
  ): Promise<any | null> {
    const response = await this.post<any>(EXTERNAL_ENDPOINTS.CONTACT_US, data, {
      ...options,
      throwOnError: false,
    });

    if (response.success) {
      return response.data;
    }

    return null;
  }

  /**
   * Fetch grids summary data with pagination and filtering support
   * @param params - Query parameters for pagination and filtering
   * @param params.limit - Number of items per page (optional)
   * @param params.skip - Number of items to skip (optional)
   * @param params.page - Page number (optional, alternative to skip)
   * @param params.tenant - Tenant identifier (optional)
   * @param params.detailLevel - Level of detail in response (optional)
   * @param params.search - Search query for filtering grids (optional)
   * @param params.admin_level - Filter by administrative level like 'country', 'city', etc. (optional)
   */
  async getGridsSummary(
    params: {
      limit?: number;
      skip?: number;
      page?: number;
      tenant?: string;
      detailLevel?: string;
      search?: string;
      admin_level?: string;
    } = {},
    options: ServiceOptions = {},
  ): Promise<any | null> {
    // Build query params only with provided values
    const queryParams: Record<string, any> = {};

    if (params.limit !== undefined) queryParams.limit = params.limit;
    if (params.skip !== undefined) queryParams.skip = params.skip;
    if (params.page !== undefined) queryParams.page = params.page;
    if (params.tenant) queryParams.tenant = params.tenant;
    if (params.detailLevel) queryParams.detailLevel = params.detailLevel;
    if (params.search) queryParams.search = params.search;
    if (params.admin_level) queryParams.admin_level = params.admin_level;

    const response = await this.get<any>(EXTERNAL_ENDPOINTS.GRIDS_SUMMARY, {
      ...options,
      params: queryParams,
      throwOnError: false,
    });

    if (response.success) {
      return response.data;
    }

    return null;
  }

  /**
   * Fetch countries data
   */
  async getCountriesData(options: ServiceOptions = {}): Promise<any | null> {
    const response = await this.get<any>(EXTERNAL_ENDPOINTS.COUNTRIES_DATA, {
      ...options,
      throwOnError: false,
    });

    if (response.success) {
      return response.data;
    }

    return null;
  }
}

// Export singleton instance
export const externalService = new ExternalService();
export default externalService;
