/**
 * Utility functions for URL handling
 */

/**
 * Removes trailing slashes from a URL and ensures proper formatting
 * @param {string} url - The URL to normalize
 * @returns {string} - The normalized URL without trailing slash
 */
export const normalizeUrl = (url) => {
  if (!url) return '';
  return url.replace(/\/+$/, '');
};

/**
 * Joins path segments with proper handling of slashes
 * @param {string} baseUrl - The base URL
 * @param {string|string[]} paths - Path segments to append
 * @returns {string} - The complete URL with properly joined paths
 */
export const joinPaths = (baseUrl, paths) => {
  const base = normalizeUrl(baseUrl);

  if (!paths) return base;

  // Convert single string to array for consistent handling
  const segments = Array.isArray(paths) ? paths : [paths];

  // Filter out empty segments and join with slashes
  const pathPart = segments
    .map((segment) => segment.toString().replace(/^\/+|\/+$/g, ''))
    .filter(Boolean)
    .join('/');

  return pathPart ? `${base}/${pathPart}` : base;
};
