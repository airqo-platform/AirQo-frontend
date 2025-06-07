import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { sites, ApproximateCoordinatesResponse } from "../apis/sites";
import { setSites, setError } from "../redux/slices/sitesSlice";
import { useAppSelector } from "../redux/hooks";
import React from "react";

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
    Error,
    { latitude: string; longitude: string }
  >({
    mutationFn: ({ latitude, longitude }) =>
      sites.getApproximateCoordinates(latitude, longitude),
  });

  return {
    getApproximateCoordinates,
    approximateCoordinates,
    isPending,
    error: error as Error | null,
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

  return useMutation({
    mutationFn: async ({ siteId, data }: { siteId: string; data: Record<string, string | undefined> }) => {
      const cleanedData = Object.fromEntries(
        Object.entries(data).filter(([, value]) => value !== undefined)
      );
      
      return sites.updateSiteDetails(siteId, cleanedData);
    },
    onSuccess: (_, { siteId }) => {
      queryClient.invalidateQueries({ queryKey: ["site-details", siteId] });
      queryClient.invalidateQueries({ queryKey: ["sites"] });
    },
  });
};

interface CreateSiteResponse {
  success: boolean;
  message: string;
  site: {
    share_links: Record<string, unknown>;
    visibility: boolean;
    grids: unknown[];
    images: unknown[];
    groups: unknown[];
    site_codes: string[];
    land_use: unknown[];
    isOnline: boolean;
    _id: string;
    location_name: string;
    name: string;
    latitude: number;
    longitude: number;
    network: string;
    approximate_latitude: number;
    approximate_longitude: number;
    bearing_in_radians: number;
    approximate_distance_in_km: number;
    lat_long: string;
    generated_name: string;
    altitude: number;
    data_provider: string;
    description: string;
    createdAt: string;
  };
}

interface CreateSiteRequest {
  name: string;
  latitude: string;
  longitude: string;
  network: string;
}

export const useCreateSite = () => {
  const queryClient = useQueryClient();

  return useMutation<CreateSiteResponse, Error, CreateSiteRequest>({
    mutationFn: async (data: CreateSiteRequest) => {
      const response = await sites.createSite(data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sites"] });
    },
  });
};
