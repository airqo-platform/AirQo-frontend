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

jest.mock('@/shared/utils/siteUtils', () => ({
  getSiteDisplayName: (site: { name?: string }) =>
    site.name || 'Saved location',
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

  it('requests at most three sites in one measurements-only readings call', async () => {
    mockPreferences.selectedSiteIds = ['s1', 's2', 's3', 's4'];

    renderHook(() => useHomeExperience());

    expect(mockRecentOptions.at(-1)).toEqual(
      expect.objectContaining({
        enabled: true,
        measurementsOnly: true,
        keepPreviousData: false,
        siteIds: ['s1', 's2', 's3'],
        groupId: 'group-1',
      })
    );
  });

  it('drops readings that belong to a previous selection', async () => {
    mockPreferences.selectedSiteIds = ['new-site'];
    mockPreferences.selectedSites = [{ _id: 'new-site', name: 'New place' }];
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
