import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { sites, ApproximateCoordinatesResponse } from "../apis/sites";
import { setSites, setError } from "../redux/slices/sitesSlice";
import { useAppSelector } from "../redux/hooks";
import React from "react";
import ReusableToast from "@/components/shared/toast/ReusableToast";
import { AxiosError } from "axios";

interface ErrorResponse {
  message: string;
  errors?: {
    message: string;
  };
}

export const useSites = () => {
  const dispatch = useDispatch();
  const activeNetwork = useAppSelector((state) => state.user.activeNetwork);
  const activeGroup = useAppSelector((state) => state.user.activeGroup);

  const { data, isLoading, error } = useQuery({
    queryKey: ["sites", activeNetwork?.net_name, activeGroup?.grp_title],
    queryFn: () =>
      sites.getSitesSummary(
        activeNetwork?.net_name || "",
        activeGroup?.grp_title || ""
      ),
    enabled: !!activeNetwork?.net_name && !!activeGroup?.grp_title,
  });

  React.useEffect(() => {
    if (data?.sites) {
      dispatch(setSites(data.sites));
    }
    if (error) {
      dispatch(setError(error.message));
    }
  }, [data, error, dispatch]);

  return {
    sites: data?.sites || [],
    isLoading,
    error: error as Error | null,
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
        message: `Unable to get approximate coordinates: ${
          error.response?.data?.message || error.message
        }`,
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
    any,
    AxiosError<ErrorResponse>,
    { siteId: string; data: Record<string, string | undefined> }
  >({
    mutationFn: async ({ siteId, data }: { siteId: string; data: Record<string, string | undefined> }) => {
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
        message: `Failed to update site: ${error.response?.data?.message || error.message}`,
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

  return useMutation<any, AxiosError<ErrorResponse>, CreateSiteRequest>({
    mutationFn: async (data: CreateSiteRequest) => {
      return sites.createSite(data);
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
        message: `Failed to create site: ${error.response?.data?.message || error.message}`,
        type: "ERROR",
      });
    },
  });
};
