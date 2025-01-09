import { useQuery } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { setDevices, setError } from "../redux/slices/deviceSlice";
import { useAppSelector } from "../redux/hooks";
import { devices } from "../apis/devices";

export const useDevices = () => {
  const dispatch = useDispatch();
  const activeNetwork = useAppSelector((state) => state.user.activeNetwork);

  const { data, isLoading, error } = useQuery({
    queryKey: ["devices", activeNetwork?.net_name],
    queryFn: () => devices.getDeviceSummary(activeNetwork?.net_name || ""),
    enabled: !!activeNetwork?.net_name,
    onSuccess: (data: any) => {
      dispatch(setDevices(data.devices));
    },
    onError: (error: Error) => {
      dispatch(setError(error.message));
    },
  });

  return {
    devices: data?.devices || [],
    isLoading,
    error: error as Error | null,
  };
};
