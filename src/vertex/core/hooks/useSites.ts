import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { sites, ApproximateCoordinatesResponse, GetSitesSummaryParams, SitesSummaryResponse } from "../apis/sites";
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
}

export const useSites = (options: SiteListingOptions = {}) => {
  const activeNetwork = useAppSelector((state) => state.user.activeNetwork);
  const activeGroup = useAppSelector((state) => state.user.activeGroup);

  const { page = 1, limit = 100, search, sortBy, order } = options;
  const safePage = Math.max(1, page);
  const safeLimit = Math.max(1, limit);
  const skip = (safePage - 1) * safeLimit;

  const sitesQuery = useQuery<
    SitesSummaryResponse,
    AxiosError<ErrorResponse>
  >({
    queryKey: ["sites", activeNetwork?.net_name, activeGroup?.grp_title, { page, limit, search, sortBy, order }],
    queryFn: () => {
      const params: GetSitesSummaryParams = {
        network: activeNetwork?.net_name || "",
        group: activeGroup?.grp_title === "airqo" ? "" : (activeGroup?.grp_title || ""),
        limit: safeLimit,
        skip,
        ...(search && { search }),
        ...(sortBy && { sortBy }),
        ...(order && { order }),
      };
      return sites.getSitesSummary(params);
    },
    enabled: !!activeNetwork?.net_name && !!activeGroup?.grp_title,
    staleTime: 300_000,
    refetchOnWindowFocus: false,
  });

  return {
    data: sitesQuery.data,
    sites: sitesQuery.data?.sites || [],
    meta: sitesQuery.data?.meta,
    isLoading: sitesQuery.isLoading,
    isFetching: sitesQuery.isFetching,
    error: sitesQuery.error,
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

  return useMutation<any, AxiosError<ErrorResponse>, CreateSiteRequest>({
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
