import BaseApiService, { ServiceOptions } from '../base';
import { ImpactNumber } from '../types/api';

/**
 * Impact Numbers API Endpoints
 */
const IMPACT_NUMBERS_ENDPOINTS = {
  IMPACT_NUMBERS: '/website/api/v2/impact-numbers/',
} as const;

class ImpactNumbersService extends BaseApiService {
  constructor() {
    super('ImpactNumbersService');
  }

  /**
   * Get all impact numbers
   */
  async getImpactNumbers(
    options: ServiceOptions = {},
  ): Promise<ImpactNumber[]> {
    const response = await this.get<any>(
      IMPACT_NUMBERS_ENDPOINTS.IMPACT_NUMBERS,
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
}

// Export singleton instance
export const impactNumbersService = new ImpactNumbersService();
export default impactNumbersService;
