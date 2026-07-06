import { useQuery } from '@tanstack/react-query';

import { careersService } from '@/services/website';

import { apiQueryKeys } from './query-keys';

export function useCareers(params?: { page?: number; page_size?: number }) {
  return useQuery({
    queryKey: apiQueryKeys.careers(params),
    queryFn: () => careersService.getCareers({}, params),
  });
}

export function useCareerDetails(publicIdentifier: string | null) {
  return useQuery({
    queryKey: apiQueryKeys.careerDetail(publicIdentifier),
    queryFn: () => careersService.getCareerDetails(publicIdentifier!),
    enabled: !!publicIdentifier,
  });
}
