import useSWR from 'swr';
import { SWRConfiguration } from 'swr';

import {
  africanCountriesService,
  boardMembersService,
  careersService,
  cleanAirResourcesService,
  cohortsService,
  departmentsService,
  eventsService,
  externalService,
  faqService,
  forumEventsService,
  gridsService,
  highlightsService,
  impactNumbersService,
  partnersService,
  predictService,
  pressService,
  publicationsService,
  teamService,
} from '../apiService';

// Generic hook for service methods that return data
function useServiceData<T>(
  serviceCall: (() => Promise<T>) | null,
  key: string | null,
  swrOptions?: SWRConfiguration,
) {
  const { data, error, isValidating, mutate } = useSWR<T>(key, serviceCall, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    ...swrOptions,
  });

  return {
    data,
    error: error as any,
    isLoading: !error && !data,
    isValidating,
    mutate,
  };
}

// Press Articles
export const usePressArticles = (params?: {
  page?: number;
  page_size?: number;
}) =>
  useServiceData(
    () => pressService.getPressArticles({}, params || {}),
    `pressArticles-${JSON.stringify(params || {})}`,
  );

// Impact Numbers
export const useImpactNumbers = () =>
  useServiceData(
    () => impactNumbersService.getImpactNumbers(),
    'impactNumbers',
  );

// Events
export const useAirQoEvents = (params?: {
  page?: number;
  page_size?: number;
  event_status?: string;
}) =>
  useServiceData(
    () => eventsService.getAirQoEvents({}, params || {}),
    `airQoEvents-${JSON.stringify(params || {})}`,
  );

export const useCleanAirEvents = (params?: {
  page?: number;
  page_size?: number;
}) =>
  useServiceData(
    () => eventsService.getCleanAirEvents({}, params || {}),
    `cleanAirEvents-${JSON.stringify(params || {})}`,
  );

export const useUpcomingEvents = (params?: {
  page?: number;
  page_size?: number;
}) =>
  useServiceData(
    () => eventsService.getUpcomingEvents({}, params || {}),
    `upcomingEvents-${JSON.stringify(params || {})}`,
  );

export const usePastEvents = (params?: { page?: number; page_size?: number }) =>
  useServiceData(
    () => eventsService.getPastEvents({}, params || {}),
    `pastEvents-${JSON.stringify(params || {})}`,
  );

export const useEventDetails = (id: string | null) =>
  useServiceData(
    id ? () => eventsService.getEventDetails(id) : null,
    id ? `eventDetails/${id}` : null,
  );

// Highlights
export const useHighlights = (params?: { page?: number; page_size?: number }) =>
  useServiceData(
    () => highlightsService.getHighlights({}, params || {}),
    `highlights-${JSON.stringify(params || {})}`,
  );

// Careers
export const useCareers = (params?: { page?: number; page_size?: number }) =>
  useServiceData(
    () => careersService.getCareers({}, params || {}),
    `careers-${JSON.stringify(params || {})}`,
  );

export const useCareerDetail = (publicIdentifier: string | null) =>
  useServiceData(
    publicIdentifier
      ? () => careersService.getCareerDetails(publicIdentifier)
      : null,
    publicIdentifier ? `careerDetails/${publicIdentifier}` : null,
  );

// Departments
export const useDepartments = (params?: {
  page?: number;
  page_size?: number;
}) =>
  useServiceData(
    () => departmentsService.getDepartments({}, params || {}),
    `departments-${JSON.stringify(params || {})}`,
  );

// Publications
export const usePublications = (params?: {
  page?: number;
  page_size?: number;
  category?: string | string[];
}) => {
  const queryParams = params || {};
  if (Array.isArray(queryParams.category)) {
    queryParams.category = queryParams.category.join(',');
  }

  return useServiceData(
    () => publicationsService.getPublications({}, queryParams),
    `publications-${JSON.stringify(queryParams)}`,
  );
};

// Board Members
export const useBoardMembers = (params?: {
  page?: number;
  page_size?: number;
}) =>
  useServiceData(
    () => boardMembersService.getBoardMembers({}, params || {}),
    `boardMembers-${JSON.stringify(params || {})}`,
  );

// Team Members
export const useTeamMembers = (params?: {
  page?: number;
  page_size?: number;
}) =>
  useServiceData(
    () => teamService.getTeamMembers({}, params || {}),
    `teamMembers-${JSON.stringify(params || {})}`,
  );

export const useExternalTeamMembers = (params?: {
  page?: number;
  page_size?: number;
}) =>
  useServiceData(
    () => teamService.getExternalTeamMembers({}, params || {}),
    `externalTeamMembers-${JSON.stringify(params || {})}`,
  );

export const useTeamBiography = (memberId: string | number | null) =>
  useServiceData(
    memberId ? () => teamService.getTeamBiography(memberId) : null,
    memberId ? `teamBiography/${memberId}` : null,
  );

export const useExternalTeamBiography = (memberId: string | number | null) =>
  useServiceData(
    memberId ? () => teamService.getExternalTeamBiography(memberId) : null,
    memberId ? `externalTeamBiography/${memberId}` : null,
  );

// Partners
export const usePartners = (params?: {
  page?: number;
  page_size?: number;
  featured?: boolean;
}) =>
  useServiceData(
    () => partnersService.getPartners({}, params || {}),
    `partners-${JSON.stringify(params || {})}`,
  );

export const usePartnerDetails = (publicIdentifier: string | null) =>
  useServiceData(
    publicIdentifier
      ? () => partnersService.getPartnerDetails(publicIdentifier)
      : null,
    publicIdentifier ? `partnerDetails/${publicIdentifier}` : null,
  );

// Forum Events
export const useForumEvents = (params?: {
  page?: number;
  page_size?: number;
}) =>
  useServiceData(
    () => forumEventsService.getForumEvents({}, params || {}),
    `forumEvents-${JSON.stringify(params || {})}`,
  );

export const useForumEventDetails = (uniqueTitle: string | null) =>
  useServiceData(
    uniqueTitle
      ? () => forumEventsService.getForumEventDetails(uniqueTitle)
      : null,
    uniqueTitle ? `forumEventDetails/${uniqueTitle}` : null,
    {
      keepPreviousData: true,
      revalidateOnFocus: false,
      revalidateIfStale: false,
      dedupingInterval: 3600000, // 1 hour
    },
  );

export const useForumEventTitles = (params?: {
  page?: number;
  page_size?: number;
}) =>
  useServiceData(
    () => forumEventsService.getForumEventTitles({}, params || {}),
    `forumEventTitles-${JSON.stringify(params || {})}`,
  );

// Clean Air Resources
export const useCleanAirResources = (params?: {
  page?: number;
  page_size?: number;
}) =>
  useServiceData(
    () => cleanAirResourcesService.getCleanAirResources({}, params || {}),
    `cleanAirResources-${JSON.stringify(params || {})}`,
  );

// African Countries
export const useAfricanCountries = () =>
  useServiceData(
    () => africanCountriesService.getAfricanCountries(),
    'africanCountries',
  );

export const useAfricanCountryDetail = (countryId: number | null) =>
  useServiceData(
    countryId
      ? () => africanCountriesService.getAfricanCountryDetails(countryId)
      : null,
    countryId ? `africanCountryDetail/${countryId}` : null,
  );

// FAQs
export const useFAQs = (params?: { page?: number; page_size?: number }) =>
  useServiceData(
    () => faqService.getFAQs({}, params || {}),
    `faqs-${JSON.stringify(params || {})}`,
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
  swrOptions?: SWRConfiguration,
) =>
  useServiceData(
    () => externalService.getGridsSummary(params || {}),
    params
      ? `gridsSummaryExternal-${JSON.stringify(params)}`
      : 'gridsSummaryExternal',
    swrOptions,
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
  swrOptions?: SWRConfiguration,
) =>
  useServiceData(
    () => externalService.getGridsSummaryV2(params || {}),
    params ? `gridsSummaryV2-${JSON.stringify(params)}` : 'gridsSummaryV2',
    swrOptions,
  );

export const useCountriesData = () =>
  useServiceData(() => externalService.getCountriesData(), 'countriesData');

// Grids - New endpoints for grid data
export const useGridsSummary = (
  params?: {
    limit?: number;
    skip?: number;
    page?: number;
    admin_level?: string;
    search?: string;
  },
  swrOptions?: SWRConfiguration,
) =>
  useServiceData(
    () => gridsService.getGridsSummary(params || {}),
    params ? `gridsSummary-${JSON.stringify(params)}` : 'gridsSummary',
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      dedupingInterval: 300000, // 5 minutes
      ...swrOptions,
    },
  );

export const useGridRepresentativeReading = (
  gridId: string | null,
  swrOptions?: SWRConfiguration,
) =>
  useServiceData(
    gridId ? () => gridsService.getGridRepresentativeReading(gridId) : null,
    gridId ? `gridRepresentativeReading-${gridId}` : null,
    {
      revalidateOnFocus: false,
      revalidateIfStale: true,
      refreshInterval: 300000, // 5 minutes auto-refresh
      ...swrOptions,
    },
  );

// Cohorts
export const useCohortsSummary = (
  params?: {
    limit?: number;
    skip?: number;
    page?: number;
    search?: string;
  },
  swrOptions?: SWRConfiguration,
) =>
  useServiceData(
    () => cohortsService.getCohortsSummary(params || {}),
    params ? `cohortsSummary-${JSON.stringify(params)}` : 'cohortsSummary',
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      dedupingInterval: 300000, // 5 minutes
      ...swrOptions,
    },
  );

export const useCohortMeasurements = (
  cohortId: string | null,
  params?: {
    limit?: number;
    skip?: number;
    page?: number;
    startTime?: string;
    endTime?: string;
    frequency?: string;
  },
  swrOptions?: SWRConfiguration,
) =>
  useServiceData(
    cohortId
      ? () => cohortsService.getCohortMeasurements(cohortId, params || {})
      : null,
    cohortId
      ? `cohortMeasurements-${cohortId}-${JSON.stringify(params || {})}`
      : null,
    {
      revalidateOnFocus: false,
      revalidateIfStale: true,
      refreshInterval: 300000, // 5 minutes auto-refresh
      ...swrOptions,
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
  swrOptions?: SWRConfiguration,
) =>
  useServiceData(
    gridId
      ? () => gridsService.getGridMeasurements(gridId, params || {})
      : null,
    gridId
      ? `gridMeasurements-${gridId}-${JSON.stringify(params || {})}`
      : null,
    {
      revalidateOnFocus: false,
      revalidateIfStale: true,
      refreshInterval: 300000, // 5 minutes auto-refresh
      ...swrOptions,
    },
  );

// Predict
export const useDailyForecast = (
  siteId: string | null,
  swrOptions?: SWRConfiguration,
) =>
  useServiceData(
    siteId ? () => predictService.getDailyForecast(siteId) : null,
    siteId ? `dailyForecast-${siteId}` : null,
    {
      revalidateOnFocus: false,
      revalidateIfStale: true,
      refreshInterval: 3600000, // 1 hour auto-refresh for forecasts
      ...swrOptions,
    },
  );
