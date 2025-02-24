/**
 * Removes the trailing slash from a URL or string if it exists.
 * @param url - The URL or string to modify.
 * @returns The URL or string without the trailing slash.
 */
function removeTrailingSlash(url: string): string {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

export default removeTrailingSlash;
