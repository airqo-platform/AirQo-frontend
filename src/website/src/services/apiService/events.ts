import BaseApiService, { ServiceOptions } from '../base';
import {
  EventIdentifierPayload,
  EventListResponse,
  EventV2,
} from '../types/api';

/**
 * Events API Endpoints
 */
const EVENTS_ENDPOINTS = {
  EVENTS: '/website/api/v2/events/',
  EVENTS_FEATURED: '/website/api/v2/events/featured/',
  EVENT_BY_SLUG: (slug: string) =>
    `/website/api/v2/events/by-slug/${encodeURIComponent(slug)}/`,
  EVENT_IDENTIFIERS: (slug: string) =>
    `/website/api/v2/events/${encodeURIComponent(slug)}/identifiers/`,
  BULK_IDENTIFIERS: '/website/api/v2/events/bulk-identifiers/',
} as const;

type EventListParams = {
  page?: number;
  page_size?: number;
  event_status?: string;
  event_tag?: string;
  event_category?: string;
  website_category?: string;
  search?: string;
  ordering?: string;
  title?: string;
  title__icontains?: string;
  location_name?: string;
  location_name__icontains?: string;
  start_date?: string;
  start_date__gte?: string;
  start_date__lte?: string;
  end_date?: string;
  end_date__gte?: string;
  end_date__lte?: string;
  date_from?: string;
  date_to?: string;
  start_day?: number;
  start_month?: number;
  start_year?: number;
  order?: number;
  order__gte?: number;
  order__lte?: number;
};

type EventListApiResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: EventV2[];
};

const normalizeEventListResponse = (
  response: EventListApiResponse,
  params: EventListParams,
): EventListResponse => {
  const pageSize = (params.page_size ?? response.results.length) || 10;

  return {
    count: response.count ?? 0,
    next: response.next ?? null,
    previous: response.previous ?? null,
    results: response.results ?? [],
    page_size: pageSize,
    total_pages: Math.max(1, Math.ceil((response.count ?? 0) / pageSize)),
    current_page: params.page ?? 1,
  };
};

const normalizeEventItems = (data: unknown): EventV2[] => {
  if (!data) return [];

  if (Array.isArray(data)) {
    return data as EventV2[];
  }

  if (typeof data === 'object') {
    const record = data as { results?: EventV2[] };
    if (Array.isArray(record.results)) {
      return record.results;
    }

    return [data as EventV2];
  }

  return [];
};

class EventsService extends BaseApiService {
  constructor() {
    super('EventsService');
  }

  /**
   * Get all events with optional filtering
   */
  async getEvents(
    params: EventListParams = {},
    options: ServiceOptions = {},
  ): Promise<EventListResponse> {
    const response = await this.get<EventListApiResponse>(
      EVENTS_ENDPOINTS.EVENTS,
      params,
      {
        ...options,
        throwOnError: false,
      },
    );

    if (response.success) {
      return normalizeEventListResponse(response.data, params);
    }

    return normalizeEventListResponse(
      {
        count: 0,
        next: null,
        previous: null,
        results: [],
      },
      params,
    );
  }

  /**
   * Get AirQo events
   */
  async getAirQoEvents(
    options: ServiceOptions = {},
    params: EventListParams = {},
  ): Promise<EventListResponse> {
    return this.getEvents({ ...params, website_category: 'airqo' }, options);
  }

  /**
   * Get Clean Air events
   */
  async getCleanAirEvents(
    options: ServiceOptions = {},
    params: EventListParams = {},
  ): Promise<EventListResponse> {
    return this.getEvents({ ...params, website_category: 'cleanair' }, options);
  }

  /**
   * Get upcoming events
   */
  async getUpcomingEvents(
    options: ServiceOptions = {},
    params: EventListParams = {},
  ): Promise<EventListResponse> {
    return this.getEvents({ ...params, event_status: 'upcoming' }, options);
  }

  /**
   * Get past events
   */
  async getPastEvents(
    options: ServiceOptions = {},
    params: EventListParams = {},
  ): Promise<EventListResponse> {
    return this.getEvents({ ...params, event_status: 'past' }, options);
  }

  /**
   * Get featured events
   */
  async getFeaturedEvents(options: ServiceOptions = {}): Promise<EventV2[]> {
    const response = await this.get<unknown>(
      EVENTS_ENDPOINTS.EVENTS_FEATURED,
      undefined,
      {
        ...options,
        throwOnError: false,
      },
    );

    return response.success ? normalizeEventItems(response.data) : [];
  }

  /**
   * Get event details by slug
   */
  async getEventDetails(
    slug: string,
    options: ServiceOptions = {},
  ): Promise<EventV2 | null> {
    const candidates = [slug, decodeURIComponent(slug)].filter(Boolean);

    for (const candidate of candidates) {
      const bySlugResponse = await this.get<EventV2>(
        EVENTS_ENDPOINTS.EVENT_BY_SLUG(candidate),
        undefined,
        {
          ...options,
          throwOnError: false,
        },
      );

      if (bySlugResponse.success) {
        return bySlugResponse.data;
      }

      const detailResponse = await this.get<EventV2>(
        `${EVENTS_ENDPOINTS.EVENTS}${encodeURIComponent(candidate)}/`,
        undefined,
        {
          ...options,
          throwOnError: false,
        },
      );

      if (detailResponse.success) {
        return detailResponse.data;
      }

      const identifierResponse = await this.get<EventV2>(
        EVENTS_ENDPOINTS.EVENT_IDENTIFIERS(candidate),
        undefined,
        {
          ...options,
          throwOnError: false,
        },
      );

      if (identifierResponse.success) {
        return identifierResponse.data;
      }
    }

    return null;
  }

  /**
   * Get event identifiers by slug
   */
  async getEventIdentifiers(
    slug: string,
    options: ServiceOptions = {},
  ): Promise<EventV2 | null> {
    const response = await this.get<EventV2>(
      EVENTS_ENDPOINTS.EVENT_IDENTIFIERS(slug),
      undefined,
      {
        ...options,
        throwOnError: false,
      },
    );

    return response.success ? response.data : null;
  }

  /**
   * Create or update bulk identifiers for an event
   */
  async createBulkIdentifiers(
    payload: EventIdentifierPayload,
    options: ServiceOptions = {},
  ): Promise<EventV2 | null> {
    const response = await this.post<EventV2>(
      EVENTS_ENDPOINTS.BULK_IDENTIFIERS,
      payload,
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
