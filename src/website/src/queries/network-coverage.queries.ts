import { useQuery } from '@tanstack/react-query';

import { networkCoverageService } from '@/services/website';

import { apiQueryKeys } from './query-keys';

export function useNetworkCoverageSummary(params?: {
  tenant?: string;
  search?: string;
  activeOnly?: boolean;
  types?: string;
  network?: string;
}) {
  return useQuery({
    queryKey: apiQueryKeys.networkCoverageSummary(params),
    queryFn: () => networkCoverageService.getNetworkCoverageSummary(params),
  });
}

export function useNetworkCoverageCountryMonitors(
  countryId: string | null,
  params?: {
    tenant?: string;
    activeOnly?: boolean;
    types?: string;
    network?: string;
  },
) {
  return useQuery({
    queryKey: apiQueryKeys.networkCoverageCountryMonitors(countryId, params),
    queryFn: () =>
      networkCoverageService.getNetworkCoverageCountryMonitors(
        countryId!,
        params,
      ),
    enabled: !!countryId,
  });
}

export function useNetworkCoverageMonitor(
  monitorId: string | null,
  params?: { tenant?: string },
) {
  return useQuery({
    queryKey: apiQueryKeys.networkCoverageMonitor(monitorId, params),
    queryFn: () =>
      networkCoverageService.getNetworkCoverageMonitor(monitorId!, params),
    enabled: !!monitorId,
  });
}

export function useNetworkCoverageImpact(params?: {
  tenant?: string;
  activeOnly?: boolean;
  types?: string;
  network?: string;
}) {
  return useQuery({
    queryKey: apiQueryKeys.networkCoverageImpact(params),
    queryFn: () => networkCoverageService.getNetworkCoverageImpact(params),
  });
}

export function useNetworkCoverageCities(params?: { country?: string }) {
  return useQuery({
    queryKey: apiQueryKeys.networkCoverageCities(params),
    queryFn: () => networkCoverageService.getNetworkCoverageCities(params),
  });
}
