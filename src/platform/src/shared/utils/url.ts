export const getEnvironmentAwareUrl = (baseUrl: string): string => {
  // Only run environment detection in the browser
  if (typeof window === 'undefined') {
    return baseUrl;
  }

  try {
    const href = (window.location && window.location.href) || '';
    const currentHost = (window.location && window.location.hostname) || '';

    const isLocalhost =
      currentHost === 'localhost' ||
      currentHost === '127.0.0.1' ||
      currentHost === '::1' ||
      currentHost === '0.0.0.0';

    const isStaging =
      href.toLowerCase().includes('staging') ||
      currentHost.toLowerCase().includes('staging');

    // Only map to staging hosts when we're on a staging URL or running locally
    if (!isStaging && !isLocalhost) {
      return baseUrl;
    }

    const parsed = new URL(baseUrl);
    const host = parsed.hostname.toLowerCase();

    // Map the specific hosts requested:
    // - `airqo.net` -> `staging.airqo.net`
    // - `vertex.airqo.net` -> `staging-vertex.airqo.net`
    if (host === 'vertex.airqo.net') {
      parsed.hostname = 'staging-vertex.airqo.net';
      return parsed.toString();
    }

    if (host === 'airqo.net' || host === 'www.airqo.net') {
      parsed.hostname = 'staging.airqo.net';
      return parsed.toString();
    }

    // Leave other hosts unchanged.
    return baseUrl;
  } catch (err) {
    return baseUrl;
  }
};
