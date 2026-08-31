import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { themeReducer } from '@/modules/themes';
import uiReducer from '@/shared/store/uiSlice';
import userReducer from '@/shared/store/userSlice';
import insightsReducer from '@/shared/store/insightsSlice';
import cohortReducer from '@/shared/store/cohortSlice';
import mapSettingsReducer from '@/shared/store/mapSettingsSlice';
import selectedLocationReducer from '@/shared/store/selectedLocationSlice';
import analyticsReducer from '@/modules/analytics/store/analyticsSlice';
import type { RecentReading, SavedComparison } from '@/shared/types/api';

// ── Mock the saved-comparisons service ──────────────────────────────────────
const comparisonsService = {
  list: jest.fn(),
  get: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

jest.mock('@/shared/services/comparisonsService', () => ({
  comparisonsService,
}));

// ── Controllable mock state for useSavedComparisons ─────────────────────────
let mockComparisons: SavedComparison[] = [];
let mockIsLoading = false;
let mockIsMutating = false;
let mockSavedError: string | null = null;
const mockRefresh = jest.fn();

jest.mock('@/modules/analytics/hooks/useSavedComparisons', () => ({
  useSavedComparisons: () => ({
    comparisons: mockComparisons,
    isLoading: mockIsLoading,
    isMutating: mockIsMutating,
    error: mockSavedError,
    refresh: mockRefresh,
    createComparison: async (payload: unknown) => {
      const r = await comparisonsService.create(payload);
      return r.comparison;
    },
    renameComparison: async (id: string, name: string) => {
      const r = await comparisonsService.update(id, { name });
      return r.comparison;
    },
    updateComparison: async (id: string, payload: unknown) => {
      const r = await comparisonsService.update(id, payload);
      return r.comparison;
    },
    deleteComparison: async (id: string) => {
      const r = await comparisonsService.remove(id);
      return r.success;
    },
  }),
}));

// ── Controllable mock state for useRecentReadings ───────────────────────────
let mockReadings: RecentReading[] = [];
let mockReadingsLoading = false;
let mockReadingsError: Error | null = null;
const mockRefetchReadings = jest.fn();
const mockUseRecentReadings = jest.fn();

jest.mock('@/modules/analytics/hooks/useRecentReadings', () => ({
  useRecentReadings: (...args: unknown[]) => {
    mockUseRecentReadings(...args);
    return {
      readings: mockReadings,
      isLoading: mockReadingsLoading,
      isFetching: false,
      error: mockReadingsError,
      refetch: mockRefetchReadings,
    };
  },
}));

jest.mock('@/shared/hooks/useUser', () => ({
  useUser: () => ({
    user: { id: 'user-1' },
    activeGroup: { id: 'group-1' },
    isLoading: false,
  }),
}));

jest.mock('flowbite-react', () => ({
  Tooltip: () => null,
}));

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock('@/shared/providers/aqi-config-provider', () => ({
  useAqiConfig: () => ({
    config: null,
    enabled: true,
    isLoading: false,
    error: undefined,
    refresh: jest.fn(),
  }),
}));

const mockToSiteSlug = jest.fn(
  (name: string) =>
    name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'location'
);
jest.mock('@/modules/data-download/utils/siteDetails', () => ({
  toSiteSlug: (name: string) => mockToSiteSlug(name),
}));

const mockRememberSiteSlug = jest.fn();
jest.mock('@/modules/data-download/hooks/useResolveSiteByName', () => ({
  rememberSiteSlug: (
    slug: string,
    entry: { siteId: string; displayName: string }
  ) => mockRememberSiteSlug(slug, entry),
}));

jest.mock('../../../hooks/useCohortSelection', () => ({
  useSitesForSelection: () => ({
    sites: [
      {
        id: 'site-1',
        location: 'Kampala Site',
        city: 'Kampala',
        country: 'Uganda',
        owner: 'AirQo',
      },
      {
        id: 'site-2',
        location: 'Jinja Site',
        city: 'Jinja',
        country: 'Uganda',
        owner: 'AirQo',
      },
    ],
    totalSites: 2,
    totalPages: 1,
    currentPage: 1,
    pageSize: 6,
    searchTerm: '',
    isRefreshing: false,
    isLoading: false,
    error: null,
    setCurrentPage: jest.fn(),
    setPageSize: jest.fn(),
    setSearchTerm: jest.fn(),
    retry: jest.fn(),
  }),
}));

// eslint-disable-next-line import/first
import { ComparisonView } from '../ComparisonView';

const makeReading = (
  overrides: Partial<Record<string, unknown>> = {}
): RecentReading =>
  ({
    _id: 'reading-1',
    site_id: 'site-1',
    time: '2026-08-22T09:05:00Z',
    __v: 0,
    aqi_category: 'Moderate',
    aqi_color: 'ECAA06',
    aqi_color_name: 'yellow',
    aqi_index: 72,
    aqi_ranges: {},
    averages: {},
    createdAt: '2026-08-22T09:05:00Z',
    device: 'device-1',
    frequency: 'hourly',
    health_tips: [],
    is_reading_primary: true,
    no2: { value: 3 },
    pm10: { value: 15 },
    pm2_5: { value: 12.3 },
    siteDetails: {
      _id: 'site-1',
      formatted_name: 'Formatted Site',
      street: '',
      parish: '',
      village: '',
      sub_county: '',
      town: '',
      city: 'Kampala',
      district: '',
      county: '',
      region: '',
      country: 'Uganda',
      name: 'Kampala Site',
      description: '',
      location_name: 'Location Name',
      search_name: 'Kampala Site',
      approximate_latitude: 0.3,
      approximate_longitude: 32.6,
      data_provider: 'AirQo',
      site_category: { tags: [], category: 'Reference' },
    },
    timeDifferenceHours: 2,
    updatedAt: '2026-08-22T09:05:00Z',
    ...overrides,
  }) as unknown as RecentReading;

const makeSavedComparison = (
  overrides: Partial<SavedComparison> = {}
): SavedComparison => ({
  id: 'comp-1',
  user_id: 'user-1',
  group_id: 'group-1',
  name: 'Saved comparison',
  site_ids: ['site-1'],
  sites: [
    {
      id: 'site-1',
      name: 'Kampala Site',
      location: 'Kampala Site',
      city: 'Kampala',
      country: 'Uganda',
    },
  ],
  created_at: '2026-08-01T00:00:00Z',
  updated_at: '2026-08-22T00:00:00Z',
  ...overrides,
});

const renderComparisonView = (groupId = 'group-1') => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const store = configureStore({
    reducer: {
      theme: themeReducer,
      ui: uiReducer,
      user: userReducer,
      insights: insightsReducer,
      cohorts: cohortReducer,
      mapSettings: mapSettingsReducer,
      selectedLocation: selectedLocationReducer,
      analytics: analyticsReducer,
    },
  });
  const utils = render(
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ComparisonView groupId={groupId} />
      </QueryClientProvider>
    </Provider>
  );
  return { ...utils, queryClient };
};

const listResponse = (comparisons: SavedComparison[]) => ({
  success: true,
  message: 'ok',
  comparisons,
  meta: {
    total: comparisons.length,
    total_pages: 1,
    page: 1,
    skip: 0,
    limit: 100,
  },
});

describe('ComparisonView integration (saved comparisons)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPush.mockReset();
    mockRememberSiteSlug.mockReset();
    mockToSiteSlug.mockImplementation(
      (name: string) =>
        name
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '') || 'location'
    );
    mockComparisons = [];
    mockIsLoading = false;
    mockIsMutating = false;
    mockSavedError = null;
    mockReadings = [];
    mockReadingsLoading = false;
    mockReadingsError = null;
    comparisonsService.list.mockResolvedValue(listResponse([]));
    comparisonsService.create.mockResolvedValue({
      success: true,
      message: 'ok',
      comparison: makeSavedComparison({ id: 'new-comp' }),
    });
    comparisonsService.update.mockResolvedValue({
      success: true,
      message: 'ok',
      comparison: makeSavedComparison({}),
    });
    comparisonsService.remove.mockResolvedValue({ success: true });
    mockReadings = [makeReading({ site_id: 'site-1' })];
  });

  it('auto-loads the most recent saved comparison once per group when the list resolves', async () => {
    mockComparisons = [
      makeSavedComparison({
        id: 'recent',
        name: 'Recent Pick',
        site_ids: ['site-1'],
        sites: [
          {
            id: 'site-1',
            name: 'Kampala Site',
            location: 'Kampala Site',
            city: 'Kampala',
            country: 'Uganda',
          },
        ],
      }),
      makeSavedComparison({
        id: 'older',
        site_ids: ['site-2'],
        updated_at: '2026-08-01T00:00:00Z',
      }),
    ];
    comparisonsService.list.mockResolvedValue(listResponse(mockComparisons));

    renderComparisonView();

    // The most recent comparison's site is pre-checked...
    const savedCheckbox = await screen.findByLabelText('Select item site-1');
    await waitFor(() => expect(savedCheckbox).toBeChecked());

    // ...its readings render in the table...
    expect(await screen.findByText('72')).toBeInTheDocument();

    // ...and the header chip shows "Saved · <name>".
    expect(await screen.findByText('Saved · Recent Pick')).toBeInTheDocument();
  });

  it('starts empty (honest empty picker) when there are no saved comparisons', async () => {
    mockComparisons = [];
    comparisonsService.list.mockResolvedValue(listResponse([]));

    renderComparisonView();

    // No site is pre-checked.
    const checkbox = await screen.findByLabelText('Select item site-1');
    await waitFor(() => expect(checkbox).not.toBeChecked());
  });

  it('opens the name dialog on Save with no loaded comparison, then creates and shows Saved', async () => {
    const user = userEvent.setup();
    mockComparisons = [];
    comparisonsService.list.mockResolvedValue(listResponse([]));

    renderComparisonView();

    // Pick a location (no auto-load since the list is empty).
    const checkbox = await screen.findByLabelText('Select item site-1');
    await user.click(checkbox);

    const saveButton = screen.getByRole('button', { name: /save selection/i });
    await waitFor(() => expect(saveButton).not.toBeDisabled());

    await user.click(saveButton);

    // Name dialog opens.
    expect(await screen.findByText('Save comparison')).toBeInTheDocument();
    const nameInput = screen.getByLabelText('Comparison name');
    await user.clear(nameInput);
    await user.type(nameInput, 'My named comparison');

    // Confirm.
    const confirmButton = screen.getByRole('button', { name: 'Save' });
    comparisonsService.create.mockResolvedValueOnce({
      success: true,
      message: 'ok',
      comparison: makeSavedComparison({
        id: 'new-comp',
        name: 'My named comparison',
      }),
    });
    await user.click(confirmButton);

    // comparisonsService.create called with the full snapshot.
    await waitFor(() =>
      expect(comparisonsService.create).toHaveBeenCalledTimes(1)
    );
    expect(comparisonsService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        group_id: 'group-1',
        name: 'My named comparison',
        site_ids: ['site-1'],
        sites: expect.arrayContaining([
          expect.objectContaining({ id: 'site-1' }),
        ]),
      })
    );

    expect(await screen.findByText('Saved')).toBeInTheDocument();
  });

  it('updates the loaded comparison (PATCH) on Save when the selection is dirty, then shows Saved', async () => {
    const user = userEvent.setup();
    mockComparisons = [
      makeSavedComparison({
        id: 'loaded',
        site_ids: ['site-1'],
        sites: [
          {
            id: 'site-1',
            name: 'Kampala Site',
            location: 'Kampala Site',
            city: 'Kampala',
            country: 'Uganda',
          },
        ],
      }),
    ];
    comparisonsService.list.mockResolvedValue(listResponse(mockComparisons));

    renderComparisonView();

    // Auto-loads site-1 (loaded comparison).
    const siteOneCheckbox = await screen.findByLabelText('Select item site-1');
    await waitFor(() => expect(siteOneCheckbox).toBeChecked());

    // User adds site-2 → dirty.
    await user.click(screen.getByLabelText('Select item site-2'));

    const saveButton = screen.getByRole('button', { name: /save selection/i });
    await waitFor(() => expect(saveButton).not.toBeDisabled());

    comparisonsService.update.mockResolvedValueOnce({
      success: true,
      message: 'ok',
      comparison: makeSavedComparison({ id: 'loaded' }),
    });
    await user.click(saveButton);

    // PATCH update with the new site_ids.
    await waitFor(() =>
      expect(comparisonsService.update).toHaveBeenCalledTimes(1)
    );
    expect(comparisonsService.update).toHaveBeenCalledWith(
      'loaded',
      expect.objectContaining({
        site_ids: ['site-1', 'site-2'],
        sites: expect.arrayContaining([
          expect.objectContaining({ id: 'site-1' }),
        ]),
      })
    );

    expect(await screen.findByText('Saved')).toBeInTheDocument();
  });

  it('disables Save when the selection is clean or empty', async () => {
    const user = userEvent.setup();
    mockComparisons = [
      makeSavedComparison({ id: 'loaded', site_ids: ['site-1'] }),
    ];
    comparisonsService.list.mockResolvedValue(listResponse(mockComparisons));

    renderComparisonView();

    const saveButton = await screen.findByRole('button', {
      name: /save selection/i,
    });

    // Auto-loaded selection matches the saved one → clean → disabled.
    await waitFor(() => expect(saveButton).toBeDisabled());

    // Make it dirty → enabled.
    await user.click(await screen.findByLabelText('Select item site-2'));
    await waitFor(() => expect(saveButton).not.toBeDisabled());
  });

  it('shows the error state with retry when the readings request fails', async () => {
    mockComparisons = [
      makeSavedComparison({ id: 'loaded', site_ids: ['site-1'] }),
    ];
    comparisonsService.list.mockResolvedValue(listResponse(mockComparisons));
    mockReadings = [];
    mockReadingsError = new Error('Unable to load the latest readings');

    renderComparisonView();

    // Title and description resolve to the same string → assert at least one match.
    expect(
      await screen.findAllByText(/unable to load the latest readings/i)
    ).not.toHaveLength(0);
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('renders the AQI legend pollutant switcher and toggling does not crash', async () => {
    const user = userEvent.setup();
    mockComparisons = [];
    comparisonsService.list.mockResolvedValue(listResponse([]));

    renderComparisonView();

    const radiogroup = await screen.findByRole('radiogroup', {
      name: /aqi legend pollutant/i,
    });
    expect(radiogroup).toBeInTheDocument();

    const pm25Radio = screen.getByRole('radio', { name: 'PM2.5' });
    const pm10Radio = screen.getByRole('radio', { name: 'PM10' });
    expect(pm25Radio).toBeInTheDocument();
    expect(pm10Radio).toBeInTheDocument();
    expect(pm25Radio).toBeChecked();

    expect(screen.getByText('AQI scale unavailable')).toBeInTheDocument();

    await user.click(pm10Radio);
    expect(pm10Radio).toBeChecked();
    expect(pm25Radio).not.toBeChecked();
    expect(screen.getByText('AQI scale unavailable')).toBeInTheDocument();
  });

  it('drops stale selection immediately on group switch and auto-loads when group B has saved comparisons', async () => {
    // Group A has a saved comparison with site-1.
    mockComparisons = [
      makeSavedComparison({
        id: 'comp-a',
        name: 'Group A Pick',
        site_ids: ['site-1'],
        group_id: 'group-A',
      }),
    ];
    comparisonsService.list.mockResolvedValue(listResponse(mockComparisons));

    // Render with group A first.
    const { rerender } = render(
      (() => {
        const queryClient = new QueryClient({
          defaultOptions: { queries: { retry: false } },
        });
        const store = configureStore({
          reducer: {
            theme: themeReducer,
            ui: uiReducer,
            user: userReducer,
            insights: insightsReducer,
            cohorts: cohortReducer,
            mapSettings: mapSettingsReducer,
            selectedLocation: selectedLocationReducer,
            analytics: analyticsReducer,
          },
        });
        return (
          <Provider store={store}>
            <QueryClientProvider client={queryClient}>
              <ComparisonView groupId="group-A" />
            </QueryClientProvider>
          </Provider>
        );
      })()
    );

    // Wait for auto-load on group A.
    const siteOneCheckbox = await screen.findByLabelText('Select item site-1');
    await waitFor(() => expect(siteOneCheckbox).toBeChecked());

    // Ensure the chip shows the group A comparison name.
    expect(await screen.findByText('Saved · Group A Pick')).toBeInTheDocument();

    // Now switch to group B which has a different saved comparison.
    mockComparisons = [
      makeSavedComparison({
        id: 'comp-b',
        name: 'Group B Pick',
        site_ids: ['site-2'],
        group_id: 'group-B',
      }),
    ];
    comparisonsService.list.mockResolvedValue(listResponse(mockComparisons));

    // Re-render with group B. The stale group-A selection must be dropped.
    rerender(
      (() => {
        const queryClient = new QueryClient({
          defaultOptions: { queries: { retry: false } },
        });
        const store = configureStore({
          reducer: {
            theme: themeReducer,
            ui: uiReducer,
            user: userReducer,
            insights: insightsReducer,
            cohorts: cohortReducer,
            mapSettings: mapSettingsReducer,
            selectedLocation: selectedLocationReducer,
            analytics: analyticsReducer,
          },
        });
        return (
          <Provider store={store}>
            <QueryClientProvider client={queryClient}>
              <ComparisonView groupId="group-B" />
            </QueryClientProvider>
          </Provider>
        );
      })()
    );

    // After the group switch, the group B comparison should auto-load.
    const siteTwoCheckbox = await screen.findByLabelText('Select item site-2');
    await waitFor(() => expect(siteTwoCheckbox).toBeChecked());

    // site-1 should NOT be checked (stale group-A selection was dropped).
    await waitFor(() =>
      expect(screen.getByLabelText('Select item site-1')).not.toBeChecked()
    );

    // The chip should show the group B comparison name.
    expect(await screen.findByText('Saved · Group B Pick')).toBeInTheDocument();
  });

  it('navigates to a sub-route on site click, writing the slug index', async () => {
    const user = userEvent.setup();
    mockReadings = [makeReading({ site_id: 'site-1' })];
    mockComparisons = [];
    comparisonsService.list.mockResolvedValue(listResponse([]));

    renderComparisonView();

    // Pick a location so the table renders.
    const checkbox = await screen.findByLabelText('Select item site-1');
    await user.click(checkbox);

    // Wait for the reading to show in the table.
    expect(await screen.findByText('72')).toBeInTheDocument();

    // Click the site name button.
    const siteButton = screen.getByRole('button', {
      name: /view details for kampala site/i,
    });
    await user.click(siteButton);

    // router.push was called with the expected sub-route.
    expect(mockPush).toHaveBeenCalledTimes(1);
    const pushUrl: string = mockPush.mock.calls[0][0];
    expect(pushUrl).toContain('/user/air-quality/analytics/sites/');
    expect(pushUrl).toContain('site_id=site-1');

    // rememberSiteSlug was called with the slug + metadata.
    expect(mockRememberSiteSlug).toHaveBeenCalledTimes(1);
    const [slug, entry] = mockRememberSiteSlug.mock.calls[0];
    expect(typeof slug).toBe('string');
    expect(slug.length).toBeGreaterThan(0);
    expect(entry).toEqual(
      expect.objectContaining({
        siteId: 'site-1',
        displayName: expect.any(String),
      })
    );
  });
});
