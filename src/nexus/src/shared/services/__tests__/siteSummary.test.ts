import type { SitesSummaryResponse } from '../../types/api';
import { deviceService } from '../deviceService';
import { fetchAllSitesSummary } from '../siteSummary';

jest.mock('../deviceService', () => ({
  deviceService: {
    getSitesSummaryAuthenticated: jest.fn(),
  },
}));

const mockGetSitesSummary =
  deviceService.getSitesSummaryAuthenticated as jest.Mock;

const SITES_SUMMARY_PAGE_SIZE = 80;

/** Drains pending microtasks so in-flight promise chains settle. */
const flushAsync = () => new Promise<void>(resolve => setTimeout(resolve, 0));

const buildPage = (
  page: number,
  totalPages: number,
  siteCount = SITES_SUMMARY_PAGE_SIZE
): SitesSummaryResponse => ({
  success: true,
  message: 'ok',
  meta: {
    total: (totalPages - 1) * SITES_SUMMARY_PAGE_SIZE + siteCount,
    totalResults: (totalPages - 1) * SITES_SUMMARY_PAGE_SIZE + siteCount,
    limit: SITES_SUMMARY_PAGE_SIZE,
    skip: (page - 1) * SITES_SUMMARY_PAGE_SIZE,
    page,
    totalPages,
    detailLevel: 'summary',
    usedCache: false,
  },
  sites: Array.from({ length: siteCount }, (_, index) => ({
    site_id: `site-${page}-${index}`,
    name: `Site ${page}.${index}`,
  })),
});

describe('fetchAllSitesSummary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns page 1 immediately when totalPages <= 1', async () => {
    mockGetSitesSummary.mockResolvedValueOnce(buildPage(1, 1, 37));

    await expect(fetchAllSitesSummary()).resolves.toHaveLength(37);
    expect(mockGetSitesSummary).toHaveBeenCalledTimes(1);
    expect(mockGetSitesSummary).toHaveBeenCalledWith(
      { skip: 0, limit: SITES_SUMMARY_PAGE_SIZE },
      undefined
    );
  });

  it('issues every remaining page BEFORE any of them resolves (parallel, no artificial delay)', async () => {
    const TOTAL_PAGES = 9; // ~717-site fleet at limit 80
    const resolvers: Array<(value: SitesSummaryResponse) => void> = [];
    mockGetSitesSummary.mockImplementation(
      () =>
        new Promise<SitesSummaryResponse>(resolve => {
          resolvers.push(resolve);
        })
    );

    const pending = fetchAllSitesSummary();

    // Page 1 is requested synchronously and gates the fan-out.
    expect(resolvers).toHaveLength(1);
    resolvers[0](buildPage(1, TOTAL_PAGES));
    await flushAsync();

    // All 8 remaining pages were issued while NONE of them had resolved —
    // they cannot have been fetched sequentially.
    expect(mockGetSitesSummary).toHaveBeenCalledTimes(TOTAL_PAGES);
    expect(resolvers).toHaveLength(TOTAL_PAGES);
    expect(mockGetSitesSummary.mock.calls.map(call => call[0].skip)).toEqual([
      0, 80, 160, 240, 320, 400, 480, 560, 640,
    ]);

    resolvers.slice(1).forEach((resolve, index) => {
      resolve(buildPage(index + 2, TOTAL_PAGES));
    });

    await expect(pending).resolves.toHaveLength(
      TOTAL_PAGES * SITES_SUMMARY_PAGE_SIZE
    );
  });

  it('passes the SAME AbortSignal to every page request', async () => {
    const controller = new AbortController();
    mockGetSitesSummary.mockImplementation((params: { skip: number }) =>
      Promise.resolve(buildPage(params.skip / SITES_SUMMARY_PAGE_SIZE + 1, 2))
    );

    await fetchAllSitesSummary(controller.signal);

    expect(mockGetSitesSummary).toHaveBeenCalledTimes(2);
    for (const call of mockGetSitesSummary.mock.calls) {
      expect(call[1]).toBe(controller.signal);
    }
  });

  it('skips the network entirely when the signal is already aborted', async () => {
    const controller = new AbortController();
    controller.abort();

    await expect(fetchAllSitesSummary(controller.signal)).resolves.toEqual([]);
    expect(mockGetSitesSummary).not.toHaveBeenCalled();
  });

  it('keeps earlier pages when a later page fails (partial results)', async () => {
    mockGetSitesSummary
      .mockResolvedValueOnce(buildPage(1, 3))
      .mockRejectedValueOnce(new Error('page 2 exploded'))
      .mockResolvedValueOnce(buildPage(3, 3));

    const sites = await fetchAllSitesSummary();

    expect(sites).toHaveLength(SITES_SUMMARY_PAGE_SIZE * 2);
    expect(sites[0]).toEqual(expect.objectContaining({ site_id: 'site-1-0' }));
    expect(sites[SITES_SUMMARY_PAGE_SIZE]).toEqual(
      expect.objectContaining({ site_id: 'site-3-0' })
    );
  });

  it('ignores pages rejected by an in-flight abort and keeps what already loaded', async () => {
    const controller = new AbortController();
    const abortError = new Error('The operation was aborted.');
    abortError.name = 'AbortError';

    mockGetSitesSummary
      .mockImplementationOnce(async () => {
        const page = buildPage(1, 3);
        controller.abort();
        return page;
      })
      .mockRejectedValueOnce(abortError)
      .mockRejectedValueOnce(abortError);

    await expect(fetchAllSitesSummary(controller.signal)).resolves.toHaveLength(
      SITES_SUMMARY_PAGE_SIZE
    );
    expect(mockGetSitesSummary).toHaveBeenCalledTimes(3);
  });

  it('caps the fan-out at 25 pages even when the backend reports far more', async () => {
    mockGetSitesSummary.mockImplementation((params: { skip: number }) =>
      Promise.resolve(buildPage(params.skip / SITES_SUMMARY_PAGE_SIZE + 1, 500))
    );

    const sites = await fetchAllSitesSummary();

    // Page 1 + the capped 24 remaining pages — never an unbounded burst.
    expect(mockGetSitesSummary).toHaveBeenCalledTimes(25);
    expect(sites).toHaveLength(25 * SITES_SUMMARY_PAGE_SIZE);
  });
});
