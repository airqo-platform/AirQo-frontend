import { useQuery } from "@tanstack/react-query";
import {
  Network,
  networks as networksApi,
} from "@/core/apis/networks";
import { DeviceListingOptions } from "./useDevices";
import { devices } from "../apis/devices";
import { AxiosError } from "axios";
import type { DevicesSummaryResponse } from "@/app/types/devices";

interface ErrorResponse {
  message: string;
}

export const useNetworks = () => {
  const {
    data: networksData = [],
    isLoading,
    isFetching,
    error,
  } = useQuery<Network[], AxiosError<ErrorResponse>>({
    queryKey: ["networks"],
    queryFn: networksApi.getNetworksApi,
    staleTime: 300_000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Sort networks to ensure 'airqo' is always first, then alphabetically
  const networks = [...networksData].sort((a, b) => {
    const aIsAirqo = a.net_name?.toLowerCase() === 'airqo';
    const bIsAirqo = b.net_name?.toLowerCase() === 'airqo';
    
    if (aIsAirqo) return -1;
    if (bIsAirqo) return 1;
    
    // Alphabetical sort for non-airqo networks
    return (a.net_name || '').localeCompare(b.net_name || '');
  });

  return { networks, isLoading, isFetching, error: error as Error | null };
};

export const useNetworkDevices = (options: DeviceListingOptions = {}) => {
  const { page = 1, limit = 100, search, sortBy, order, network, filterStatus } = options;
  const safePage = Math.max(1, page);
  const safeLimit = Math.max(1, limit);
  const skip = (safePage - 1) * safeLimit;

  const queryKey = [
    "network-devices",
    { page, limit, search, sortBy, order, network, filterStatus },
  ];

  const devicesQuery = useQuery<
    DevicesSummaryResponse,
    AxiosError<ErrorResponse>
  >({
    queryKey,
    queryFn: async () => {
      if (!network) {
        throw new Error("Network is required");
      }

      // Hybrid Strategy: If filterStatus is provided, use the status endpoint
      if (filterStatus) {
        return devices.getDevicesByStatusApi({
          status: filterStatus,
          limit: safeLimit,
          skip,
          ...(search && { search }),
          ...(sortBy && { sortBy }),
          ...(order && { order }),
          network: network,
        });
      }

      return devices.getDevicesSummaryApi({
        limit: safeLimit,
        skip,
        ...(search && { search }),
        ...(sortBy && { sortBy }),
        ...(order && { order }),
        network: network,
      });
    },
    enabled: !!network,
    staleTime: 300_000,
    refetchOnWindowFocus: false,
  });

  return {
    data: devicesQuery.data,
    devices: devicesQuery.data?.devices || [],
    meta: devicesQuery.data?.meta,
    isLoading: devicesQuery.isLoading,
    isFetching: devicesQuery.isFetching,
    error: devicesQuery.error,
  };
};