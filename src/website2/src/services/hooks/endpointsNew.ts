import useSWR from 'swr';
import { SWRConfiguration } from 'swr';

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
  highlightsService,
  impactNumbersService,
  partnersService,
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

// Partners
export const usePartners = (params?: { page?: number; page_size?: number }) =>
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
export const useGridsSummary = () =>
  useServiceData(() => externalService.getGridsSummary(), 'gridsSummary');

export const useCountriesData = () =>
  useServiceData(() => externalService.getCountriesData(), 'countriesData');
