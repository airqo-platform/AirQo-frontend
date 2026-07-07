import { QueryClient } from '@tanstack/react-query';

const isDevelopment = process.env.NODE_ENV === 'development';

const isRetryableError = (error: unknown) => {
  const apiError = error as {
    statusCode?: number;
    code?: string;
    name?: string;
    message?: string;
  };

  if (apiError?.statusCode === 404) return false;
  if (apiError?.code === 'ERR_CANCELED') return false;
  if (apiError?.name === 'AbortError') return false;
  if (apiError?.message?.includes('aborted')) return false;

  return true;
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: (failureCount, error) =>
        !isDevelopment && isRetryableError(error) && failureCount < 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    },
  },
});
