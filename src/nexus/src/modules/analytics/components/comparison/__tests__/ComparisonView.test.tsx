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
import type { RecentReading } from '@/shared/types/api';

const mockGetRecentReadings = jest.fn();
const mockGetUserPreferencesList = jest.fn();
const mockUpdateUserPreferences = jest.fn();

jest.mock('@/shared/services/analyticsService', () => ({
  analyticsService: {
    getChartData: jest.fn(),
    downloadData: jest.fn(),
    getRecentReadings: (...args: unknown[]) =>
      mockGetRecentReadings(...(args as [string[]])),
  },
}));

jest.mock('@/shared/services/preferencesService', () => ({
  preferencesService: {
    getUserPreferencesList: (...args: unknown[]) =>
      mockGetUserPreferencesList(...(args as [string, string])),
    updateUserPreferences: (...args: unknown[]) =>
      mockUpdateUserPreferences(...(args as [unknown])),
  },
}));

jest.mock('@/shared/hooks/useUser', () => ({
  useUser: () => ({
    user: { id: 'user-1' },
    activeGroup: { id: 'group-1' },
    isLoading: false,
  }),
}));

// flowbite-react ships ESM-only transitive deps (debounce) that jest's
// CJS transform cannot parse; the render tree only needs the component
// surface, never a real tooltip.
jest.mock('flowbite-react', () => ({
  Tooltip: () => null,
}));

// The shared Button reads the App Router context; jsdom has none.
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
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

const makePreference = (groupId: string, siteIds: string[]) => ({
  _id: `pref-${groupId}`,
  pollutant: 'pm2_5',
  frequency: 'hourly',
  startDate: '',
  endDate: '',
  chartType: 'line',
  chartTitle: '',
  chartSubTitle: '',
  airqloud_id: '',
  grid_id: '',
  network_id: '',
  group_id: groupId,
  site_ids: siteIds,
  device_ids: [],
  user_id: 'user-1',
  period: {},
  selected_sites: siteIds.map(siteId => ({
    _id: siteId,
    search_name: siteId === 'site-1' ? 'Kampala Site' : 'Jinja Site',
  })),
  createdAt: '2026-08-01T00:00:00Z',
  updatedAt: '2026-08-01T00:00:00Z',
  __v: 0,
  lastAccessed: '2026-08-22T00:00:00Z',
});

const renderComparisonView = (groupId = 'group-1') => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  // The shared UI primitives (Card, table) read Redux theme state — mirror
  // the production reducer set without the redux-persist wrappers.
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

describe('ComparisonView integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUserPreferencesList.mockImplementation(
      (_userId: string, groupId: string) =>
        Promise.resolve({
          success: true,
          message: 'ok',
          preferences:
            groupId === 'group-2'
              ? [makePreference('group-2', ['site-2'])]
              : [makePreference('group-1', ['site-1'])],
        })
    );
    mockGetRecentReadings.mockResolvedValue([
      makeReading({ site_id: 'site-1' }),
    ]);
    mockUpdateUserPreferences.mockResolvedValue({
      success: true,
      message: 'ok',
    });
  });

  it('pre-checks the persisted selection once the preference loads and shows its readings', async () => {
    renderComparisonView();

    // Saved site is checked...
    const savedCheckbox = await screen.findByLabelText('Select item site-1');
    await waitFor(() => expect(savedCheckbox).toBeChecked());

    // ...and the comparison table renders its reading plus an honest
    // no-data row for the unselected-but-listed case is NOT shown here
    // (only selected locations get rows).
    expect(await screen.findByText('72')).toBeInTheDocument();
    expect(screen.getByText('yellow')).toBeInTheDocument();
    expect(screen.getByText('2h ago')).toBeInTheDocument();
    expect(mockGetRecentReadings).toHaveBeenCalledWith(
      ['site-1'],
      expect.anything()
    );
  });

  it('builds Site objects from picker rows and persists them on Save, then shows Saved', async () => {
    const user = userEvent.setup();
    renderComparisonView();

    await screen.findByLabelText('Select item site-1');

    const secondCheckbox = screen.getByLabelText('Select item site-2');
    await user.click(secondCheckbox);

    const saveButton = screen.getByRole('button', { name: /save selection/i });
    expect(saveButton).not.toBeDisabled();

    await user.click(saveButton);

    await waitFor(() =>
      expect(mockUpdateUserPreferences).toHaveBeenCalledTimes(1)
    );
    expect(mockUpdateUserPreferences).toHaveBeenCalledWith({
      user_id: 'user-1',
      group_id: 'group-1',
      selected_sites: [
        expect.objectContaining({ _id: 'site-1', search_name: 'Kampala Site' }),
        expect.objectContaining({
          _id: 'site-2',
          search_name: 'Jinja Site',
          city: 'Jinja',
          country: 'Uganda',
        }),
      ],
    });

    expect(await screen.findByText('Saved')).toBeInTheDocument();
  });

  it('marks the view dirty after a local change and disables Save when clean', async () => {
    const user = userEvent.setup();
    renderComparisonView();

    const saveButton = await screen.findByRole('button', {
      name: /save selection/i,
    });
    await waitFor(() => expect(saveButton).toBeDisabled());

    await user.click(await screen.findByLabelText('Select item site-2'));
    await waitFor(() => expect(saveButton).not.toBeDisabled());
  });

  it('renders an honest No reading row for a selected site without measurements', async () => {
    const user = userEvent.setup();
    renderComparisonView();

    await screen.findByLabelText('Select item site-1');
    await user.click(screen.getByLabelText('Select item site-2'));

    // Live preview covers BOTH selected sites; only site-1 has a reading.
    await waitFor(() =>
      expect(mockGetRecentReadings).toHaveBeenCalledWith(
        ['site-1', 'site-2'],
        expect.anything()
      )
    );
    // The no-data row renders "No reading" twice: AQI badge pill + freshness.
    expect(await screen.findAllByText('No reading')).toHaveLength(2);
    // Jinja Site appears as a chip AND a table row.
    expect(screen.getAllByText('Jinja Site').length).toBeGreaterThan(0);
  });

  it('resets the picker to the new group’s persisted selection on group switch', async () => {
    const user = userEvent.setup();
    const first = renderComparisonView('group-1');

    const siteOneCheckbox = await screen.findByLabelText('Select item site-1');
    await waitFor(() => expect(siteOneCheckbox).toBeChecked());

    // User picks something extra before switching groups.
    await user.click(screen.getByLabelText('Select item site-2'));

    const secondStore = configureStore({
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
    first.unmount();
    render(
      <Provider store={secondStore}>
        <QueryClientProvider
          client={
            new QueryClient({
              defaultOptions: { queries: { retry: false } },
            })
          }
        >
          <ComparisonView groupId="group-2" />
        </QueryClientProvider>
      </Provider>
    );

    // Group-2's preference selects site-2 only — site-1 must NOT stay checked
    // (no cross-group bleed).
    const nextSiteTwo = await screen.findByLabelText('Select item site-2');
    await waitFor(() => expect(nextSiteTwo).toBeChecked());
    expect(screen.getByLabelText('Select item site-1')).not.toBeChecked();
  });

  it('shows the error state with retry when the readings request fails', async () => {
    mockGetRecentReadings.mockRejectedValue(new Error('Backend unreachable'));
    renderComparisonView();

    expect(
      await screen.findByText(/unable to load the latest readings/i)
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });
});
