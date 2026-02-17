import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { sites, ApproximateCoordinatesResponse, GetSitesSummaryParams, SitesSummaryResponse, CreateSiteResponse } from "../apis/sites";
import { DeviceActivitiesResponse } from "../apis/devices";

import { useGroupCohorts } from "./useCohorts";
import { useAppSelector } from "../redux/hooks";
import ReusableToast from "@/components/shared/toast/ReusableToast";
import { AxiosError } from "axios";
import { getApiErrorMessage } from "../utils/getApiErrorMessage";

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
      queryFn: ({ pageParam = 1 }) => sites.getSiteActivities(siteId, { page: pageParam as number, limit: 10 }),
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

  const sitesQuery = useQuery<SitesSummaryResponse, AxiosError<ErrorResponse>>({
    queryKey: ["sites", network, activeGroup?.grp_title, { page, limit, search, sortBy, order, status: options.status }],
    queryFn: async () => {
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
            return sites.getSitesByStatusApi({
                status: options.status,
                ...params
            });
        }
        return sites.getSitesSummary(params);
      }

      if (!groupCohortIds) {
        throw new Error("Cohort IDs are not available yet.");
      }

      return sites.getSitesByCohorts({
        cohort_ids: groupCohortIds,
        limit: safeLimit,
        skip,
        ...(search && { search }),
        ...(sortBy && { sortBy }),
        ...(order && { order }),
        ...(network && { network }),
      });
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
        queryFn: () => sites.getSitesSummaryCount({ network: network || "" }),
        enabled: !!activeGroup?.grp_title,
        staleTime: 300_000, 
    });

    return {
        summary: query.data?.summary,
        isLoading: query.isLoading,
        error: query.error
    };
};

export const useApproximateCoordinates = () => {
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
      sites.getApproximateCoordinates(latitude, longitude),
    onError: (error) => {
      ReusableToast({
        message: `Unable to get approximate coordinates: ${getApiErrorMessage(error)}`,
        type: "ERROR",
      });
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
      const response = await sites.getSiteDetails(siteId);
      return response.data;
    },
    enabled: !!siteId && enabled,
  });
};

export const useUpdateSiteDetails = () => {
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

      return sites.updateSiteDetails(siteId, cleanedData);
    },
    onSuccess: (data, { siteId }) => {
      ReusableToast({
        message: "Site details updated successfully",
        type: "SUCCESS",
      });
      queryClient.invalidateQueries({ queryKey: ["site-details", siteId] });
      queryClient.invalidateQueries({ queryKey: ["sites"] });
    },
    onError: (error) => {
      ReusableToast({
        message: `Failed to update site: ${getApiErrorMessage(error)}`,
        type: "ERROR",
      });
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

export const useCreateSite = () => {
  const queryClient = useQueryClient();
  const activeGroup = useAppSelector((state) => state.user.activeGroup);

  return useMutation<CreateSiteResponse, AxiosError<ErrorResponse>, CreateSiteRequest>({
    mutationFn: async (data: CreateSiteRequest) => {
      const createdSite = await sites.createSite(data);
      const siteId = createdSite?.site?._id;

      if (siteId && activeGroup?.grp_title) {
        await sites.bulkUpdate({
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
      ReusableToast({
        message: `Site '${variables.name}' created successfully`,
        type: "SUCCESS",
      });
      queryClient.invalidateQueries({ queryKey: ["sites"] });
    },
    onError: (error) => {
      ReusableToast({
        message: `Failed to create site: ${getApiErrorMessage(error)}`,
        type: "ERROR",
      });
    },
  });
};
