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

/**
 * Custom Hook for fetching data using SWR.
 *
 * @param key - Unique key for the SWR cache. If `null`, SWR will skip fetching.
 * @param fetcher - Function to fetch data.
 * @param initialData - Optional initial data to return while fetching.
 * @returns An object containing the fetched data, loading state, error state, and mutate function.
 */
const useFetch = (
  key: string | null,
  fetcher: () => Promise<any>,
  initialData: any = [],
) => {
  const { data, error, mutate } = useSWR(key, fetcher, swrOptions);
  const isLoading = !data && !error;

  return {
    data: data ?? initialData,
    isLoading,
    isError: error,
    mutate,
  };
};

/** -------------------------------------
 *              PRESS ARTICLES
 * ------------------------------------- */
export const usePressArticles = () =>
  useFetch('pressArticles', getPressArticles, []);

/** -------------------------------------
 *            IMPACT NUMBERS
 * ------------------------------------- */
export const useImpactNumbers = () =>
  useFetch('impactNumbers', getImpactNumbers, {});

/** -------------------------------------
 *               EVENTS
 * ------------------------------------- */
export const useAirQoEvents = () => useFetch('airQoEvents', getAirQoEvents, []);

export const useCleanAirEvents = () =>
  useFetch('cleanAirEvents', getCleanAirEvents, []);

export const useEventDetails = (id: string | null) =>
  useFetch(id ? `eventDetails/${id}` : null, () => getEventDetails(id!), null);

/** -------------------------------------
 *              HIGHLIGHTS
 * ------------------------------------- */
export const useHighlights = () => useFetch('highlights', getHighlights, []);

/** -------------------------------------
 *               CAREERS
 * ------------------------------------- */
export const useCareers = () => useFetch('careers', getCareers, []);

export const useCareerDetails = (id: string | null) =>
  useFetch(
    id ? `careerDetails/${id}` : null,
    () => getCareerDetails(id!),
    null,
  );

/** -------------------------------------
 *             DEPARTMENTS
 * ------------------------------------- */
export const useDepartments = () => useFetch('departments', getDepartments, []);

/** -------------------------------------
 *            PUBLICATIONS
 * ------------------------------------- */
export const usePublications = () =>
  useFetch('publications', getPublications, []);

/** -------------------------------------
 *           BOARD MEMBERS
 * ------------------------------------- */
export const useBoardMembers = () =>
  useFetch('boardMembers', getBoardMembers, []);

/** -------------------------------------
 *            TEAM MEMBERS
 * ------------------------------------- */
export const useTeamMembers = () => useFetch('teamMembers', getTeamMembers, []);

export const useExternalTeamMembers = () =>
  useFetch('externalTeamMembers', getExternalTeamMembers, []);

/** -------------------------------------
 *               PARTNERS
 * ------------------------------------- */
export const usePartners = () => useFetch('partners', getPartners, []);

export const usePartnerDetails = (id: string | null) =>
  useFetch(
    id ? `partnerDetails/${id}` : null,
    () => getPartnerDetails(id!),
    null,
  );

/** -------------------------------------
 *            FORUM EVENTS
 * ------------------------------------- */
export const useForumEvents = () => useFetch('forumEvents', getForumEvents, []);

export const useForumEventDetails = (id: string | null) =>
  useFetch(
    id ? `forumEventDetails/${id}` : null,
    () => getForumEventDetails(id!),
    null,
  );

/** -------------------------------------
 *          CLEAN AIR RESOURCES
 * ------------------------------------- */
export const useCleanAirResources = () =>
  useFetch('cleanAirResources', getCleanAirResources, []);

/** -------------------------------------
 *           AFRICAN COUNTRIES
 * ------------------------------------- */
export const useAfricanCountries = () =>
  useFetch('africanCountries', getAfricanCountries, []);
