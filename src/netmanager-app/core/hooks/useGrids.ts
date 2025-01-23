import { useQuery } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { grids } from "../apis/grids";
import { setGrids, setError } from "../redux/slices/gridsSlice";
import { useAppSelector } from "../redux/hooks";

export const useGrids = () => {
  const dispatch = useDispatch();
  const activeNetwork = useAppSelector((state) => state.user.activeNetwork);

  const { data, isLoading, error } = useQuery({
    queryKey: ["grids", activeNetwork?.net_name],
    queryFn: () => grids.getGrids(activeNetwork?.net_name || ""),
    enabled: !!activeNetwork?.net_name,
    onSuccess: (data: any) => {
      dispatch(setGrids(data.grids));
    },
    onError: (error: Error) => {
      dispatch(setError(error.message));
    },
  });

  return {
    grids: data?.grids || [],
    isLoading,
    error: error as Error | null,
  };
};
