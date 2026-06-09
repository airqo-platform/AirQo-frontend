import { getApiBaseUrl } from './envConstants';

const ensureLeadingSlash = (value: string): string => {
  if (!value) return '';
  return value.startsWith('/') ? value : `/${value}`;
};

const isAbsoluteUrl = (value: string): boolean => {
  return /^https?:\/\//i.test(value);
};

/**
 * Builds an absolute API URL for server-side requests.
 * Uses the environment-configured API base URL.
 * 
 * @param inputPath - The path to append to the base URL (e.g. '/users/profile')
 * @returns The absolute URL string
 */
export const buildServerApiUrl = (inputPath: string): string => {
  const trimmedInput = (inputPath || '').trim();
  
  if (isAbsoluteUrl(trimmedInput)) {
    return trimmedInput;
  }
  
  const baseUrl = getApiBaseUrl(); // E.g., https://staging-vertex.airqo.net/api/v2
  return `${baseUrl}${ensureLeadingSlash(trimmedInput)}`;
};

/**
 * Builds a relative API URL for browser-side requests.
 * By returning a relative path, the browser natively routes to the current domain,
 * completely eliminating "split-brain" environment variable issues on the client.
 * 
 * @param inputPath - The path to format (e.g. '/users/profile')
 * @returns The relative URL string (e.g. '/api/v2/users/profile')
 */
export const buildBrowserApiUrl = (inputPath: string): string => {
  const trimmedInput = (inputPath || '').trim();
  
  if (isAbsoluteUrl(trimmedInput)) {
    return trimmedInput;
  }
  
  // The vertex backend sits under /api/v2 relative to the frontend domain
  return `/api/v2${ensureLeadingSlash(trimmedInput)}`;
};
