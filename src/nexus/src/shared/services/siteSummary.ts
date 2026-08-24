import { deviceService } from './deviceService';

const SITES_SUMMARY_PAGE_SIZE = 80;

/**
 * Safety cap on the pagination fan-out: 25 pages x 80 sites = 2000 sites.
 * A pathological backend reporting an enormous `meta.totalPages` must never
 * spawn an unbounded burst of parallel requests.
 */
const MAX_SITES_SUMMARY_PAGES = 25;

/**
 * Loads the fleet site summary for consumers that need to resolve a display
 * name to an exact site id. Page 1 sizes the fan-out; every remaining page
 * is requested IN PARALLEL with the same AbortSignal — the sequential loop
 * with a fixed inter-page delay this replaces serialized ~9 requests behind
 * ~120 ms sleeps (~2.5-3 s for the full fleet). Each page is requested at
 * most once, a failed later page does not discard earlier results, and an
 * already-aborted signal skips the network entirely.
 */
export const fetchAllSitesSummary = async (
  signal?: AbortSignal
): Promise<Record<string, unknown>[]> => {
  if (signal?.aborted) return [];

  const first = await deviceService.getSitesSummaryAuthenticated(
    { skip: 0, limit: SITES_SUMMARY_PAGE_SIZE },
    signal
  );
  const totalPages = Math.min(
    Math.max(1, first.meta?.totalPages ?? 1),
    MAX_SITES_SUMMARY_PAGES
  );
  const sites = [...(first.sites ?? [])];
  if (totalPages <= 1) return sites;

  const remainingPages = Array.from(
    { length: totalPages - 1 },
    (_, index) => index + 1
  );

  // One burst, no artificial delays. A page that rejects (including an
  // in-flight abort) is ignored — a partial summary can still resolve names
  // from the pages that loaded.
  const pages = await Promise.allSettled(
    remainingPages.map(page =>
      deviceService.getSitesSummaryAuthenticated(
        {
          skip: page * SITES_SUMMARY_PAGE_SIZE,
          limit: SITES_SUMMARY_PAGE_SIZE,
        },
        signal
      )
    )
  );

  for (const page of pages) {
    if (page.status === 'fulfilled') {
      sites.push(...(page.value.sites ?? []));
    }
  }

  return sites;
};
