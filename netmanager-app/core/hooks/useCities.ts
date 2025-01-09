import { useQuery } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { cities } from "../apis/cities";
import { setCities, setError } from "../redux/slices/citiesSlice";
import { useAppSelector } from "../redux/hooks";

export const useCities = () => {
  const dispatch = useDispatch();
  const activeNetwork = useAppSelector((state) => state.user.activeNetwork);

  const { data, isLoading, error } = useQuery({
    queryKey: ["grids", activeNetwork?.net_name],
    queryFn: () => cities.getCites(activeNetwork?.net_name || ""),
    enabled: !!activeNetwork?.net_name,
    onSuccess: (data: any) => {
      dispatch(setCities(data.cities));
    },
    onError: (error: Error) => {
      dispatch(setError(error.message));
    },
  });

  return {
    cities: data?.cities || [],
    isLoading,
    error: error as Error | null,
  };
};
