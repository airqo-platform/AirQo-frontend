/**
 * Rewrites external service URLs to point to staging equivalents when the
 * current page is served from a staging or localhost environment.
 *
 * Detection: checks `window.location.hostname` for the substring "staging".
 * Mapping:
 *   - beacon.airqo.net → staging-beacon.airqo.net
 *   - vertex.airqo.net → staging-vertex.airqo.net
 *   - airqo.net / www.airqo.net → staging.airqo.net
 *
 * Outside staging (production) the original URL is returned unchanged.
 */
export const getEnvironmentAwareUrl = (baseUrl: string): string => {
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

    let isStaging = false;
    try {
      const hrefHostname = new URL(href).hostname.toLowerCase();
      isStaging =
        hrefHostname.includes('staging') ||
        currentHost.toLowerCase().includes('staging');
    } catch {
      isStaging = currentHost.toLowerCase().includes('staging');
    }

    if (!isStaging && !isLocalhost) {
      return baseUrl;
    }

    const parsed = new URL(baseUrl);
    const host = parsed.hostname.toLowerCase();

    if (host === 'beacon.airqo.net') {
      parsed.hostname = 'staging-beacon.airqo.net';
      return parsed.toString();
    }

    if (host === 'vertex.airqo.net') {
      parsed.hostname = 'staging-vertex.airqo.net';
      return parsed.toString();
    }

    if (host === 'airqo.net' || host === 'www.airqo.net') {
      parsed.hostname = 'staging.airqo.net';
      return parsed.toString();
    }

    return baseUrl;
  } catch {
    return baseUrl;
  }
};
