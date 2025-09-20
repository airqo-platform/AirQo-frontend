import {
  AfricanCountry,
  AfricanCountryDetail,
  BoardMember,
  Career,
  CleanAirResource,
  Event,
  FAQ,
  ForumEvent,
  ForumEventDetail,
  ImpactNumber,
  Partner,
  Press,
  Publication,
  QueryParams,
  TeamMember,
} from '../types/api';
import { useApiData, useApiItem, useInfiniteApiData } from './useApiData';

// Board Members
export const useBoardMembers = (params?: QueryParams) =>
  useApiData<BoardMember>('board-members', { params });
export const useInfiniteBoardMembers = (params?: QueryParams) =>
  useInfiniteApiData<BoardMember>('board-members', params);

// Careers
export const useCareers = (params?: QueryParams) =>
  useApiData<Career>('careers', { params });
export const useInfiniteCareers = (params?: QueryParams) =>
  useInfiniteApiData<Career>('careers', params);

// Career Detail (by public_identifier)
export const useCareerDetail = (publicIdentifier: string | null) =>
  useApiItem<Career>(publicIdentifier ? `careers/${publicIdentifier}` : null);

// Events
export const useEvents = (params?: QueryParams) =>
  useApiData<Event>('events', { params });
export const useInfiniteEvents = (params?: QueryParams) =>
  useInfiniteApiData<Event>('events', params);

// Events - Upcoming
export const useUpcomingEvents = (params?: QueryParams) =>
  useApiData<Event>('events/upcoming', { params });
export const useInfiniteUpcomingEvents = (params?: QueryParams) =>
  useInfiniteApiData<Event>('events/upcoming', params);

// Events - Past
export const usePastEvents = (params?: QueryParams) =>
  useApiData<Event>('events/past', { params });
export const useInfinitePastEvents = (params?: QueryParams) =>
  useInfiniteApiData<Event>('events/past', params);

// Team Members
export const useTeamMembers = (params?: QueryParams) =>
  useApiData<TeamMember>('team-members', { params });
export const useInfiniteTeamMembers = (params?: QueryParams) =>
  useInfiniteApiData<TeamMember>('team-members', params);

// Publications
export const usePublications = (params?: QueryParams) =>
  useApiData<Publication>('publications', { params });
export const useInfinitePublications = (params?: QueryParams) =>
  useInfiniteApiData<Publication>('publications', params);

// FAQs
export const useFAQs = (params?: QueryParams) =>
  useApiData<FAQ>('faqs', { params });
export const useInfiniteFAQs = (params?: QueryParams) =>
  useInfiniteApiData<FAQ>('faqs', params);

// Partners
export const usePartners = (params?: QueryParams) =>
  useApiData<Partner>('partners', { params });
export const useInfinitePartners = (params?: QueryParams) =>
  useInfiniteApiData<Partner>('partners', params);

// Partner Detail (by public_identifier)
export const usePartnerDetail = (publicIdentifier: string | null) =>
  useApiItem<Partner>(publicIdentifier ? `partners/${publicIdentifier}` : null);

// Press
export const usePress = (params?: QueryParams) =>
  useApiData<Press>('press', { params });
export const useInfinitePress = (params?: QueryParams) =>
  useInfiniteApiData<Press>('press', params);

// Clean Air Resources
export const useCleanAirResources = (params?: QueryParams) =>
  useApiData<CleanAirResource>('clean-air-resources', { params });
export const useInfiniteCleanAirResources = (params?: QueryParams) =>
  useInfiniteApiData<CleanAirResource>('clean-air-resources', params);

// Impact Numbers
export const useImpactNumbers = (params?: QueryParams) =>
  useApiData<ImpactNumber>('impact-numbers', { params });
export const useInfiniteImpactNumbers = (params?: QueryParams) =>
  useInfiniteApiData<ImpactNumber>('impact-numbers', params);

// Additional endpoints
export const useAfricanCountries = (params?: QueryParams) =>
  useApiData<AfricanCountry>('african-countries', { params });
export const useInfiniteAfricanCountries = (params?: QueryParams) =>
  useInfiniteApiData<AfricanCountry>('african-countries', params);

// African Country Detail (by ID)
export const useAfricanCountryDetail = (countryId: number | null) =>
  useApiItem<AfricanCountryDetail>(
    countryId ? `african-countries/${countryId}` : null,
  );

export const useDepartments = (params?: QueryParams) =>
  useApiData('departments', { params });
export const useForumEvents = (params?: QueryParams) =>
  useApiData<ForumEvent>('forum-events', { params });
export const useInfiniteForumEvents = (params?: QueryParams) =>
  useInfiniteApiData<ForumEvent>('forum-events', params);

// Forum Event Details (by unique_title)
export const useForumEventDetail = (uniqueTitle: string | null) =>
  useApiItem<ForumEventDetail>(
    uniqueTitle ? `forum-events/${uniqueTitle}` : null,
  );
export const useEventInquiries = (params?: QueryParams) =>
  useApiData<any>('event-inquiries', { params }); // TODO: Add EventInquiry type
export const useEventPrograms = (params?: QueryParams) =>
  useApiData<any>('event-programs', { params }); // TODO: Add EventProgram type
export const useEventSessions = (params?: QueryParams) =>
  useApiData<any>('event-sessions', { params }); // TODO: Add EventSession type
export const useEventPartnerLogos = (params?: QueryParams) =>
  useApiData<any>('event-partner-logos', { params }); // TODO: Add EventPartnerLogo type
export const useEventResources = (params?: QueryParams) =>
  useApiData<any>('event-resources', { params }); // TODO: Add EventResource type
export const useExternalTeamMembers = (params?: QueryParams) =>
  useApiData<TeamMember>('external-team-members', { params });
export const useExternalTeamBiographies = (params?: QueryParams) =>
  useApiData<any>('external-team-biographies', { params }); // TODO: Add ExternalTeamBiography type
export const useTags = (params?: QueryParams) =>
  useApiData<any>('tags', { params }); // TODO: Add Tag type
export const useHighlights = (params?: QueryParams) =>
  useApiData<any>('highlights', { params }); // TODO: Add Highlight type
export const usePartnerDescriptions = (params?: QueryParams) =>
  useApiData<any>('partner-descriptions', { params }); // TODO: Add PartnerDescription type
export const useTeamBiographies = (params?: QueryParams) =>
  useApiData<any>('team-biographies', { params }); // TODO: Add TeamBiography type
