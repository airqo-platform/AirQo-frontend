import BaseApiService, { ServiceOptions } from '../base';

/**
 * Payments API Endpoints
 */
const PAYMENTS_ENDPOINTS = {
  GET_PAYMENTS_DATA: '/api/getpaymentsdata/',
} as const;

export interface Payment {
  id: string;
  // Add other payment fields as needed
  [key: string]: any;
}

export interface GetPaymentsResponse {
  data: Payment[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export interface PaymentQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  // Add other query params as needed
  [key: string]: any;
}

class PaymentsService extends BaseApiService {
  constructor() {
    super('PaymentsService');
  }

  /**
   * Get paginated list of payments with optional filtering
   *
   * @param params - Query parameters for filtering and pagination
   * @param options - Service options
   * @returns Promise with paginated payments data
   */
  async getPayments(
    params: PaymentQueryParams = {},
    options: ServiceOptions = {},
  ) {
    const url = this.buildUrlWithParams(
      PAYMENTS_ENDPOINTS.GET_PAYMENTS_DATA,
      params,
    );

    const response = await this.get<any>(url, undefined, options);

    if (response.success) {
      const transformedData = this.transformPaginatedResponse<Payment>(
        response.data,
      );
      return {
        ...response,
        data: transformedData.data,
        pagination: transformedData.pagination,
      };
    }

    return response;
  }

  /**
   * Get raw payments data with full API response structure (for hooks/legacy compatibility)
   *
   * @param params - Query parameters for filtering and pagination
   * @param options - Service options
   * @returns Promise with complete API response including summary stats
   */
  async getPaymentsRaw(
    params: PaymentQueryParams = {},
    options: ServiceOptions = {},
  ) {
    const url = this.buildUrlWithParams(
      PAYMENTS_ENDPOINTS.GET_PAYMENTS_DATA,
      params,
    );
    return this.get<any>(url, undefined, options);
  }
}

// Export singleton instance
export const paymentsService = new PaymentsService();
export default paymentsService;
