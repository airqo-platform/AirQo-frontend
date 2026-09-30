import { renderHook, waitFor } from '@testing-library/react';

const mockUserState = {
  user: { id: 'user-1' } as { id: string } | null,
  activeGroup: { id: 'group-1' } as { id: string } | null,
  isLoading: false,
};

const mockPreferences = {
  selectedSiteIds: [] as string[],
  selectedSites: [] as Array<{ _id: string; name: string }>,
  preferences: null as {
    lastAccessed?: string;
    selected_sites?: Array<{ _id: string }>;
  } | null,
  isLoading: false,
  error: null as string | null,
};

const mockCharts = {
  data: [] as Array<{ _id: string }>,
  isLoading: false,
  error: null as Error | null,
};

const mockComparisons = {
  comparisons: [] as Array<{
    id: string;
    name: string;
    site_ids: string[];
    sites: Array<{ id: string; name?: string; location?: string }>;
    updated_at: string;
  }>,
  isLoading: false,
  error: null as string | null,
};

const mockReadings = {
  readings: [] as Array<{
    site_id: string;
    aqi_index: number;
    aqi_category: string;
    time: string;
  }>,
  isLoading: false,
  error: null as Error | null,
};

const mockRecentOptions: Array<Record<string, unknown>> = [];
const mockLoadWorkspaceDraft = jest.fn();

jest.mock('@/shared/hooks/useUser', () => ({
  useUser: () => mockUserState,
}));

jest.mock('@/shared/hooks/useGroupCharts', () => ({
  useGroupCharts: () => mockCharts,
}));

jest.mock('@/modules/analytics/hooks', () => ({
  useAnalyticsPreferences: () => mockPreferences,
}));

jest.mock('@/modules/analytics/hooks/useSavedComparisons', () => ({
  useSavedComparisons: () => mockComparisons,
}));

jest.mock('@/modules/analytics/hooks/useRecentReadings', () => ({
  useRecentReadings: (options: Record<string, unknown>) => {
    mockRecentOptions.push(options);
    return mockReadings;
  },
}));

jest.mock('@/modules/data-visualizer/utils/workspaceStorage', () => ({
  loadWorkspaceDraft: () => mockLoadWorkspaceDraft(),
}));

import { useHomeExperience } from '../hooks/useHomeExperience';

const resetState = () => {
  mockUserState.user = { id: 'user-1' };
  mockUserState.activeGroup = { id: 'group-1' };
  mockUserState.isLoading = false;
  mockPreferences.selectedSiteIds = [];
  mockPreferences.selectedSites = [];
  mockPreferences.preferences = null;
  mockPreferences.isLoading = false;
  mockPreferences.error = null;
  mockCharts.data = [];
  mockCharts.isLoading = false;
  mockCharts.error = null;
  mockComparisons.comparisons = [];
  mockComparisons.isLoading = false;
  mockComparisons.error = null;
  mockReadings.readings = [];
  mockReadings.isLoading = false;
  mockReadings.error = null;
  mockRecentOptions.length = 0;
  mockLoadWorkspaceDraft.mockReset();
  mockLoadWorkspaceDraft.mockResolvedValue(null);
};

describe('useHomeExperience', () => {
  beforeEach(() => {
    resetState();
  });

  it('classifies an empty account as new and skips artifact sections', async () => {
    const { result } = renderHook(() => useHomeExperience());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.mode).toBe('new');
    expect(result.current.continueItems).toEqual([]);
    expect(result.current.locationUpdates).toEqual([]);
  });

  it('keeps the homepage usable when one source fails', async () => {
    mockCharts.error = new Error('charts exploded: token=abc');
    mockComparisons.comparisons = [
      {
        id: 'comp-1',
        name: 'Keep me',
        site_ids: ['site-1'],
        sites: [{ id: 'site-1', location: 'Keep me site' }],
        updated_at: '2026-02-01T00:00:00.000Z',
      },
    ];

    const { result } = renderHook(() => useHomeExperience());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.hasPartialError).toBe(true);
    expect(result.current.continueItems.map(item => item.title)).toContain(
      'Keep me'
    );
    expect(JSON.stringify(result.current)).not.toContain('token=abc');
  });

  it('does not fetch when there is no active group', async () => {
    mockUserState.activeGroup = null;

    const { result } = renderHook(() => useHomeExperience());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.mode).toBe('new');
    expect(mockLoadWorkspaceDraft).not.toHaveBeenCalled();
    expect(mockRecentOptions.at(-1)).toEqual(
      expect.objectContaining({ enabled: false, siteIds: [] })
    );
  });

  it('counts saved locations from normalized site ids', async () => {
    mockPreferences.selectedSiteIds = ['s1', 's2'];
    mockPreferences.preferences = { selected_sites: [{ _id: 's1' }] };

    const { result } = renderHook(() => useHomeExperience());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.counts.savedLocations).toBe(2);
    expect(result.current.continueItems).toEqual([
      expect.objectContaining({
        type: 'saved-locations',
        description: 'Review readings for 2 saved locations.',
      }),
    ]);
  });

  it('drives the updates section from the most recent saved comparison', async () => {
    // Two saved comparisons; the list is already sorted `updated_at desc`,
    // so index 0 is the one the comparison table auto-loads.
    mockComparisons.comparisons = [
      {
        id: 'comp-new',
        name: 'Newest comparison',
        site_ids: ['a', 'b', 'c', 'd', 'e'],
        sites: [
          { id: 'a', location: 'Makerere University' },
          { id: 'b', name: 'Central Kampala' },
          { id: 'c' },
          { id: 'd', location: 'Kololo' },
          { id: 'e', location: 'Entebbe' },
        ],
        updated_at: '2026-02-01T00:00:00.000Z',
      },
      {
        id: 'comp-old',
        name: 'Older comparison',
        site_ids: ['x', 'y'],
        sites: [
          { id: 'x', location: 'Old comparison site' },
          { id: 'y', location: 'Second old site' },
        ],
        updated_at: '2026-01-01T00:00:00.000Z',
      },
    ];
    mockReadings.readings = [
      {
        site_id: 'a',
        aqi_index: 42,
        aqi_category: 'Good',
        time: '2026-03-01T00:00:00.000Z',
      },
      {
        site_id: 'x',
        aqi_index: 99,
        aqi_category: 'Hazardous',
        time: '2026-01-01T00:00:00.000Z',
      },
    ];

    const { result } = renderHook(() => useHomeExperience());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.activeComparison).toEqual({
      id: 'comp-new',
      name: 'Newest comparison',
    });
    expect(result.current.counts.comparisons).toBe(2);
    expect(mockRecentOptions.at(-1)).toEqual(
      expect.objectContaining({
        enabled: true,
        measurementsOnly: true,
        keepPreviousData: false,
        siteIds: ['a', 'b', 'c'],
        groupId: 'group-1',
      })
    );
    expect(result.current.locationUpdates).toEqual([
      {
        name: 'Makerere University',
        href: '/user/air-quality/analytics/sites/makerere-university?site_id=a',
        aqiIndex: 42,
        aqiCategory: 'Good',
        measuredAt: '2026-03-01T00:00:00.000Z',
      },
      {
        name: 'Central Kampala',
        href: '/user/air-quality/analytics/sites/central-kampala?site_id=b',
        aqiIndex: null,
        aqiCategory: null,
        measuredAt: undefined,
      },
      {
        name: 'Saved location',
        href: '/user/air-quality/analytics?view=comparison',
        aqiIndex: null,
        aqiCategory: null,
        measuredAt: undefined,
      },
    ]);

    const updates = JSON.stringify(result.current.locationUpdates);
    expect(updates).not.toContain('Old comparison site');
    expect(updates).not.toContain('site_id=x');
  });

  it('skips readings and updates when there are no saved comparisons', async () => {
    const { result } = renderHook(() => useHomeExperience());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.activeComparison).toBeNull();
    expect(result.current.locationUpdates).toEqual([]);
    expect(mockRecentOptions.at(-1)).toEqual(
      expect.objectContaining({ enabled: false, siteIds: [] })
    );
  });

  it('drops readings that belong to a previous selection', async () => {
    mockComparisons.comparisons = [
      {
        id: 'comp-1',
        name: 'Current comparison',
        site_ids: ['new-site'],
        sites: [{ id: 'new-site', location: 'New place' }],
        updated_at: '2026-02-01T00:00:00.000Z',
      },
    ];
    mockReadings.readings = [
      {
        site_id: 'old-site',
        aqi_index: 99,
        aqi_category: 'Hazardous',
        time: '2026-01-01T00:00:00.000Z',
      },
    ];

    const { result } = renderHook(() => useHomeExperience());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.locationUpdates).toEqual([
      expect.objectContaining({
        name: 'New place',
        aqiIndex: null,
        aqiCategory: null,
      }),
    ]);
    expect(JSON.stringify(result.current.locationUpdates)).not.toContain(
      'old-site'
    );
  });

  it('discards a visualizer draft that resolves after the group changes', async () => {
    let resolveFirst: (value: unknown) => void = () => undefined;
    mockLoadWorkspaceDraft
      .mockImplementationOnce(
        () =>
          new Promise(resolve => {
            resolveFirst = resolve;
          })
      )
      .mockResolvedValueOnce({
        savedAt: '2026-03-01T00:00:00.000Z',
        charts: [{ id: 'b' }, { id: 'c' }],
        datasets: [{ id: 'dataset' }],
      });

    const { result, rerender } = renderHook(() => useHomeExperience());
    mockUserState.activeGroup = { id: 'group-2' };
    rerender();

    await waitFor(() =>
      expect(
        result.current.continueItems.some(item =>
          item.description.includes('2 charts')
        )
      ).toBe(true)
    );

    resolveFirst({
      savedAt: '2026-01-01T00:00:00.000Z',
      charts: [{ id: 'stale' }],
      datasets: [{ id: 'dataset' }],
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(
      result.current.continueItems.some(item =>
        item.description.includes('1 chart')
      )
    ).toBe(false);
  });

  it('survives unavailable IndexedDB without blocking other artifacts', async () => {
    mockLoadWorkspaceDraft.mockRejectedValue(
      new Error('Draft storage is not available.')
    );
    mockCharts.data = [{ _id: 'chart-1' }];

    const { result } = renderHook(() => useHomeExperience());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.hasPartialError).toBe(true);
    expect(result.current.counts.drafts).toBe(0);
    expect(result.current.continueItems.map(item => item.type)).toEqual([
      'saved-charts',
    ]);
    expect(JSON.stringify(result.current)).not.toContain(
      'Draft storage is not available'
    );
  });

  it('uses demo fixtures without reading local draft storage', async () => {
    const { result } = renderHook(() => useHomeExperience('error'));

    expect(result.current.hasPartialError).toBe(true);
    expect(result.current.mode).toBe('new');
    expect(result.current.continueItems).toEqual([]);
    expect(mockLoadWorkspaceDraft).not.toHaveBeenCalled();
  });
});
