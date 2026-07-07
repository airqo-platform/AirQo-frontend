import { useQuery } from '@tanstack/react-query';

import { forumEventsService } from '@/services/website';

import { apiQueryKeys } from './query-keys';

export function useForumEvents(params?: { page?: number; page_size?: number }) {
  return useQuery({
    queryKey: apiQueryKeys.forumEvents(params),
    queryFn: () => forumEventsService.getForumEvents({}, params),
  });
}

export function useForumEventDetails(uniqueTitle: string | null) {
  return useQuery({
    queryKey: apiQueryKeys.forumEventDetails(uniqueTitle),
    queryFn: () => forumEventsService.getForumEventDetails(uniqueTitle!),
    enabled: !!uniqueTitle,
  });
}

export function useForumEventTitles(params?: {
  page?: number;
  page_size?: number;
}) {
  return useQuery({
    queryKey: apiQueryKeys.forumEventTitles(params),
    queryFn: () => forumEventsService.getForumEventTitles({}, params),
  });
}
