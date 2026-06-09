import { useQuery, useMutation, useQueryClient, useInfiniteQuery, type QueryFunctionContext } from "@tanstack/react-query";
import {
  ApproximateCoordinatesResponse,
  GetSitesSummaryParams,
  SitesSummaryResponse,
  CreateSiteResponse,
  SiteRefreshResponse,
} from "../apis/sites";
import { adapter } from '../adapters';
import { DeviceActivitiesResponse } from "../apis/devices";
import { useGroupCohorts } from "./useCohorts";
import { useAppSelector } from "../redux/hooks";
import { useMemo } from "react";
import { AxiosError } from "axios";

interface ErrorResponse {
  message: string;
  errors?: {
    message: string;
  };
}

export interface SiteListingOptions {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  order?: "asc" | "desc";
  network?: string;
  status?: string;
}

export const useSiteActivitiesInfinite = (siteId: string) => {
  return useInfiniteQuery<DeviceActivitiesResponse, AxiosError<ErrorResponse>>({
      queryKey: ["siteActivities", siteId],
      queryFn: ({ pageParam = 1 }) => adapter.getSiteActivities(siteId, { page: pageParam as number, limit: 10 }),
      getNextPageParam: (lastPage, allPages) => {
          if (!lastPage.meta) {
            if (!lastPage.site_activities || lastPage.site_activities.length < 10) return undefined;
            return allPages.length + 1;
          }
          if (lastPage.meta.page < lastPage.meta.totalPages) {
              return lastPage.meta.page + 1;
          }
          return undefined;
      },
      enabled: !!siteId,
      staleTime: 60_000,
      initialPageParam: 1,
  });
};

export const useSites = (options: SiteListingOptions = {}) => {
  const activeGroup = useAppSelector((state) => state.user.activeGroup);
  const isAirQoGroup = activeGroup?.grp_title === "airqo";

  const { data: groupCohortIds, isLoading: isLoadingCohorts } = useGroupCohorts(activeGroup?._id, {
    enabled: !isAirQoGroup && !!activeGroup?._id,
  });

  const { page = 1, limit = 100, search, sortBy, order, network } = options;
  const safePage = Math.max(1, page);
  const safeLimit = Math.max(1, limit);
  const skip = (safePage - 1) * safeLimit;

  const queryParams = useMemo(() => ({ page, limit, search, sortBy, order, status: options.status }), [page, limit, search, sortBy, order, options.status]);
  
  const sitesQuery = useQuery<SitesSummaryResponse, AxiosError<ErrorResponse>>({
    queryKey: ["sites", network, activeGroup?.grp_title, queryParams],
    queryFn: async ({ signal }: QueryFunctionContext) => {
      if (isAirQoGroup) {
        const params: GetSitesSummaryParams = {
          network: network || "",
          group: "",
          limit: safeLimit,
          skip,
          ...(search && { search }),
          ...(sortBy && { sortBy }),
          ...(order && { order }),
        };

        if (options.status) {
            return adapter.getSitesByStatus({
                status: options.status,
                ...params
            });
        }
        return adapter.getSites(params, signal);
      }

      if (!groupCohortIds) {
        throw new Error("Cohort IDs are not available yet.");
      }

      return adapter.getSitesByCohorts({
        cohort_ids: groupCohortIds,
        limit: safeLimit,
        skip,
        ...(search && { search }),
        ...(sortBy && { sortBy }),
        ...(order && { order }),
        ...(network && { network }),
      }, signal);
    },
    enabled: !!activeGroup?.grp_title && (isAirQoGroup || (!!groupCohortIds && groupCohortIds.length > 0)),
    staleTime: 300_000,
    refetchOnWindowFocus: false,
  });

  return {
    data: sitesQuery.data,
    sites: sitesQuery.data?.sites || [],
    meta: sitesQuery.data?.meta,
    isLoading: sitesQuery.isLoading || isLoadingCohorts,
    isFetching: sitesQuery.isFetching,
    error: sitesQuery.error,
  };
};

export const useSiteStatistics = (network?: string) => {
    const activeGroup = useAppSelector((state) => state.user.activeGroup);

    const query = useQuery({
        queryKey: ["sites-count-summary", network, activeGroup?.grp_title],
        queryFn: () => adapter.getSitesSummaryCount({ network: network || "" }),
        enabled: !!activeGroup?.grp_title,
        staleTime: 300_000, 
    });

    return {
        summary: query.data?.summary,
        isLoading: query.isLoading,
        error: query.error
    };
};

interface UseApproximateCoordinatesOptions {
  onSuccess?: (data: ApproximateCoordinatesResponse) => void;
  onError?: (error: AxiosError<ErrorResponse>) => void;
}

export const useApproximateCoordinates = (options?: UseApproximateCoordinatesOptions) => {
  const {
    mutate: getApproximateCoordinates,
    data: approximateCoordinates,
    isPending,
    error,
  } = useMutation<
    ApproximateCoordinatesResponse,
    AxiosError<ErrorResponse>,
    { latitude: string; longitude: string }
  >({
    mutationFn: ({ latitude, longitude }) =>
      adapter.getApproximateCoordinates(latitude, longitude),
    onSuccess: (data) => {
      try { options?.onSuccess?.(data); } catch (e) { console.error(e); }
    },
    onError: (error) => {
      try { options?.onError?.(error); } catch (e) { console.error(e); }
    },
  });

  return {
    getApproximateCoordinates,
    approximateCoordinates,
    isPending,
    error: error as AxiosError<ErrorResponse> | null,
  };
};

interface UseSiteDetailsOptions {
  enabled?: boolean;
}

export const useSiteDetails = (
  siteId: string,
  options: UseSiteDetailsOptions = {}
) => {
  const { enabled = true } = options;

  return useQuery({
    queryKey: ["site-details", siteId],
    queryFn: async () => {
      const response = await adapter.getSite(siteId);
      return response.data;
    },
    enabled: !!siteId && enabled,
  });
};

interface UseUpdateSiteDetailsOptions {
  onSuccess?: () => void;
  onError?: (error: AxiosError<ErrorResponse>) => void;
}

export const useUpdateSiteDetails = (options?: UseUpdateSiteDetailsOptions) => {
  const queryClient = useQueryClient();

  return useMutation<
    unknown,
    AxiosError<ErrorResponse>,
    { siteId: string; data: Record<string, string | number | boolean | undefined> }
  >({
    mutationFn: async ({ siteId, data }: { siteId: string; data: Record<string, string | number | boolean | undefined> }) => {
      const cleanedData = Object.fromEntries(
        Object.entries(data).filter(([, value]) => value !== undefined)
      );

      return adapter.updateSiteDetails(siteId, cleanedData);
    },
    onSuccess: (_data, { siteId }) => {
      queryClient.invalidateQueries({ queryKey: ["site-details", siteId] });
      queryClient.invalidateQueries({ queryKey: ["sites"] });
      try { options?.onSuccess?.(); } catch (e) { console.error(e); }
    },
    onError: (error) => {
      try { options?.onError?.(error); } catch (e) { console.error(e); }
    },
  });
};

interface CreateSiteRequest {
  name: string;
  latitude: string;
  longitude: string;
  network: string;
  group: string;
}

interface UseCreateSiteOptions {
  onSuccess?: (data: CreateSiteResponse, variables: CreateSiteRequest) => void;
  onError?: (error: AxiosError<ErrorResponse>) => void;
}

export const useCreateSite = (options?: UseCreateSiteOptions) => {
  const queryClient = useQueryClient();
  const activeGroup = useAppSelector((state) => state.user.activeGroup);

  return useMutation<CreateSiteResponse, AxiosError<ErrorResponse>, CreateSiteRequest>({
    mutationFn: async (data: CreateSiteRequest) => {
      const createdSite = await adapter.createSite(data);
      const siteId = createdSite?.site?._id;

      if (siteId && activeGroup?.grp_title) {
        await adapter.bulkUpdate({
          siteIds: [siteId],
          updateData: {
            groups: [activeGroup.grp_title],
          },
        });
      } else if (!siteId) {
        throw new Error("Site created but its ID was not found in the response.");
      }

      return createdSite;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["sites"] });
      try { options?.onSuccess?.(data, variables); } catch (e) { console.error(e); }
    },
    onError: (error) => {
      try { options?.onError?.(error); } catch (e) { console.error(e); }
    },
  });
};

interface UseRefreshSiteMetadataOptions {
  onSuccess?: (data: SiteRefreshResponse) => void;
  onError?: (error: AxiosError<ErrorResponse>) => void;
}

export const useRefreshSiteMetadata = (options?: UseRefreshSiteMetadataOptions) => {
  const queryClient = useQueryClient();

  return useMutation<SiteRefreshResponse, AxiosError<ErrorResponse>, string>({
    mutationFn: (siteId: string) => adapter.refreshSiteMetadata(siteId),
    onSuccess: (data, siteId) => {
      queryClient.setQueryData(["site-details", siteId], data.site);
      queryClient.invalidateQueries({ queryKey: ["sites"] });
      queryClient.invalidateQueries({ queryKey: ["site-details", siteId] });
      try { options?.onSuccess?.(data); } catch (e) { console.error(e); }
    },
    onError: (error) => {
      try { options?.onError?.(error); } catch (e) { console.error(e); }
    },
  });
};
