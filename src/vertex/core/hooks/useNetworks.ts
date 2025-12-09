import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Network,
  networks as networksApi,
  CreateNetworkPayload,
  CreateNetworkResponse,
} from "@/core/apis/networks";
import { DeviceListingOptions } from "./useDevices";
import { devices } from "../apis/devices";
import { AxiosError } from "axios";
import ReusableToast from "@/components/shared/toast/ReusableToast";
import { getApiErrorMessage } from "../utils/getApiErrorMessage";
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

interface UseCreateNetworkOptions {
  onSuccess?: (data: CreateNetworkResponse) => void;
  onError?: (error: AxiosError<ErrorResponse>) => void;
}

export const useCreateNetwork = (options: UseCreateNetworkOptions = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess: onSuccessCallback, onError: onErrorCallback } = options;

  return useMutation<
    CreateNetworkResponse,
    AxiosError<ErrorResponse>,
    CreateNetworkPayload
  >({
    mutationFn: (data) => networksApi.createNetworkApi(data),
    onSuccess: (data) => {
      ReusableToast({
        message: data?.message || "Network created successfully",
        type: "SUCCESS",
      });
      queryClient.invalidateQueries({ queryKey: ["networks"] });
      if (onSuccessCallback) {
        onSuccessCallback(data);
      }
    },
    onError: (error) => {
      ReusableToast({
        message: `Network Creation Failed: ${getApiErrorMessage(error)}`,
        type: "ERROR",
      });
      if (onErrorCallback) {
        onErrorCallback(error);
      }
    },
  });
};

export const useNetworkDevices = (options: DeviceListingOptions = {}) => {
  const { page = 1, limit = 100, search, sortBy, order, network } = options;
  const safePage = Math.max(1, page);
  const safeLimit = Math.max(1, limit);
  const skip = (safePage - 1) * safeLimit;

  if (!network) {
    throw new Error("Network is required");
  }

  const queryKey = [
    "network-devices",
    { page, limit, search, sortBy, order, network },
  ];

  const devicesQuery = useQuery<
    DevicesSummaryResponse,
    AxiosError<ErrorResponse>
  >({
    queryKey,
    queryFn: async () => {
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