import { apiClient } from './apiClient';

export const fetcher = async (url: string) => {
  // Accept either absolute or relative urls
  const urlObj = new URL(
    url,
    typeof window !== 'undefined' ? window.location.origin : 'http://localhost',
  );

  const endpoint = urlObj.pathname
    .replace(/^\/api\/v2\//, '')
    .replace(/^\//, '');
  const params: Record<string, string> = {};

  urlObj.searchParams.forEach((value, key) => {
    params[key] = value;
  });

  return apiClient.get(endpoint, { params });
};

export default fetcher;
