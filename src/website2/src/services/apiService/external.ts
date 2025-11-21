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
   * Fetch grids summary data with pagination support
   * @param params - Query parameters for pagination and filtering
   * @param params.limit - Number of items per page (default: 30)
   * @param params.skip - Number of items to skip (default: 0)
   * @param params.page - Page number (optional, alternative to skip)
   * @param params.tenant - Tenant identifier (default: 'airqo')
   * @param params.detailLevel - Level of detail in response (default: 'summary')
   */
  async getGridsSummary(
    params: {
      limit?: number;
      skip?: number;
      page?: number;
      tenant?: string;
      detailLevel?: string;
    } = {},
    options: ServiceOptions = {},
  ): Promise<any | null> {
    const queryParams = {
      limit: params.limit || 30,
      skip: params.skip || 0,
      tenant: params.tenant || 'airqo',
      detailLevel: params.detailLevel || 'summary',
      ...params,
    };

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
