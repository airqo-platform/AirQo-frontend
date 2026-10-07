import { deviceService } from './deviceService';
import type { DeviceSummaryCount, Grid, CountryData } from '../types/api';

/** A single platform-overview snapshot returned to the UI / CSV export. */
export interface PlatformOverviewSnapshot {
  categories: {
    lowcost: DeviceSummaryCount;
    bam: DeviceSummaryCount;
    gas: DeviceSummaryCount;
  };
  operational: number;
  transmitting: number;
  countries: CountryData[];
  citiesCovered: number;
  /** Epoch ms captured at the start of the overview fetch. */
  fetchedAt: number;
}

const CITY_PAGE_SIZE = 80;
const MAX_CITY_PAGES = 25;

/** A zeroed DeviceSummaryCount, used when no data was fetched. */
const emptyCount = (): DeviceSummaryCount => ({
  total_monitors: 0,
  operational: 0,
  transmitting: 0,
  not_transmitting: 0,
  data_available: 0,
});

/**
 * Counts grids whose `admin_level === 'city'` (belt-and-braces client filter,
 * the server param is best-effort) and whose site count is greater than zero.
 */
const isPopulatedCity = (grid: Grid): boolean => {
  if (grid.admin_level !== 'city') return false;
  const siteCount = grid.numberOfSites ?? grid.sites?.length ?? 0;
  return siteCount > 0;
};

/**
 * Resolves the total number of city grids across the platform. Page 1 sizes
 * the fan-out; every remaining page is requested in parallel with the same
 * AbortSignal — the page size is taken from `first.meta.limit` (falling back
 * to `CITY_PAGE_SIZE`), total pages are capped at `MAX_CITY_PAGES`, a failed
 * later page is tolerated (partial count), and page 1 failure rejects. An
 * already-aborted signal skips the network entirely.
 */
const resolveCitiesCovered = async (signal?: AbortSignal): Promise<number> => {
  if (signal?.aborted) return 0;

  const first = await deviceService.getGridsSummaryAuthenticated(
    { admin_level: 'city', skip: 0, limit: CITY_PAGE_SIZE },
    undefined,
    signal
  );

  const pageSize = first.meta?.limit > 0 ? first.meta.limit : CITY_PAGE_SIZE;
  const totalPages = Math.min(
    Math.max(1, first.meta?.totalPages ?? 1),
    MAX_CITY_PAGES
  );

  let count = (first.grids ?? []).filter(isPopulatedCity).length;
  if (totalPages <= 1) return count;

  const remainingPages = Array.from(
    { length: totalPages - 1 },
    (_, index) => index + 2
  );

  const pages = await Promise.allSettled(
    remainingPages.map(page =>
      deviceService.getGridsSummaryAuthenticated(
        { admin_level: 'city', skip: (page - 1) * pageSize, limit: pageSize },
        undefined,
        signal
      )
    )
  );

  for (const page of pages) {
    if (page.status === 'fulfilled') {
      count += (page.value.grids ?? []).filter(isPopulatedCity).length;
    }
  }

  return count;
};

/**
 * Builds the read-only Platform Overview snapshot:
 * - three device categories in parallel (`status: 'deployed'`);
 * - countries list;
 * - city count via paginated grids;
 * - `operational` / `transmitting` summed across the three categories;
 * - `fetchedAt` captured at the start of the fetch.
 */
export const getPlatformOverview = async (
  signal?: AbortSignal
): Promise<PlatformOverviewSnapshot> => {
  const fetchedAt = Date.now();

  // Skip the network entirely when the signal is already aborted — mirrors
  // siteSummary.ts, which returns early rather than firing in-flight requests.
  if (signal?.aborted) {
    return {
      categories: {
        lowcost: emptyCount(),
        bam: emptyCount(),
        gas: emptyCount(),
      },
      operational: 0,
      transmitting: 0,
      countries: [],
      citiesCovered: 0,
      fetchedAt,
    };
  }

  const [lowcost, bam, gas, countries, citiesCovered] = await Promise.all([
    deviceService.getDeviceSummaryCountAuthenticated(
      { category: 'lowcost', status: 'deployed' },
      signal
    ),
    deviceService.getDeviceSummaryCountAuthenticated(
      { category: 'bam', status: 'deployed' },
      signal
    ),
    deviceService.getDeviceSummaryCountAuthenticated(
      { category: 'gas', status: 'deployed' },
      signal
    ),
    deviceService.getCountriesAuthenticated(undefined, signal),
    resolveCitiesCovered(signal),
  ]);

  const operational = lowcost.operational + bam.operational + gas.operational;
  const transmitting =
    lowcost.transmitting + bam.transmitting + gas.transmitting;

  return {
    categories: { lowcost, bam, gas },
    operational,
    transmitting,
    countries: countries.countries ?? [],
    citiesCovered,
    fetchedAt,
  };
};
