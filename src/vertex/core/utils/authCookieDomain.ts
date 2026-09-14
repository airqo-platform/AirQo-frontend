export type CookieDomainWarning =
  | { kind: 'host-mismatch'; configuredCookieDomain: string; host: string }
  | { kind: 'invalid-reference-url'; configuredCookieDomain: string; referenceUrl: string };

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);

/**
 * Decides which `domain` the NextAuth session cookie should carry.
 *
 * Pure so it can be evaluated per request: the reference URL is often only
 * known once the first request arrives (see setRuntimeAuthUrls in the auth
 * route), so the result must not be cached at module load.
 *
 * - no configured domain → undefined (host-only cookie)
 * - no reference URL yet → the configured domain (nothing to validate against)
 * - localhost / loopback → undefined, so local dev never inherits a
 *   production domain that the browser would reject
 * - host outside the configured domain → undefined, with a warning
 */
export function resolveCookieDomain(
  configuredCookieDomain: string | undefined,
  referenceUrl: string | undefined,
  warn?: (warning: CookieDomainWarning) => void
): string | undefined {
  if (!configuredCookieDomain) {
    return undefined;
  }
  if (!referenceUrl) {
    return configuredCookieDomain;
  }

  let host: string;
  try {
    host = new URL(referenceUrl).hostname.toLowerCase();
  } catch {
    warn?.({ kind: 'invalid-reference-url', configuredCookieDomain, referenceUrl });
    return undefined;
  }

  if (LOCAL_HOSTS.has(host)) {
    return undefined;
  }

  const normalizedDomain = configuredCookieDomain.replace(/^\./, '').toLowerCase();
  const hostMatches = host === normalizedDomain || host.endsWith(`.${normalizedDomain}`);
  if (hostMatches) {
    return configuredCookieDomain;
  }

  warn?.({ kind: 'host-mismatch', configuredCookieDomain, host });
  return undefined;
}
