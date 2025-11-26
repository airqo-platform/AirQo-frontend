/**
 * URL utility functions for the proxy client
 * Provides safe URL manipulation and validation
 */

/**
 * Normalizes a URL by removing trailing slashes and validating format
 * @param {string} url - The URL to normalize
 * @returns {string} The normalized URL
 */
export const normalizeUrl = (url: string): string => {
  if (!url || typeof url !== 'string') {
    return '';
  }
  
  // Remove trailing slashes
  const normalized = url.replace(/\/+$/, '');
  
  // Validate URL format
  try {
    new URL(normalized);
    return normalized;
  } catch {
    // If it's not a valid full URL, assume it's a path
    return normalized;
  }
};

/**
 * Safely joins URL paths
 * @param {string} base - Base URL
 * @param {string} path - Path to join
 * @returns {string} The joined URL
 */
export const joinUrls = (base: string, path: string): string => {
  const normalizedBase = normalizeUrl(base);
  const normalizedPath = path?.replace(/^\/+/, '') || '';
  
  if (!normalizedBase) return normalizedPath;
  if (!normalizedPath) return normalizedBase;
  
  return `${normalizedBase}/${normalizedPath}`;
};

/**
 * Validates if a URL is properly formatted
 * @param {string} url - URL to validate
 * @returns {boolean} True if URL is valid
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Extracts query parameters from a URL string
 * @param {string} url - URL to extract params from
 * @returns {Record<string, string>} Query parameters object
 */
export const extractQueryParams = (url: string): Record<string, string> => {
  try {
    const urlObj = new URL(url);
    const params: Record<string, string> = {};
    
    urlObj.searchParams.forEach((value, key) => {
      params[key] = value;
    });
    
    return params;
  } catch {
    return {};
  }
};
