import BaseApiService, { ServiceOptions } from '../base';

/**
 * Departments API Endpoints
 */
const DEPARTMENTS_ENDPOINTS = {
  DEPARTMENTS: '/website/api/v2/departments/',
} as const;

class DepartmentsService extends BaseApiService {
  constructor() {
    super('DepartmentsService');
  }

  /**
   * Get all departments
   */
  async getDepartments(
    options: ServiceOptions = {},
    params: { page?: number; page_size?: number } = {},
  ): Promise<any> {
    const response = await this.get<any>(
      DEPARTMENTS_ENDPOINTS.DEPARTMENTS,
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
export const departmentsService = new DepartmentsService();
export default departmentsService;
