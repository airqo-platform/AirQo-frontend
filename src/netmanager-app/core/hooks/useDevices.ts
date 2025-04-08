import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { devices, DeviceStatus } from "../apis/devices";
import { setDevices, setError } from "../redux/slices/devicesSlice";
import { useAppSelector } from "../redux/hooks";
import type {
  DevicesSummaryResponse,
  ReadingsApiResponse,
} from "@/app/types/devices";
import { AxiosError } from "axios";
import { useEffect } from "react";

interface ErrorResponse {
  message: string;
}

export function useDevices() {
  const dispatch = useDispatch();

  const { data, isLoading, error } = useQuery({
    queryKey: ["devices"],
    queryFn: devices.getDevicesStatus,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  useEffect(() => {
    if (data) {
      const summary = data.data[0]; // Get the first summary
      const allDevices = [...summary.online_devices, ...summary.offline_devices];
      dispatch(setDevices(allDevices));
    }
  }, [data, dispatch]);

  useEffect(() => {
    if (error) {
      dispatch(setError((error as Error).message));
    }
  }, [error, dispatch]);

  const summary = data?.data[0];
  const allDevices = summary ? [...summary.online_devices, ...summary.offline_devices] : [];

  const deviceStats = {
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
  };

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
