import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Network,
  networks as networksApi,
  CreateNetworkPayload,
  CreateNetworkResponse,
} from "@/core/apis/networks";
import { AxiosError } from "axios";
import ReusableToast from "@/components/shared/toast/ReusableToast";
import { getApiErrorMessage } from "../utils/getApiErrorMessage";

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

  // Sort networks to ensure 'airqo' is always first
  const networks = [...networksData].sort((a, b) => {
    if (a.net_name?.toLowerCase() === 'airqo') return -1;
    if (b.net_name?.toLowerCase() === 'airqo') return 1;
    return 0;
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