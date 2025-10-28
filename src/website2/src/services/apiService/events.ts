import BaseApiService, { ServiceOptions } from '../base';
import { EventV2 } from '../types/api';

/**
 * Events API Endpoints
 */
const EVENTS_ENDPOINTS = {
  EVENTS: '/website/api/v2/events/',
  EVENTS_UPCOMING: '/website/api/v2/events/upcoming',
  EVENTS_PAST: '/website/api/v2/events/past',
} as const;

class EventsService extends BaseApiService {
  constructor() {
    super('EventsService');
  }

  /**
   * Get all events with optional filtering
   */
  async getEvents(
    params: { category?: string; page?: number; page_size?: number } = {},
    options: ServiceOptions = {},
  ): Promise<any> {
    const response = await this.get<any>(EVENTS_ENDPOINTS.EVENTS, params, {
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
   * Get AirQo events
   */
  async getAirQoEvents(
    options: ServiceOptions = {},
    params: { page?: number; page_size?: number; event_status?: string } = {},
  ): Promise<any> {
    return this.getEvents({ ...params, category: 'airqo' }, options);
  }

  /**
   * Get Clean Air events
   */
  async getCleanAirEvents(
    options: ServiceOptions = {},
    params: { page?: number; page_size?: number } = {},
  ): Promise<any> {
    return this.getEvents({ ...params, category: 'cleanair' }, options);
  }

  /**
   * Get upcoming events
   */
  async getUpcomingEvents(
    options: ServiceOptions = {},
    params: { page?: number; page_size?: number } = {},
  ): Promise<any> {
    const response = await this.get<any>(
      EVENTS_ENDPOINTS.EVENTS_UPCOMING,
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
   * Get past events
   */
  async getPastEvents(
    options: ServiceOptions = {},
    params: { page?: number; page_size?: number } = {},
  ): Promise<any> {
    const response = await this.get<any>(EVENTS_ENDPOINTS.EVENTS_PAST, params, {
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
   * Get event details by ID
   */
  async getEventDetails(
    id: string,
    options: ServiceOptions = {},
  ): Promise<EventV2 | null> {
    const response = await this.get<EventV2>(
      `${EVENTS_ENDPOINTS.EVENTS}${id}/`,
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
export const eventsService = new EventsService();
export default eventsService;
