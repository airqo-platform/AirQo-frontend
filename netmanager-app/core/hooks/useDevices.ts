import { useQuery } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { devices } from "../apis/devices";
import { setDevices, setError } from "../redux/slices/devicesSlice";
import { useAppSelector } from "../redux/hooks";
import type { DevicesSummaryResponse } from "@/app/types/devices";

export const useDevices = () => {
  const dispatch = useDispatch();
  const activeNetwork = useAppSelector((state) => state.user.activeNetwork);
  const activeGroup = useAppSelector((state) => state.user.activeGroup);

  const { data, isLoading, error } = useQuery<DevicesSummaryResponse, Error>({
    queryKey: ["devices", activeNetwork?.net_name, activeGroup?.grp_title],
    queryFn: () =>
      devices.getDevicesSummary(
        activeNetwork?.net_name || "",
        activeGroup?.grp_title || ""
      ),
    enabled: !!activeNetwork?.net_name && !!activeGroup?.grp_title,
    onSuccess: (data, error) => {
      if (error) {
        dispatch(setError(error.message));
      } else if (data) {
        dispatch(setDevices(data.devices));
      }
    },
  });

  return {
    devices: data?.devices || [],
    isLoading,
    error: error as Error | null,
  };
};
