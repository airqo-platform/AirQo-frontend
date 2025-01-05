import { useQuery } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { sites } from "../apis/sites";
import { setSites, setError } from "../redux/slices/sitesSlice";
import { useAppSelector } from "../redux/hooks";

export const useSites = () => {
  const dispatch = useDispatch();
  const activeNetwork = useAppSelector((state) => state.user.activeNetwork);

  const { data, isLoading, error } = useQuery({
    queryKey: ["sites", activeNetwork?.net_name],
    queryFn: () => sites.getSitesSummary(activeNetwork?.net_name || ""),
    enabled: !!activeNetwork?.net_name,
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
