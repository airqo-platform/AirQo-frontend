import BaseApiService, { ServiceOptions } from '../base';

/**
 * Team API Endpoints
 */
const TEAM_ENDPOINTS = {
  TEAM: '/website/api/v2/team-members/',
  EXTERNAL_TEAM: '/website/api/v2/external-team-members/',
  TEAM_BIOGRAPHIES: '/website/api/v2/team-biographies/',
  EXTERNAL_TEAM_BIOGRAPHIES: '/website/api/v2/external-team-biographies/',
} as const;

class TeamService extends BaseApiService {
  constructor() {
    super('TeamService');
  }

  /**
   * Get all team members
   */
  async getTeamMembers(
    options: ServiceOptions = {},
    params: { page?: number; page_size?: number } = {},
  ): Promise<any> {
    const response = await this.get<any>(TEAM_ENDPOINTS.TEAM, params, {
      ...options,
      throwOnError: false,
    });

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

  /**
   * Get external team members
   */
  async getExternalTeamMembers(
    options: ServiceOptions = {},
    params: { page?: number; page_size?: number } = {},
  ): Promise<any> {
    const response = await this.get<any>(TEAM_ENDPOINTS.EXTERNAL_TEAM, params, {
      ...options,
      throwOnError: false,
    });

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

  /**
   * Get team member biography by member ID
   */
  async getTeamBiography(
    memberId: string | number,
    options: ServiceOptions = {},
  ): Promise<any> {
    const response = await this.get<any>(
      `${TEAM_ENDPOINTS.TEAM_BIOGRAPHIES}${memberId}/`,
      {},
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
   * Get external team member biography by member ID
   */
  async getExternalTeamBiography(
    memberId: string | number,
    options: ServiceOptions = {},
  ): Promise<any> {
    const response = await this.get<any>(
      `${TEAM_ENDPOINTS.EXTERNAL_TEAM_BIOGRAPHIES}${memberId}/`,
      {},
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
export const teamService = new TeamService();
export default teamService;
