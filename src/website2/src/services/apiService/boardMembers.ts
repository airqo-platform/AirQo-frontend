import BaseApiService, { ServiceOptions } from '../base';
import { BoardMember, PaginatedResponse } from '../types/api';

/**
 * Board Members API Endpoints
 */
const BOARD_MEMBERS_ENDPOINTS = {
  BOARD_MEMBERS: '/website/api/v2/board-members/',
} as const;

class BoardMembersService extends BaseApiService {
  constructor() {
    super('BoardMembersService');
  }

  /**
   * Get all board members
   */
  async getBoardMembers(
    options: ServiceOptions = {},
    params: { page?: number; page_size?: number } = {},
  ): Promise<PaginatedResponse<BoardMember>> {
    const response = await this.get<PaginatedResponse<BoardMember>>(
      BOARD_MEMBERS_ENDPOINTS.BOARD_MEMBERS,
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
export const boardMembersService = new BoardMembersService();
export default boardMembersService;
