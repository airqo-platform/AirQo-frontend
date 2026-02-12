import BaseApiService, { ServiceOptions } from '../base';
import { ForumEventDetail } from '../types/api';

/**
 * Forum Events API Endpoints
 */
const FORUM_EVENTS_ENDPOINTS = {
  FORUM_EVENTS: '/website/api/v2/forum-events/',
  FORUM_EVENT_TITLES: '/website/api/v2/forum-event-titles/',
} as const;

class ForumEventsService extends BaseApiService {
  constructor() {
    super('ForumEventsService');
  }

  /**
   * Get all forum events
   */
  async getForumEvents(
    options: ServiceOptions = {},
    params: { page?: number; page_size?: number } = {},
  ): Promise<any> {
    const response = await this.get<any>(
      FORUM_EVENTS_ENDPOINTS.FORUM_EVENTS,
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

  /**
   * Get forum event details by unique title
   */
  async getForumEventDetails(
    uniqueTitle: string,
    options: ServiceOptions = {},
  ): Promise<ForumEventDetail | null> {
    const response = await this.get<ForumEventDetail>(
      `${FORUM_EVENTS_ENDPOINTS.FORUM_EVENTS}${uniqueTitle}/`,
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

  /**
   * Get forum event titles
   */
  async getForumEventTitles(
    options: ServiceOptions = {},
    params: { page?: number; page_size?: number } = {},
  ): Promise<any> {
    const response = await this.get<any>(
      FORUM_EVENTS_ENDPOINTS.FORUM_EVENT_TITLES,
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
export const forumEventsService = new ForumEventsService();
export default forumEventsService;
