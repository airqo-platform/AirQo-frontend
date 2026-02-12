import BaseApiService, { ServiceOptions } from '../base';
import { AfricanCountry, AfricanCountryDetail } from '../types/api';

/**
 * African Countries API Endpoints
 */
const AFRICAN_COUNTRIES_ENDPOINTS = {
  AFRICAN_COUNTRIES: '/website/api/v2/african-countries/',
} as const;

class AfricanCountriesService extends BaseApiService {
  constructor() {
    super('AfricanCountriesService');
  }

  /**
   * Get all African countries
   */
  async getAfricanCountries(
    options: ServiceOptions = {},
  ): Promise<AfricanCountry[]> {
    const response = await this.get<any>(
      AFRICAN_COUNTRIES_ENDPOINTS.AFRICAN_COUNTRIES,
      undefined,
      {
        ...options,
        throwOnError: false,
      },
    );

    if (response.success && response.data?.results) {
      return response.data.results;
    }

    return [];
  }

  /**
   * Get African country details by ID
   */
  async getAfricanCountryDetails(
    countryId: number,
    options: ServiceOptions = {},
  ): Promise<AfricanCountryDetail | null> {
    const response = await this.get<AfricanCountryDetail>(
      `${AFRICAN_COUNTRIES_ENDPOINTS.AFRICAN_COUNTRIES}${countryId}/`,
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
export const africanCountriesService = new AfricanCountriesService();
export default africanCountriesService;
