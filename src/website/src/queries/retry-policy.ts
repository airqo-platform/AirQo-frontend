const isDevelopment = process.env.NODE_ENV === 'development';

const isRetryableError = (error: unknown) => {
  const apiError = error as {
    retryable?: boolean;
    statusCode?: number;
    code?: string;
    name?: string;
    message?: string;
  };

  if (apiError?.retryable === false) return false;
  if (apiError?.statusCode === 404) return false;
  if (apiError?.code === 'ERR_CANCELED') return false;
  if (apiError?.name === 'AbortError') return false;
  if (apiError?.message?.includes('aborted')) return false;

  return true;
};

export const shouldRetryQuery = (failureCount: number, error: unknown) =>
  !isDevelopment && isRetryableError(error) && failureCount < 3;
