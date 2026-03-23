type QueryParams = Record<string, unknown>;

const compactParams = <T extends QueryParams>(params?: T): T | undefined => {
  if (!params) return undefined;

  const entries = Object.entries(params).filter(
    ([, value]) => value !== undefined,
  );

  if (!entries.length) return undefined;

  return Object.fromEntries(entries) as T;
};

const normalizePublicationParams = (params?: {
  page?: number;
  page_size?: number;
  category?: string | string[];
}) => {
  if (!params) return undefined;

  if (Array.isArray(params.category)) {
    return compactParams({ ...params, category: params.category.join(',') });
  }

  return compactParams(params);
};

export const apiQueryKeys = {
  pressArticles: (params?: { page?: number; page_size?: number }) =>
    ['pressArticles', compactParams(params)] as const,
  impactNumbers: () => ['impactNumbers'] as const,
  airQoEvents: (params?: {
    page?: number;
    page_size?: number;
    event_status?: string;
  }) => ['airQoEvents', compactParams(params)] as const,
  cleanAirEvents: (params?: { page?: number; page_size?: number }) =>
    ['cleanAirEvents', compactParams(params)] as const,
  upcomingEvents: (params?: { page?: number; page_size?: number }) =>
    ['upcomingEvents', compactParams(params)] as const,
  pastEvents: (params?: { page?: number; page_size?: number }) =>
    ['pastEvents', compactParams(params)] as const,
  eventDetails: (id: string | null) => ['eventDetails', id] as const,
  highlights: (params?: { page?: number; page_size?: number }) =>
    ['highlights', compactParams(params)] as const,
  careers: (params?: { page?: number; page_size?: number }) =>
    ['careers', compactParams(params)] as const,
  careerDetail: (publicIdentifier: string | null) =>
    ['careerDetails', publicIdentifier] as const,
  departments: (params?: { page?: number; page_size?: number }) =>
    ['departments', compactParams(params)] as const,
  publications: (params?: {
    page?: number;
    page_size?: number;
    category?: string | string[];
  }) => ['publications', normalizePublicationParams(params)] as const,
  boardMembers: (params?: { page?: number; page_size?: number }) =>
    ['boardMembers', compactParams(params)] as const,
  teamMembers: (params?: { page?: number; page_size?: number }) =>
    ['teamMembers', compactParams(params)] as const,
  externalTeamMembers: (params?: { page?: number; page_size?: number }) =>
    ['externalTeamMembers', compactParams(params)] as const,
  teamBiography: (memberId: string | number | null) =>
    ['teamBiography', memberId] as const,
  externalTeamBiography: (memberId: string | number | null) =>
    ['externalTeamBiography', memberId] as const,
  partners: (params?: {
    page?: number;
    page_size?: number;
    featured?: boolean;
  }) => ['partners', compactParams(params)] as const,
  partnerDetails: (publicIdentifier: string | null) =>
    ['partnerDetails', publicIdentifier] as const,
  forumEvents: (params?: { page?: number; page_size?: number }) =>
    ['forumEvents', compactParams(params)] as const,
  forumEventDetails: (uniqueTitle: string | null) =>
    ['forumEventDetails', uniqueTitle] as const,
  forumEventTitles: (params?: { page?: number; page_size?: number }) =>
    ['forumEventTitles', compactParams(params)] as const,
  cleanAirResources: (params?: { page?: number; page_size?: number }) =>
    ['cleanAirResources', compactParams(params)] as const,
  africanCountries: () => ['africanCountries'] as const,
  africanCountryDetail: (countryId: number | null) =>
    ['africanCountryDetail', countryId] as const,
  faqs: (params?: { page?: number; page_size?: number }) =>
    ['faqs', compactParams(params)] as const,
  gridsSummaryExternal: (params?: {
    limit?: number;
    skip?: number;
    page?: number;
    tenant?: string;
    detailLevel?: string;
    search?: string;
    admin_level?: string;
  }) => ['gridsSummaryExternal', compactParams(params)] as const,
  gridsSummaryV2: (params?: {
    limit?: number;
    skip?: number;
    page?: number;
    search?: string;
    admin_level?: string;
  }) => ['gridsSummaryV2', compactParams(params)] as const,
  countriesData: () => ['countriesData'] as const,
  gridsSummary: (params?: {
    limit?: number;
    skip?: number;
    page?: number;
    admin_level?: string;
    search?: string;
  }) => ['gridsSummary', compactParams(params)] as const,
  networkCoverageSummary: (params?: {
    tenant?: string;
    search?: string;
    activeOnly?: boolean;
    types?: string;
  }) => ['networkCoverageSummary', compactParams(params)] as const,
  networkCoverageCountryMonitors: (
    countryId: string | null,
    params?: {
      tenant?: string;
      activeOnly?: boolean;
      types?: string;
    },
  ) =>
    [
      'networkCoverageCountryMonitors',
      countryId,
      compactParams(params),
    ] as const,
  networkCoverageMonitor: (monitorId: string | null) =>
    ['networkCoverageMonitor', monitorId] as const,
  gridRepresentativeReading: (gridId: string | null) =>
    ['gridRepresentativeReading', gridId] as const,
  gridMeasurements: (
    gridId: string | null,
    params?: {
      limit?: number;
      skip?: number;
      page?: number;
      startTime?: string;
      endTime?: string;
      frequency?: string;
    },
  ) => ['gridMeasurements', gridId, compactParams(params)] as const,
  dailyForecast: (siteId: string | null) => ['dailyForecast', siteId] as const,
} as const;
