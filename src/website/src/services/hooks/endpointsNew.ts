import {
  keepPreviousData,
  type QueryKey,
  useQuery,
  type UseQueryOptions,
  type UseQueryResult,
} from '@tanstack/react-query';

import {
  africanCountriesService,
  boardMembersService,
  careersService,
  cleanAirResourcesService,
  departmentsService,
  eventsService,
  externalService,
  faqService,
  forumEventsService,
  gridsService,
  highlightsService,
  impactNumbersService,
  networkCoverageService,
  partnersService,
  predictService,
  pressService,
  publicationsService,
  teamService,
} from '../apiService';
import { apiQueryKeys } from '../queryKeys';

type ServiceQueryOptions<T> = Omit<
  UseQueryOptions<T, Error, T, QueryKey>,
  'queryKey' | 'queryFn'
>;

type ServiceQueryResult<T> = {
  data: T | undefined;
  error: Error | null;
  isLoading: boolean;
  isFetching: boolean;
  isValidating: boolean;
  isSuccess: boolean;
  refetch: UseQueryResult<T, Error>['refetch'];
};

function useServiceQuery<T>(
  queryKey: QueryKey,
  queryFn: () => Promise<T>,
  queryOptions?: ServiceQueryOptions<T>,
): ServiceQueryResult<T> {
  const query = useQuery<T, Error, T, QueryKey>({
    queryKey,
    queryFn,
    ...queryOptions,
  });

  return {
    data: query.data,
    error: query.error ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isValidating: query.isFetching,
    isSuccess: query.isSuccess,
    refetch: query.refetch,
  };
}

// Press Articles
export const usePressArticles = (params?: {
  page?: number;
  page_size?: number;
}) =>
  useServiceQuery(
    apiQueryKeys.pressArticles(params),
    () => pressService.getPressArticles({}, params || {}),
    {
      staleTime: 15 * 60 * 1000,
    },
  );

// Impact Numbers
export const useImpactNumbers = () =>
  useServiceQuery(
    apiQueryKeys.impactNumbers(),
    () => impactNumbersService.getImpactNumbers(),
    {
      staleTime: 60 * 60 * 1000,
    },
  );

// Events
export const useAirQoEvents = (params?: {
  page?: number;
  page_size?: number;
  event_status?: string;
}) =>
  useServiceQuery(
    apiQueryKeys.airQoEvents(params),
    () => eventsService.getAirQoEvents({}, params || {}),
    {
      staleTime: 10 * 60 * 1000,
    },
  );

export const useCleanAirEvents = (params?: {
  page?: number;
  page_size?: number;
}) =>
  useServiceQuery(
    apiQueryKeys.cleanAirEvents(params),
    () => eventsService.getCleanAirEvents({}, params || {}),
    {
      staleTime: 10 * 60 * 1000,
    },
  );

export const useUpcomingEvents = (params?: {
  page?: number;
  page_size?: number;
}) =>
  useServiceQuery(
    apiQueryKeys.upcomingEvents(params),
    () => eventsService.getUpcomingEvents({}, params || {}),
    {
      staleTime: 10 * 60 * 1000,
    },
  );

export const usePastEvents = (params?: { page?: number; page_size?: number }) =>
  useServiceQuery(
    apiQueryKeys.pastEvents(params),
    () => eventsService.getPastEvents({}, params || {}),
    {
      staleTime: 10 * 60 * 1000,
    },
  );

export const useEventDetails = (id: string | null) =>
  useServiceQuery(
    apiQueryKeys.eventDetails(id),
    () => eventsService.getEventDetails(id as string),
    {
      enabled: !!id,
      staleTime: 30 * 60 * 1000,
    },
  );

// Highlights
export const useHighlights = (params?: { page?: number; page_size?: number }) =>
  useServiceQuery(
    apiQueryKeys.highlights(params),
    () => highlightsService.getHighlights({}, params || {}),
    {
      staleTime: 15 * 60 * 1000,
    },
  );

// Careers
export const useCareers = (params?: { page?: number; page_size?: number }) =>
  useServiceQuery(
    apiQueryKeys.careers(params),
    () => careersService.getCareers({}, params || {}),
    {
      staleTime: 15 * 60 * 1000,
    },
  );

export const useCareerDetail = (publicIdentifier: string | null) =>
  useServiceQuery(
    apiQueryKeys.careerDetail(publicIdentifier),
    () => careersService.getCareerDetails(publicIdentifier as string),
    {
      enabled: !!publicIdentifier,
      staleTime: 30 * 60 * 1000,
    },
  );

// Departments
export const useDepartments = (params?: {
  page?: number;
  page_size?: number;
}) =>
  useServiceQuery(
    apiQueryKeys.departments(params),
    () => departmentsService.getDepartments({}, params || {}),
    {
      staleTime: 30 * 60 * 1000,
    },
  );

// Publications
export const usePublications = (params?: {
  page?: number;
  page_size?: number;
  category?: string | string[];
}) => {
  const queryParams = params
    ? Array.isArray(params.category)
      ? { ...params, category: params.category.join(',') }
      : params
    : {};

  return useServiceQuery(
    apiQueryKeys.publications(params),
    () => publicationsService.getPublications({}, queryParams),
    {
      staleTime: 30 * 60 * 1000,
    },
  );
};

// Board Members
export const useBoardMembers = (params?: {
  page?: number;
  page_size?: number;
}) =>
  useServiceQuery(
    apiQueryKeys.boardMembers(params),
    () => boardMembersService.getBoardMembers({}, params || {}),
    {
      staleTime: 60 * 60 * 1000,
    },
  );

// Team Members
export const useTeamMembers = (params?: {
  page?: number;
  page_size?: number;
}) =>
  useServiceQuery(
    apiQueryKeys.teamMembers(params),
    () => teamService.getTeamMembers({}, params || {}),
    {
      staleTime: 60 * 60 * 1000,
    },
  );

export const useExternalTeamMembers = (params?: {
  page?: number;
  page_size?: number;
}) =>
  useServiceQuery(
    apiQueryKeys.externalTeamMembers(params),
    () => teamService.getExternalTeamMembers({}, params || {}),
    {
      staleTime: 60 * 60 * 1000,
    },
  );

export const useTeamBiography = (memberId: string | number | null) =>
  useServiceQuery(
    apiQueryKeys.teamBiography(memberId),
    () => teamService.getTeamBiography(memberId as string | number),
    {
      enabled: !!memberId,
      staleTime: 60 * 60 * 1000,
    },
  );

export const useExternalTeamBiography = (memberId: string | number | null) =>
  useServiceQuery(
    apiQueryKeys.externalTeamBiography(memberId),
    () => teamService.getExternalTeamBiography(memberId as string | number),
    {
      enabled: !!memberId,
      staleTime: 60 * 60 * 1000,
    },
  );

// Partners
export const usePartners = (params?: {
  page?: number;
  page_size?: number;
  featured?: boolean;
}) =>
  useServiceQuery(
    apiQueryKeys.partners(params),
    () => partnersService.getPartners({}, params || {}),
    {
      staleTime: 60 * 60 * 1000,
    },
  );

export const usePartnerDetails = (publicIdentifier: string | null) =>
  useServiceQuery(
    apiQueryKeys.partnerDetails(publicIdentifier),
    () => partnersService.getPartnerDetails(publicIdentifier as string),
    {
      enabled: !!publicIdentifier,
      staleTime: 60 * 60 * 1000,
    },
  );

// Forum Events
export const useForumEvents = (params?: {
  page?: number;
  page_size?: number;
}) =>
  useServiceQuery(
    apiQueryKeys.forumEvents(params),
    () => forumEventsService.getForumEvents({}, params || {}),
    {
      staleTime: 30 * 60 * 1000,
    },
  );

export const useForumEventDetails = (uniqueTitle: string | null) =>
  useServiceQuery(
    apiQueryKeys.forumEventDetails(uniqueTitle),
    () => forumEventsService.getForumEventDetails(uniqueTitle as string),
    {
      enabled: !!uniqueTitle,
      staleTime: 60 * 60 * 1000,
      placeholderData: keepPreviousData,
    },
  );

export const useForumEventTitles = (params?: {
  page?: number;
  page_size?: number;
}) =>
  useServiceQuery(
    apiQueryKeys.forumEventTitles(params),
    () => forumEventsService.getForumEventTitles({}, params || {}),
    {
      staleTime: 30 * 60 * 1000,
    },
  );

// Clean Air Resources
export const useCleanAirResources = (params?: {
  page?: number;
  page_size?: number;
}) =>
  useServiceQuery(
    apiQueryKeys.cleanAirResources(params),
    () => cleanAirResourcesService.getCleanAirResources({}, params || {}),
    {
      staleTime: 60 * 60 * 1000,
    },
  );

// African Countries
export const useAfricanCountries = () =>
  useServiceQuery(
    apiQueryKeys.africanCountries(),
    () => africanCountriesService.getAfricanCountries(),
    {
      staleTime: 24 * 60 * 60 * 1000,
    },
  );

export const useAfricanCountryDetail = (countryId: number | null) =>
  useServiceQuery(
    apiQueryKeys.africanCountryDetail(countryId),
    () => africanCountriesService.getAfricanCountryDetails(countryId as number),
    {
      enabled: !!countryId,
      staleTime: 24 * 60 * 60 * 1000,
    },
  );

// FAQs
export const useFAQs = (params?: { page?: number; page_size?: number }) =>
  useServiceQuery(
    apiQueryKeys.faqs(params),
    () => faqService.getFAQs({}, params || {}),
    {
      staleTime: 60 * 60 * 1000,
    },
  );

// External Services (for user interactions)
// Note: This is the legacy external service version - prefer using the gridsService version below
export const useGridsSummaryExternal = (
  params?: {
    limit?: number;
    skip?: number;
    page?: number;
    tenant?: string;
    detailLevel?: string;
    search?: string;
    admin_level?: string;
  },
  queryOptions?: ServiceQueryOptions<any>,
) =>
  useServiceQuery(
    apiQueryKeys.gridsSummaryExternal(params),
    () => externalService.getGridsSummary(params || {}),
    {
      staleTime: 5 * 60 * 1000,
      ...queryOptions,
    },
  );

// New enhanced grids summary hook with v2 endpoint
export const useGridsSummaryV2 = (
  params?: {
    limit?: number;
    skip?: number;
    page?: number;
    search?: string;
    admin_level?: string;
  },
  queryOptions?: ServiceQueryOptions<any>,
) =>
  useServiceQuery(
    apiQueryKeys.gridsSummaryV2(params),
    () => externalService.getGridsSummaryV2(params || {}),
    {
      staleTime: 5 * 60 * 1000,
      ...queryOptions,
    },
  );

export const useCountriesData = () =>
  useServiceQuery(
    apiQueryKeys.countriesData(),
    () => externalService.getCountriesData(),
    {
      staleTime: 24 * 60 * 60 * 1000,
    },
  );

// Grids - New endpoints for grid data
export const useGridsSummary = (
  params?: {
    limit?: number;
    skip?: number;
    page?: number;
    admin_level?: string;
    search?: string;
  },
  queryOptions?: ServiceQueryOptions<any>,
) =>
  useServiceQuery(
    apiQueryKeys.gridsSummary(params),
    () => gridsService.getGridsSummary(params || {}, { timeout: 15000 }),
    {
      enabled: !!params,
      staleTime: 5 * 60 * 1000,
      ...queryOptions,
    },
  );

export const useNetworkCoverageSummary = (
  params?: {
    tenant?: string;
    search?: string;
    activeOnly?: boolean;
    types?: string;
  },
  queryOptions?: ServiceQueryOptions<any>,
) =>
  useServiceQuery(
    apiQueryKeys.networkCoverageSummary(params),
    () => networkCoverageService.getNetworkCoverageSummary(params || {}),
    {
      staleTime: 15 * 60 * 1000,
      placeholderData: keepPreviousData,
      ...queryOptions,
    },
  );

export const useNetworkCoverageCountryMonitors = (
  countryId: string | null,
  params?: {
    tenant?: string;
    activeOnly?: boolean;
    types?: string;
  },
  queryOptions?: ServiceQueryOptions<any>,
) =>
  useServiceQuery(
    apiQueryKeys.networkCoverageCountryMonitors(countryId, params),
    () =>
      networkCoverageService.getNetworkCoverageCountryMonitors(
        countryId as string,
        params || {},
      ),
    {
      enabled: !!countryId,
      staleTime: 15 * 60 * 1000,
      ...queryOptions,
    },
  );

export const useNetworkCoverageMonitor = (
  monitorId: string | null,
  params?: {
    tenant?: string;
  },
  queryOptions?: ServiceQueryOptions<any>,
) =>
  useServiceQuery(
    apiQueryKeys.networkCoverageMonitor(monitorId, params),
    () =>
      networkCoverageService.getNetworkCoverageMonitor(
        monitorId as string,
        params || {},
      ),
    {
      enabled: !!monitorId,
      staleTime: 30 * 60 * 1000,
      ...queryOptions,
    },
  );

export const useGridRepresentativeReading = (
  gridId: string | null,
  queryOptions?: ServiceQueryOptions<any>,
) =>
  useServiceQuery(
    apiQueryKeys.gridRepresentativeReading(gridId),
    () =>
      gridsService.getGridRepresentativeReading(gridId as string, {
        timeout: 10000,
      }),
    {
      enabled: !!gridId,
      staleTime: 5 * 60 * 1000,
      refetchInterval: 5 * 60 * 1000,
      ...queryOptions,
    },
  );

// Grid Measurements
export const useGridMeasurements = (
  gridId: string | null,
  params?: {
    limit?: number;
    skip?: number;
    page?: number;
    startTime?: string;
    endTime?: string;
    frequency?: string;
  },
  queryOptions?: ServiceQueryOptions<any>,
) =>
  useServiceQuery(
    apiQueryKeys.gridMeasurements(gridId, params),
    () =>
      gridsService.getGridMeasurements(gridId as string, params || {}, {
        timeout: 15000,
      }),
    {
      enabled: !!gridId,
      staleTime: 5 * 60 * 1000,
      refetchInterval: 5 * 60 * 1000,
      ...queryOptions,
    },
  );

// Predict
export const useDailyForecast = (
  siteId: string | null,
  queryOptions?: ServiceQueryOptions<any>,
) =>
  useServiceQuery(
    apiQueryKeys.dailyForecast(siteId),
    () => predictService.getDailyForecast(siteId as string, { timeout: 10000 }),
    {
      enabled: !!siteId,
      staleTime: 60 * 60 * 1000,
      refetchInterval: 60 * 60 * 1000,
      ...queryOptions,
    },
  );
