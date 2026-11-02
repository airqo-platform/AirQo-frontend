import { normalizeListResponse } from '@/lib/utils/listResponseNormalizer';
import { BaseApiService, ServiceOptions } from '@/services/api';
import {
  EventIdentifierPayload,
  EventListResponse,
  EventV2,
} from '@/types/api';

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

export interface EventDetailsResult {
  event: EventV2 | null;
  notFound: boolean;
}

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
      return normalizeListResponse(response.data, params);
    }

    return normalizeListResponse(
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
    const result = await this.getEventDetailsResult(slug, options);
    return result.event;
  }

  /**
   * Resolve an event and distinguish a confirmed missing record from a
   * transient API failure across the supported lookup endpoints.
   */
  async getEventDetailsResult(
    slug: string,
    options: ServiceOptions = {},
  ): Promise<EventDetailsResult> {
    const candidates = Array.from(
      new Set([slug, decodeURIComponent(slug)].filter(Boolean)),
    );
    let allLookupsNotFound = candidates.length > 0;

    for (const candidate of candidates) {
      const endpoints = [
        EVENTS_ENDPOINTS.EVENT_BY_SLUG(candidate),
        `${EVENTS_ENDPOINTS.EVENTS}${encodeURIComponent(candidate)}/`,
        EVENTS_ENDPOINTS.EVENT_IDENTIFIERS(candidate),
      ];

      for (const endpoint of endpoints) {
        const response = await this.get<EventV2>(endpoint, undefined, {
          ...options,
          throwOnError: false,
        });

        if (response.success) {
          return { event: response.data, notFound: false };
        }

        if (response.statusCode !== 404) {
          allLookupsNotFound = false;
        }
      }
    }

    return { event: null, notFound: allLookupsNotFound };
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
