/**
 * SWR configurations with best practices
 */
export const SWR_CONFIG = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  refreshInterval: 0,
  shouldRetryOnError: true,
  errorRetryCount: 3,
  dedupingInterval: 2000,
  suspense: false,
};
