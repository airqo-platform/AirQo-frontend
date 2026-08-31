import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const mockGetComparisonReadings = jest.fn();
const mockGetRecentReadings = jest.fn();

jest.mock('@/shared/services/analyticsService', () => ({
  analyticsService: {
    getChartData: jest.fn(),
    downloadData: jest.fn(),
    getComparisonReadings: (...args: unknown[]) =>
      mockGetComparisonReadings(...(args as [string[], AbortSignal?])),
    getRecentReadings: (...args: unknown[]) =>
      mockGetRecentReadings(...(args as [string[], AbortSignal?])),
  },
}));

jest.mock('@/shared/hooks/useUser', () => ({
  useUser: () => ({
    user: { id: 'user-1' },
    activeGroup: { id: 'group-1' },
    isLoading: false,
  }),
}));

// eslint-disable-next-line import/first
import {
  isComparisonReadingsUnavailable,
  useRecentReadings,
} from '../useRecentReadings';

const makeQueryClient = () =>
  new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={makeQueryClient()}>
    {children}
  </QueryClientProvider>
);

const makeComparisonReading = (overrides: Record<string, unknown> = {}) => ({
  site_id: 'site-1',
  site: {
    name: '3rd Street, Ibex Hill',
    location_name: 'Lusaka Central, Zambia',
    city: 'Lusaka',
    country: 'Zambia',
    latitude: -15.4,
    longitude: 28.3,
  },
  has_reading: true,
  time: null,
  time_difference_hours: null,
  aqi: null,
  pollutants: null,
  ...overrides,
});

const makeRecentReading = (overrides: Record<string, unknown> = {}) => ({
  _id: 'site-1',
  site_id: 'site-1',
  time: '2026-08-22T09:05:00Z',
  __v: 0,
  aqi_category: 'Moderate',
  aqi_color: 'ECAA06',
  aqi_color_name: 'yellow',
  aqi_index: 72,
  aqi_ranges: {},
  averages: {},
  createdAt: '',
  device: '',
  device_id: '',
  frequency: '',
  health_tips: [],
  is_reading_primary: true,
  no2: { value: 3.45 },
  pm10: { value: 15 },
  pm2_5: { value: 12.34 },
  timeDifferenceHours: 2,
  updatedAt: '',
  siteDetails: {
    _id: 'site-1',
    formatted_name: '',
    street: '',
    parish: '',
    village: '',
    sub_county: '',
    town: '',
    city: 'Lusaka',
    district: '',
    county: '',
    region: '',
    country: 'Zambia',
    name: '3rd Street, Ibex Hill',
    description: '',
    location_name: 'Lusaka Central, Zambia',
    search_name: '3rd Street, Ibex Hill',
    approximate_latitude: -15.4,
    approximate_longitude: 28.3,
    data_provider: '',
    site_category: { tags: [], category: '' },
  },
  ...overrides,
});

describe('isComparisonReadingsUnavailable', () => {
  it('is true for 404, 405, 501', () => {
    expect(isComparisonReadingsUnavailable({ response: { status: 404 } })).toBe(
      true
    );
    expect(isComparisonReadingsUnavailable({ response: { status: 405 } })).toBe(
      true
    );
    expect(isComparisonReadingsUnavailable({ response: { status: 501 } })).toBe(
      true
    );
  });

  it('is false for 5xx / network (never treat those as unavailable)', () => {
    expect(isComparisonReadingsUnavailable({ response: { status: 500 } })).toBe(
      false
    );
    expect(isComparisonReadingsUnavailable({ response: { status: 502 } })).toBe(
      false
    );
    expect(isComparisonReadingsUnavailable(new Error('network'))).toBe(false);
  });
});

describe('useRecentReadings two-call merge flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls both endpoints in parallel and returns merged rows', async () => {
    mockGetComparisonReadings.mockResolvedValueOnce([makeComparisonReading()]);
    mockGetRecentReadings.mockResolvedValueOnce([makeRecentReading()]);

    const { result } = renderHook(
      () =>
        useRecentReadings({
          userId: 'user-1',
          groupId: 'group-1',
          siteIds: ['site-1'],
        }),
      { wrapper }
    );

    await waitFor(() =>
      expect(result.current.readings.length).toBeGreaterThan(0)
    );

    expect(mockGetComparisonReadings).toHaveBeenCalledWith(
      ['site-1'],
      expect.anything()
    );
    expect(mockGetRecentReadings).toHaveBeenCalledWith(
      ['site-1'],
      expect.anything()
    );
    expect(result.current.error).toBeNull();

    // Merged row has siteDetails from the comparison payload (location_name)
    // and measurements from the recent reading.
    const merged = result.current.readings[0];
    expect(merged.siteDetails.location_name).toBe('Lusaka Central, Zambia');
    expect(merged.pm2_5).toEqual({ value: 12.34 });
    expect(merged.pm10).toEqual({ value: 15 });
    expect(merged.no2).toEqual({ value: 3.45 });
    expect(merged.aqi_index).toBe(72);
  });

  it('falls back to recent-only when comparisons returns 404', async () => {
    const notFound = new Error('Not Found');
    (notFound as unknown as { response: { status: number } }).response = {
      status: 404,
    };
    mockGetComparisonReadings.mockRejectedValueOnce(notFound);
    mockGetRecentReadings.mockResolvedValueOnce([makeRecentReading()]);

    const { result } = renderHook(
      () =>
        useRecentReadings({
          userId: 'user-1',
          groupId: 'group-1',
          siteIds: ['site-1'],
        }),
      { wrapper }
    );

    await waitFor(() =>
      expect(result.current.readings.length).toBeGreaterThan(0)
    );

    expect(mockGetComparisonReadings).toHaveBeenCalledWith(
      ['site-1'],
      expect.anything()
    );
    expect(mockGetRecentReadings).toHaveBeenCalledWith(
      ['site-1'],
      expect.anything()
    );
    expect(result.current.error).toBeNull();
    // Returned readings are the raw recent readings (not merged).
    expect(result.current.readings[0].aqi_index).toBe(72);
  });

  it('surfaces comparison 500 error (not treated as unavailable)', async () => {
    const serverError = new Error('Internal Server Error');
    (serverError as unknown as { response: { status: number } }).response = {
      status: 500,
    };
    mockGetComparisonReadings.mockRejectedValueOnce(serverError);
    mockGetRecentReadings.mockResolvedValueOnce([makeRecentReading()]);

    const { result } = renderHook(
      () =>
        useRecentReadings({
          userId: 'user-1',
          groupId: 'group-1',
          siteIds: ['site-1'],
        }),
      { wrapper }
    );

    await waitFor(() => expect(result.current.error).not.toBeNull());

    expect(mockGetComparisonReadings).toHaveBeenCalledTimes(1);
    expect(mockGetRecentReadings).toHaveBeenCalledTimes(1);
    expect(result.current.error?.message).toBe('Internal Server Error');
  });

  it('surfaces recent 500 error (measurements are essential)', async () => {
    const serverError = new Error('Internal Server Error');
    (serverError as unknown as { response: { status: number } }).response = {
      status: 500,
    };
    mockGetComparisonReadings.mockResolvedValueOnce([makeComparisonReading()]);
    mockGetRecentReadings.mockRejectedValueOnce(serverError);

    const { result } = renderHook(
      () =>
        useRecentReadings({
          userId: 'user-1',
          groupId: 'group-1',
          siteIds: ['site-1'],
        }),
      { wrapper }
    );

    await waitFor(() => expect(result.current.error).not.toBeNull());

    expect(mockGetComparisonReadings).toHaveBeenCalledTimes(1);
    expect(mockGetRecentReadings).toHaveBeenCalledTimes(1);
    expect(result.current.error?.message).toBe('Internal Server Error');
  });
});
