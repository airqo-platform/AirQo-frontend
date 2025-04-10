import { useQuery, useMutation } from "@tanstack/react-query";
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
