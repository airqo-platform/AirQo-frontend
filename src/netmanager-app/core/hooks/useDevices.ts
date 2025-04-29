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
import { useEffect, useMemo } from "react";

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
      // Convert Device[] to DeviceStatus[]
      const devicesWithStatus = data.devices.map(device => ({
        ...device,
        device_number: 0,
        mobility: false,
        maintenance_status: "good" as const,
        powerType: "mains" as const,
        elapsed_time: 0,
        status: device.isOnline ? "online" as const : "offline" as const,
      }));
      dispatch(setDevices(devicesWithStatus));
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      dispatch(setError(error.message));
    },
  } as UseQueryOptions<DevicesSummaryResponse, AxiosError<ErrorResponse>>);

  return {
    devices: devicesQuery.data?.devices || [],
    isLoading: devicesQuery.isLoading,
    error: devicesQuery.error,
  };
};

export function useDeviceStatus() {
  const dispatch = useDispatch();

  const { data, isLoading, error } = useQuery({
    queryKey: ["deviceStatus"],
    queryFn: devices.getDevicesStatus,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const summary = useMemo(() => data?.data[0], [data]);
  const allDevices = useMemo(() => 
    summary ? [...summary.online_devices, ...summary.offline_devices] : []
  , [summary]);

  useEffect(() => {
    if (data) {
      dispatch(setDevices(allDevices));
    }
    if (error) {
      dispatch(setError((error as Error).message));
    }
  }, [data, error, dispatch, allDevices]);

  const deviceStats = useMemo(() => ({
    total: summary?.total_active_device_count || 0,
    online: summary?.count_of_online_devices || 0,
    offline: summary?.count_of_offline_devices || 0,
    maintenance: {
      good: allDevices.filter(d => d.maintenance_status === "good").length,
      due: summary?.count_due_maintenance || 0,
      overdue: summary?.count_overdue_maintenance || 0,
      unspecified: summary?.count_unspecified_maintenance || 0,
    },
    powerSource: {
      solar: summary?.count_of_solar_devices || 0,
      alternator: summary?.count_of_alternator_devices || 0,
      mains: summary?.count_of_mains || 0,
    },
  }), [summary, allDevices]);

  return {
    devices: allDevices,
    stats: deviceStats,
    isLoading,
    error: error ? (error as Error).message : null,
  };
}

export const useMapReadings = () => {
  const dispatch = useDispatch();

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
    mapReadings: mapReadingsQuery.data?.measurements || [],
    isLoading: mapReadingsQuery.isLoading,
    error: mapReadingsQuery.error,
  };
};

// New hook for fetching a single device by ID
export function useDevice(deviceId: string) {
  const allDevices = useAppSelector((state) => state.devices.devices)

  // First check if the device is already in the Redux store
  const deviceFromStore = useMemo(() => {
    return allDevices.find((device) => device._id === deviceId)
  }, [allDevices, deviceId])

  // If not in store, fetch it directly
  const { data, isLoading, error } = useQuery({
    queryKey: ["device", deviceId],
    queryFn: async () => {
      try {
        return await devices.getDevice(deviceId)
      } catch (error) {
        console.error(`Error fetching device ${deviceId}:`, error)
        throw error
      }
    },
    enabled: !!deviceId && !deviceFromStore, // Only fetch if not already in store
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Return the device from store if available, otherwise from the API
  return {
    device: deviceFromStore || data,
    isLoading: isLoading && !deviceFromStore,
    error,
  }
}
