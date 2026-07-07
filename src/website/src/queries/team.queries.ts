import { useQuery } from '@tanstack/react-query';

import { teamService } from '@/services/website';

import { apiQueryKeys } from './query-keys';

export function useTeamMembers(params?: { page?: number; page_size?: number }) {
  return useQuery({
    queryKey: apiQueryKeys.teamMembers(params),
    queryFn: () => teamService.getTeamMembers({}, params),
  });
}

export function useExternalTeamMembers(params?: {
  page?: number;
  page_size?: number;
}) {
  return useQuery({
    queryKey: apiQueryKeys.externalTeamMembers(params),
    queryFn: () => teamService.getExternalTeamMembers({}, params),
  });
}

export function useTeamBiography(memberId: string | number | null) {
  return useQuery({
    queryKey: apiQueryKeys.teamBiography(memberId),
    queryFn: () => teamService.getTeamBiography(memberId!),
    enabled: memberId !== null,
  });
}

export function useExternalTeamBiography(memberId: string | number | null) {
  return useQuery({
    queryKey: apiQueryKeys.externalTeamBiography(memberId),
    queryFn: () => teamService.getExternalTeamBiography(memberId!),
    enabled: memberId !== null,
  });
}
