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
   * Fetch grids summary data
   */
  async getGridsSummary(options: ServiceOptions = {}): Promise<any | null> {
    const response = await this.get<any>(EXTERNAL_ENDPOINTS.GRIDS_SUMMARY, {
      ...options,
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
