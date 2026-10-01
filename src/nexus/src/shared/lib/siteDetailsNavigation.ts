/**
 * Navigation helpers for the location detail page (`.../sites/[siteSlug]`).
 *
 * The detail page is mounted from several modules (home, analytics comparison,
 * data export, organization flows), so its breadcrumb cannot assume a single
 * parent. Instead every entry point records where it navigated from in a `from`
 * query parameter, and the detail page turns that back into a labelled link.
 * When `from` is missing — a direct link, a bookmark or a shared URL — the
 * caller-provided fallback is used, so the breadcrumb is never broken.
 */

export const SITE_DETAILS_FROM_PARAM = 'from';

/** Strip the account prefix so `/org/acme/map` and `/user/map` share a label. */
const routeWithoutAccountPrefix = (pathname: string): string =>
  pathname.replace(/^\/(?:org\/[^/]+|user)(?=\/|$)/, '') || '/';

/**
 * Breadcrumb labels for the pages that can own a location detail view. Ordered
 * so the most specific pattern wins.
 */
const BACK_LABELS: ReadonlyArray<readonly [RegExp, string]> = [
  [/^\/home$/, 'Home'],
  [/^\/air-quality\/analytics$/, 'Analytics'],
  [/^\/air-quality\/rankings$/, 'Rankings'],
  [/^\/data-export$/, 'Data Export'],
  [/^\/data-visualizer$/, 'Data Visualizer'],
  [/^\/map$/, 'Map'],
];

/**
 * Only same-app absolute paths are acceptable as a redirect target. This
 * rejects protocol-relative (`//evil.com`) and backslash (`/\evil.com`) forms
 * that would otherwise turn the breadcrumb into an open redirect.
 */
export const isInternalAppPath = (
  value: string | null | undefined
): boolean => {
  if (!value) return false;
  if (!value.startsWith('/')) return false;
  if (value.startsWith('//') || value.startsWith('/\\')) return false;
  if (value.includes('\\')) return false;
  // Defence in depth against a smuggled scheme in the first segment.
  return !/^\/[a-z][a-z0-9+.-]*:/i.test(value);
};

/** Append `from` to an href that may already carry a query string. */
export const withSiteDetailsFrom = (
  href: string,
  from: string | null | undefined
): string => {
  if (!isInternalAppPath(from)) return href;
  const [path, existingQuery = ''] = href.split('?');
  const params = new URLSearchParams(existingQuery);
  params.set(SITE_DETAILS_FROM_PARAM, from as string);
  return `${path}?${params.toString()}`;
};

/** Human label for the originating page, or `null` when unrecognised. */
export const siteDetailsBackLabel = (from: string): string | null => {
  const route = routeWithoutAccountPrefix(from.split('?')[0]);
  const match = BACK_LABELS.find(([pattern]) => pattern.test(route));
  return match ? match[1] : null;
};

export interface SiteDetailsBackTarget {
  href: string;
  label: string;
  /** True when the target came from the recorded origin rather than a prop. */
  fromRecordedOrigin: boolean;
}

/**
 * Resolve the breadcrumb link: prefer the recorded origin, fall back to the
 * caller-provided parent when `from` is absent or not an internal path.
 */
export const resolveSiteDetailsBackTarget = ({
  from,
  fallbackHref,
  fallbackLabel,
}: {
  from: string | null | undefined;
  fallbackHref: string;
  fallbackLabel: string;
}): SiteDetailsBackTarget => {
  if (isInternalAppPath(from)) {
    const label = siteDetailsBackLabel(from as string);
    if (label) {
      return { href: from as string, label, fromRecordedOrigin: true };
    }
  }
  return {
    href: fallbackHref,
    label: fallbackLabel,
    fromRecordedOrigin: false,
  };
};
