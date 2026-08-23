import { deviceService } from './deviceService';

const SITES_SUMMARY_PAGE_SIZE = 80;

/**
 * Loads the fleet site summary for consumers that need to resolve a display
 * name to an exact site id. Each page is requested at most once and a failed
 * later page does not discard earlier results.
 */
export const fetchAllSitesSummary = async (
  signal?: AbortSignal
): Promise<Record<string, unknown>[]> => {
  const first = await deviceService.getSitesSummaryAuthenticated(
    { skip: 0, limit: SITES_SUMMARY_PAGE_SIZE },
    signal
  );
  const totalPages = Math.max(1, first.meta?.totalPages ?? 1);
  const sites = [...(first.sites ?? [])];

  for (let page = 1; page < totalPages; page++) {
    if (signal?.aborted) break;

    try {
      const response = await deviceService.getSitesSummaryAuthenticated(
        {
          skip: page * SITES_SUMMARY_PAGE_SIZE,
          limit: SITES_SUMMARY_PAGE_SIZE,
        },
        signal
      );
      sites.push(...(response.sites ?? []));
    } catch {
      // A partial summary can still resolve names from the pages that loaded.
    }

    await new Promise(resolve => setTimeout(resolve, 120));
  }

  return sites;
};
