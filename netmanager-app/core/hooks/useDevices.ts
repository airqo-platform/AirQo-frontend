import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { devices } from "../apis/devices";
import { setDevices, setError } from "../redux/slices/devicesSlice";
import { useAppSelector } from "../redux/hooks";
import type {
  DevicesSummaryResponse,
  ReadingsApiResponse,
} from "@/app/types/devices";
import { AxiosError } from "axios";

interface ErrorResponse {
  message: string;
}

export const useDevices = () => {
  const dispatch = useDispatch();
  const activeNetwork = useAppSelector((state) => state.user.activeNetwork);
  const activeGroup = useAppSelector((state) => state.user.activeGroup);

  const devicesQuery = useQuery<
    DevicesSummaryResponse,
    AxiosError<ErrorResponse>
  >({
    queryKey: ["devices", activeNetwork?.net_name, activeGroup?.grp_title],
    queryFn: () =>
      devices.getDevicesSummaryApi(
        activeNetwork?.net_name || "",
        activeGroup?.grp_title || ""
      ),
    enabled: !!activeNetwork?.net_name && !!activeGroup?.grp_title,
    onSuccess: (data: DevicesSummaryResponse) => {
      dispatch(setDevices(data.devices));
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      dispatch(setError(error.message));
    },
  } as UseQueryOptions<DevicesSummaryResponse, AxiosError<ErrorResponse>>);

  const mapReadingsQuery = useQuery<
    ReadingsApiResponse,
    AxiosError<ErrorResponse>
  >({
    queryKey: ["mapReadings"],
    queryFn: () =>
      devices.getMapReadingsApi() as Promise<unknown> as Promise<ReadingsApiResponse>,
    onError: (error: AxiosError<ErrorResponse>) => {
      dispatch(setError(error.message));
    },
  } as UseQueryOptions<ReadingsApiResponse, AxiosError<ErrorResponse>>);

  return {
    devices: devicesQuery.data?.devices || [],
    mapReadings: mapReadingsQuery.data?.measurements || [],
    isLoading: devicesQuery.isLoading || mapReadingsQuery.isLoading,
    error: devicesQuery.error || mapReadingsQuery.error,
  };
};
