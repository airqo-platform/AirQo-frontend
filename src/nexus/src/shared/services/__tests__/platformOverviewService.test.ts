import type { DeviceSummaryCount, CountryData, Grid } from '../../types/api';
import { deviceService } from '../deviceService';
import { getPlatformOverview } from '../platformOverviewService';

jest.mock('../deviceService', () => ({
  deviceService: {
    getDeviceSummaryCountAuthenticated: jest.fn(),
    getCountriesAuthenticated: jest.fn(),
    getGridsSummaryAuthenticated: jest.fn(),
  },
}));

const mockGetSummaryCount =
  deviceService.getDeviceSummaryCountAuthenticated as jest.Mock;
const mockGetCountries = deviceService.getCountriesAuthenticated as jest.Mock;
const mockGetGrids = deviceService.getGridsSummaryAuthenticated as jest.Mock;

const count = (
  overrides: Partial<DeviceSummaryCount> = {}
): DeviceSummaryCount => ({
  total_monitors: 10,
  operational: 8,
  transmitting: 6,
  not_transmitting: 2,
  data_available: 5,
  ...overrides,
});

const country = (name: string, sites: number): CountryData => ({
  country: name,
  sites,
  flag_url: `https://example.com/${name.toLowerCase()}.png`,
});

const grid = (overrides: Partial<Grid> = {}): Grid => ({
  _id: 'grid-1',
  groups: [],
  visibility: true,
  name: 'Kampala',
  admin_level: 'city',
  network: 'airqo',
  long_name: 'Kampala',
  createdAt: '2024-01-01T00:00:00.000Z',
  sites: [],
  numberOfSites: 3,
  ...overrides,
});

const gridsResponse = (
  grids: Grid[],
  meta: { totalPages: number; limit: number } = { totalPages: 1, limit: 80 }
) => ({
  success: true,
  message: 'ok',
  meta: {
    total: grids.length,
    limit: meta.limit,
    skip: 0,
    page: 1,
    totalPages: meta.totalPages,
  },
  grids,
});

describe('getPlatformOverview', () => {
  beforeEach(() => {
    mockGetSummaryCount.mockReset();
    mockGetCountries.mockReset();
    mockGetGrids.mockReset();
  });

  it('calls the three categories in parallel with status: deployed and the same signal', async () => {
    const controller = new AbortController();
    mockGetSummaryCount.mockImplementation(() => Promise.resolve(count()));
    mockGetCountries.mockResolvedValueOnce({ countries: [] });
    mockGetGrids.mockResolvedValueOnce(gridsResponse([grid()]));

    await getPlatformOverview(controller.signal);

    expect(mockGetSummaryCount).toHaveBeenCalledTimes(3);
    const categories = mockGetSummaryCount.mock.calls.map(
      (call: [{ category: string; status: string }]) => call[0].category
    );
    expect(categories.sort()).toEqual(['bam', 'gas', 'lowcost']);

    for (const call of mockGetSummaryCount.mock.calls) {
      expect(call[0].status).toBe('deployed');
      expect(call[1]).toBe(controller.signal);
    }
  });

  it('returns the country count and list', async () => {
    mockGetSummaryCount.mockResolvedValue(count());
    mockGetCountries.mockResolvedValueOnce({
      countries: [country('Uganda', 12), country('Kenya', 7)],
    });
    mockGetGrids.mockResolvedValueOnce(gridsResponse([grid()]));

    const result = await getPlatformOverview();

    expect(result.countries).toHaveLength(2);
    expect(result.countries[0].country).toBe('Uganda');
  });

  it('sums operational and transmitting across the three categories', async () => {
    mockGetSummaryCount.mockImplementation((params: { category: string }) => {
      if (params.category === 'lowcost')
        return Promise.resolve(count({ operational: 10, transmitting: 8 }));
      if (params.category === 'bam')
        return Promise.resolve(count({ operational: 3, transmitting: 2 }));
      return Promise.resolve(count({ operational: 1, transmitting: 1 }));
    });
    mockGetCountries.mockResolvedValueOnce({ countries: [] });
    mockGetGrids.mockResolvedValueOnce(gridsResponse([grid()]));

    const result = await getPlatformOverview();

    expect(result.operational).toBe(14);
    expect(result.transmitting).toBe(11);
  });

  it('counts cities across multiple pages using page size from meta.limit', async () => {
    const pageSize = 80;
    const cityGrids = Array.from({ length: pageSize }, (_, i) =>
      grid({ _id: `city-${i}`, admin_level: 'city', numberOfSites: i + 1 })
    );

    mockGetSummaryCount.mockResolvedValue(count());
    mockGetCountries.mockResolvedValueOnce({ countries: [] });

    // Page 1: full page, reports 3 total pages.
    mockGetGrids.mockResolvedValueOnce(
      gridsResponse(cityGrids, { totalPages: 3, limit: pageSize })
    );
    // Pages 2 and 3: partial pages.
    const page2 = Array.from({ length: 40 }, (_, i) =>
      grid({ _id: `city-p2-${i}`, admin_level: 'city', numberOfSites: 1 })
    );
    const page3 = Array.from({ length: 20 }, (_, i) =>
      grid({ _id: `city-p3-${i}`, admin_level: 'city', numberOfSites: 1 })
    );
    mockGetGrids.mockResolvedValueOnce(
      gridsResponse(page2, { totalPages: 3, limit: pageSize })
    );
    mockGetGrids.mockResolvedValueOnce(
      gridsResponse(page3, { totalPages: 3, limit: pageSize })
    );

    const result = await getPlatformOverview();

    // 80 + 40 + 20 = 140 city grids.
    expect(result.citiesCovered).toBe(140);
    expect(mockGetGrids).toHaveBeenCalledTimes(3);
    // Page 2 skip = pageSize, page 3 skip = 2 * pageSize.
    expect(mockGetGrids.mock.calls[1][0]).toMatchObject({ skip: pageSize });
    expect(mockGetGrids.mock.calls[2][0]).toMatchObject({ skip: 2 * pageSize });
  });

  it('caps pagination at 25 pages', async () => {
    const pageSize = 80;
    const cityGrids = Array.from({ length: pageSize }, (_, i) =>
      grid({ _id: `city-${i}`, admin_level: 'city', numberOfSites: 1 })
    );

    mockGetSummaryCount.mockResolvedValue(count());
    mockGetCountries.mockResolvedValueOnce({ countries: [] });

    // Page 1 reports an absurd totalPages; the fan-out must be capped at 25.
    mockGetGrids.mockResolvedValueOnce(
      gridsResponse(cityGrids, { totalPages: 999, limit: pageSize })
    );
    mockGetGrids.mockResolvedValue(
      gridsResponse([], { totalPages: 999, limit: pageSize })
    );

    await getPlatformOverview();

    // 1 (page 1) + 24 remaining = 25 total calls.
    expect(mockGetGrids).toHaveBeenCalledTimes(25);
  });

  it('excludes zero-site and non-city grids', async () => {
    const mixed = [
      grid({ _id: 'city-pop', admin_level: 'city', numberOfSites: 2 }),
      grid({
        _id: 'city-empty',
        admin_level: 'city',
        numberOfSites: 0,
        sites: [],
      }),
      grid({ _id: 'region-1', admin_level: 'region', numberOfSites: 5 }),
    ];

    mockGetSummaryCount.mockResolvedValue(count());
    mockGetCountries.mockResolvedValueOnce({ countries: [] });
    mockGetGrids.mockResolvedValueOnce(
      gridsResponse(mixed, { totalPages: 1, limit: 80 })
    );

    const result = await getPlatformOverview();

    expect(result.citiesCovered).toBe(1);
  });

  it('tolerates a failed later page but rejects when page 1 fails', async () => {
    const pageSize = 80;
    const cityGrids = Array.from({ length: pageSize }, (_, i) =>
      grid({ _id: `city-${i}`, admin_level: 'city', numberOfSites: 1 })
    );

    mockGetSummaryCount.mockResolvedValue(count());
    mockGetCountries.mockResolvedValueOnce({ countries: [] });

    // Page 1 succeeds with 2 total pages; page 2 rejects.
    mockGetGrids.mockResolvedValueOnce(
      gridsResponse(cityGrids, { totalPages: 2, limit: pageSize })
    );
    mockGetGrids.mockRejectedValueOnce(new Error('page 2 exploded'));

    const result = await getPlatformOverview();

    // Page 1's cities survive; the failed page is skipped.
    expect(result.citiesCovered).toBe(pageSize);

    // Page 1 failure rejects the whole call.
    mockGetSummaryCount.mockResolvedValue(count());
    mockGetCountries.mockResolvedValueOnce({ countries: [] });
    mockGetGrids.mockRejectedValueOnce(new Error('page 1 exploded'));

    await expect(getPlatformOverview()).rejects.toThrow('page 1 exploded');
  });

  it('short-circuits the network when the signal is already aborted', async () => {
    const controller = new AbortController();
    controller.abort();

    const result = await getPlatformOverview(controller.signal);

    expect(mockGetSummaryCount).not.toHaveBeenCalled();
    expect(mockGetCountries).not.toHaveBeenCalled();
    expect(mockGetGrids).not.toHaveBeenCalled();
    expect(result.citiesCovered).toBe(0);
    expect(result.countries).toEqual([]);
  });

  it('captures fetchedAt at the start of the fetch', async () => {
    mockGetSummaryCount.mockResolvedValue(count());
    mockGetCountries.mockResolvedValueOnce({ countries: [] });
    mockGetGrids.mockResolvedValueOnce(gridsResponse([grid()]));

    const before = Date.now();
    const result = await getPlatformOverview();
    const after = Date.now();

    expect(result.fetchedAt).toBeGreaterThanOrEqual(before);
    expect(result.fetchedAt).toBeLessThanOrEqual(after);
  });
});
