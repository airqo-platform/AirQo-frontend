import { useQuery } from '@tanstack/react-query';

import { partnersService } from '@/services/website';

import { apiQueryKeys } from './query-keys';

export function usePartners(params?: {
  page?: number;
  page_size?: number;
  featured?: boolean;
}) {
  return useQuery({
    queryKey: apiQueryKeys.partners(params),
    queryFn: () => partnersService.getPartners({}, params),
  });
}

export function usePartnerDetails(publicIdentifier: string | null) {
  return useQuery({
    queryKey: apiQueryKeys.partnerDetails(publicIdentifier),
    queryFn: () => partnersService.getPartnerDetails(publicIdentifier!),
    enabled: !!publicIdentifier,
  });
}
