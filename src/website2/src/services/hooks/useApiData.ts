import useSWR, { SWRConfiguration } from 'swr';
import useSWRInfinite from 'swr/infinite';

import { PaginatedResponse, QueryParams } from '../types/api';
import { fetcher } from '../utils/fetcher';

interface UseApiDataOptions extends SWRConfiguration {
  params?: QueryParams;
}

export function useApiData<T>(
  endpoint: string | null,
  options?: UseApiDataOptions,
) {
  const { params, ...swrOptions } = options || {};

  const queryString = params
    ? '?' + new URLSearchParams(params as any).toString()
    : '';
  const key = endpoint ? `/api/v2/${endpoint}${queryString}` : null;

  // Cast key/fetcher to any to satisfy SWR's TypeScript overloads with our generic fetcher
  const { data, error, isValidating, mutate } = useSWR<PaginatedResponse<T>>(
    key as any,
    fetcher as any,
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      ...swrOptions,
    },
  );

  return {
    data,
    error: error as any,
    isLoading: !error && !data,
    isValidating,
    mutate,
  };
}

export function useApiItem<T>(
  endpoint: string | null,
  options?: UseApiDataOptions,
) {
  const { params, ...swrOptions } = options || {};

  const queryString = params
    ? '?' + new URLSearchParams(params as any).toString()
    : '';
  const key = endpoint ? `/api/v2/${endpoint}${queryString}` : null;

  // Cast key/fetcher to any to satisfy SWR's TypeScript overloads with our generic fetcher
  const { data, error, isValidating, mutate } = useSWR<T>(
    key as any,
    fetcher as any,
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      // Cache for 5 minutes to improve performance
      dedupingInterval: 300000,
      ...swrOptions,
    },
  );

  return {
    data,
    error: error as any,
    isLoading: !error && !data,
    isValidating,
    mutate,
  };
}

export function useInfiniteApiData<T>(
  endpoint: string,
  params?: QueryParams,
  swrOptions?: SWRConfiguration,
) {
  const getKey = (
    pageIndex: number,
    previousPageData: PaginatedResponse<T> | null,
  ) => {
    if (previousPageData && !previousPageData.next) return null;

    const queryParams = {
      ...params,
      page: pageIndex + 1,
    };

    const queryString = new URLSearchParams(queryParams as any).toString();
    return `/api/v2/${endpoint}?${queryString}`;
  };

  const { data, error, size, setSize, isValidating, mutate } = useSWRInfinite<
    PaginatedResponse<T>
  >(getKey as any, fetcher as any, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    ...swrOptions,
  });

  const results = data ? data.flatMap((page) => page.results) : [];
  const isLoadingInitialData = !data && !error;
  const isLoadingMore =
    isLoadingInitialData ||
    (size > 0 && data && typeof data[size - 1] === 'undefined');
  const isEmpty = data?.[0]?.results.length === 0;
  const isReachingEnd =
    isEmpty || (data && data[data.length - 1]?.next === null);

  return {
    results,
    error: error as any,
    isLoadingInitialData,
    isLoadingMore,
    isValidating,
    isEmpty,
    isReachingEnd,
    size,
    setSize,
    mutate,
  };
}
