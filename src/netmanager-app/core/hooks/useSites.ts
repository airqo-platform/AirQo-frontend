import { useQuery, useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { sites, ApproximateCoordinatesResponse } from "../apis/sites";
import { setSites, setError } from "../redux/slices/sitesSlice";
import { useAppSelector } from "../redux/hooks";

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
    onSuccess: (data: any) => {
      dispatch(setSites(data.sites));
    },
    onError: (error: Error) => {
      dispatch(setError(error.message));
    },
  });

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
