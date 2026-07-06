import { useQuery } from '@tanstack/react-query';

import { eventsService } from '@/services/website';

import { apiQueryKeys } from './query-keys';

export function useEvents(params?: {
  page?: number;
  page_size?: number;
  event_status?: string;
}) {
  return useQuery({
    queryKey: ['events', params] as const,
    queryFn: () => eventsService.getEvents(params),
  });
}

export function useAirQoEvents(params?: {
  page?: number;
  page_size?: number;
  event_status?: string;
}) {
  return useQuery({
    queryKey: apiQueryKeys.airQoEvents(params),
    queryFn: () => eventsService.getAirQoEvents({}, params),
  });
}

export function useCleanAirEvents(params?: {
  page?: number;
  page_size?: number;
}) {
  return useQuery({
    queryKey: apiQueryKeys.cleanAirEvents(params),
    queryFn: () => eventsService.getCleanAirEvents({}, params),
  });
}

export function useUpcomingEvents(params?: {
  page?: number;
  page_size?: number;
}) {
  return useQuery({
    queryKey: apiQueryKeys.upcomingEvents(params),
    queryFn: () => eventsService.getUpcomingEvents({}, params),
  });
}

export function usePastEvents(params?: { page?: number; page_size?: number }) {
  return useQuery({
    queryKey: apiQueryKeys.pastEvents(params),
    queryFn: () => eventsService.getPastEvents({}, params),
  });
}

export function useFeaturedEvents() {
  return useQuery({
    queryKey: apiQueryKeys.featuredEvents(),
    queryFn: () => eventsService.getFeaturedEvents(),
  });
}

export function useEventDetails(slug: string | null) {
  return useQuery({
    queryKey: apiQueryKeys.eventDetails(slug),
    queryFn: () => eventsService.getEventDetails(slug!),
    enabled: !!slug,
  });
}
