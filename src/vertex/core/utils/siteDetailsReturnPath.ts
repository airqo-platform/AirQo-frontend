const STORAGE_KEY = 'vertex:site-details-return-path';

export type SiteDetailsArea = 'admin' | 'user';

/**
 * Records the page (path + query string, so list search/filter/sort/page
 * survive) that the user is opening a site from. Call it right before
 * navigating to a site details page.
 */
export function rememberSiteDetailsReturnPath(): void {
  try {
    const { pathname, search } = window.location;
    window.sessionStorage.setItem(STORAGE_KEY, `${pathname}${search}`);
  } catch {
    // Storage can be unavailable (private mode, blocked site data). Back then
    // just uses the fallback.
  }
}

const isSafeInternalPath = (value: string) =>
  value.startsWith('/') && !value.startsWith('//') && !value.startsWith('/\\');

/**
 * Where the site details page's Back button should go: the remembered page
 * when it belongs to the same area of the app, otherwise `fallback`.
 *
 * An explicit destination keeps Back working even when the page's own history
 * operations are busy, instead of relying on router.back() (see #4000).
 */
export function getSiteDetailsReturnPath(area: SiteDetailsArea, fallback: string): string {
  try {
    const stored = window.sessionStorage.getItem(STORAGE_KEY);
    if (stored && isSafeInternalPath(stored)) {
      const isAdminPath = stored === '/admin' || stored.startsWith('/admin/') || stored.startsWith('/admin?');
      if ((area === 'admin') === isAdminPath) {
        return stored;
      }
    }
  } catch {
    // Fall through to the fallback.
  }
  return fallback;
}
