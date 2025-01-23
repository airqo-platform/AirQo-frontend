import useSWR from 'swr';

import {
  getAfricanCountries,
  getAirQoEvents,
  getBoardMembers,
  getCareerDetails,
  getCareers,
  getCleanAirEvents,
  getCleanAirResources,
  getDepartments,
  getEventDetails,
  getExternalTeamMembers,
  getForumEventDetails,
  getForumEvents,
  getHighlights,
  getImpactNumbers,
  getPartnerDetails,
  getPartners,
  getPressArticles,
  getPublications,
  getTeamMembers,
} from '@/services/apiService';

import { swrOptions } from './swrConfig';

export function usePressArticles() {
  const { data, error, isLoading, mutate } = useSWR(
    'pressArticles',
    getPressArticles,
    swrOptions,
  );
  return {
    pressArticles: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}

export function useImpactNumbers() {
  const { data, error, isLoading, mutate } = useSWR(
    'impactNumbers',
    getImpactNumbers,
    swrOptions,
  );
  return {
    impactNumbers: data || {},
    isLoading,
    isError: error,
    mutate,
  };
}

export function useAirQoEvents() {
  const { data, error, isLoading, mutate } = useSWR(
    'airQoEvents',
    getAirQoEvents,
    swrOptions,
  );
  return {
    airQoEvents: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}

export function useCleanAirEvents() {
  const { data, error, isLoading, mutate } = useSWR(
    'cleanAirEvents',
    getCleanAirEvents,
    swrOptions,
  );
  return {
    cleanAirEvents: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}

export function useEventDetails(id: any) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `eventDetails/${id}` : null,
    () => getEventDetails(id),
    swrOptions,
  );
  return {
    eventDetails: data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useHighlights() {
  const { data, error, isLoading, mutate } = useSWR(
    'highlights',
    getHighlights,
    swrOptions,
  );
  return {
    highlights: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}

export function useCareers() {
  const { data, error, isLoading, mutate } = useSWR(
    'careers',
    getCareers,
    swrOptions,
  );
  return {
    careers: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}

export function useCareerDetails(id: any) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `careerDetails/${id}` : null,
    () => getCareerDetails(id),
    swrOptions,
  );
  return {
    careerDetails: data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useDepartments() {
  const { data, error, isLoading, mutate } = useSWR(
    'departments',
    getDepartments,
    swrOptions,
  );
  return {
    departments: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}

export function usePublications() {
  const { data, error, isLoading, mutate } = useSWR(
    'publications',
    getPublications,
    swrOptions,
  );
  return {
    publications: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}

export function useBoardMembers() {
  const { data, error, isLoading, mutate } = useSWR(
    'boardMembers',
    getBoardMembers,
    swrOptions,
  );
  return {
    boardMembers: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}

export function useTeamMembers() {
  const { data, error, isLoading, mutate } = useSWR(
    'teamMembers',
    getTeamMembers,
    swrOptions,
  );
  return {
    teamMembers: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}

export function useExternalTeamMembers() {
  const { data, error, isLoading, mutate } = useSWR(
    'externalTeamMembers',
    getExternalTeamMembers,
    swrOptions,
  );
  return {
    externalTeamMembers: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}

export function usePartners() {
  const { data, error, isLoading, mutate } = useSWR(
    'partners',
    getPartners,
    swrOptions,
  );
  return {
    partners: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}

export function usePartnerDetails(id: any) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `partnerDetails/${id}` : null,
    () => getPartnerDetails(id),
    swrOptions,
  );
  return {
    partnerDetails: data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useForumEvents() {
  const { data, error, isLoading, mutate } = useSWR(
    'forumEvents',
    getForumEvents,
    swrOptions,
  );
  return {
    forumEvents: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}

export function useForumEventDetails(id: any) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `forumEventDetails/${id}` : null,
    () => getForumEventDetails(id),
    swrOptions,
  );
  return {
    forumEventDetails: data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useCleanAirResources() {
  const { data, error, isLoading, mutate } = useSWR(
    'cleanAirResources',
    getCleanAirResources,
    swrOptions,
  );
  return {
    cleanAirResources: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}

export function useAfricanCountries() {
  const { data, error, isLoading, mutate } = useSWR(
    'africanCountries',
    getAfricanCountries,
    swrOptions,
  );
  return {
    africanCountries: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}
