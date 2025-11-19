import { useQuery } from "@tanstack/react-query";
import { Network, networks as networksApi } from "@/core/apis/networks";
import { AxiosError } from "axios";

interface ErrorResponse {
  message: string;
}

export const useNetworks = () => {
  const {
    data: networks = [],
    isLoading,
    isFetching,
    error,
  } = useQuery<Network[], AxiosError<ErrorResponse>>({
    queryKey: ["networks"],
    queryFn: networksApi.getNetworksApi,
    staleTime: 300_000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  return { networks, isLoading, isFetching, error: error as Error | null };
};