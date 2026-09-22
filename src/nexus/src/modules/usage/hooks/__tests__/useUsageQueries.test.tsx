import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const mockGetCalendar = jest.fn();
const mockGetUsers = jest.fn();
const mockExportUsersCsv = jest.fn();

jest.mock('@/shared/services', () => ({
  usageService: {
    getCalendar: (...args: unknown[]) =>
      mockGetCalendar(
        ...(args as [string, Record<string, unknown>?, AbortSignal?])
      ),
    getUsers: (...args: unknown[]) =>
      mockGetUsers(...(args as [Record<string, unknown>?, AbortSignal?])),
    exportUsersCsv: (...args: unknown[]) =>
      mockExportUsersCsv(...(args as [Record<string, unknown>?, AbortSignal?])),
  },
}));

// eslint-disable-next-line import/first
import {
  useUsageCalendar,
  useUsageUsers,
  useUsageExportUsersCsv,
} from '../useUsageQueries';

const makeQueryClient = () =>
  new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

const makeWrapper = () => {
  const queryClient = makeQueryClient();
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { queryClient, Wrapper };
};

const emptyCalendarResponse = {
  tz: 'UTC',
  metric: 'activity' as const,
  from: '2025-01-01',
  to: '2025-12-31',
  total: 0,
  active_days: 0,
  max_count: 0,
  current_streak: 0,
  longest_streak: 0,
  thresholds: [] as number[],
  days: [] as { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 }[],
};

describe('useUsageCalendar', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('is disabled (does not call the service) when userId is undefined', () => {
    mockGetCalendar.mockResolvedValueOnce(emptyCalendarResponse);
    const { Wrapper } = makeWrapper();

    const { result } = renderHook(() => useUsageCalendar(undefined), {
      wrapper: Wrapper,
    });

    expect(mockGetCalendar).not.toHaveBeenCalled();
    expect(result.current.data).toBeNull();
  });

  it('calls getCalendar with userId and forwards the signal', async () => {
    const calendarResponse = {
      ...emptyCalendarResponse,
      total: 42,
      active_days: 10,
      max_count: 5,
      current_streak: 3,
      longest_streak: 7,
      thresholds: [1, 3, 5, 10],
      days: [{ date: '2025-01-01', count: 2, level: 1 as const }],
    };
    mockGetCalendar.mockResolvedValueOnce(calendarResponse);
    const { Wrapper } = makeWrapper();

    const { result } = renderHook(
      () => useUsageCalendar('user-1', { year: 2025 }),
      { wrapper: Wrapper }
    );

    await waitFor(() => expect(result.current.data).not.toBeNull());

    expect(mockGetCalendar).toHaveBeenCalledTimes(1);
    const [userId, params, signal] = mockGetCalendar.mock.calls[0];
    expect(userId).toBe('user-1');
    expect(params).toEqual({ year: 2025 });
    // Signal is forwarded from React Query's internal AbortController.
    expect(signal).toBeInstanceOf(AbortSignal);
    expect(result.current.data).toEqual(calendarResponse);
  });

  it('builds a scope-aware query key with usage/calendar scope', async () => {
    mockGetCalendar.mockResolvedValueOnce(emptyCalendarResponse);
    const { queryClient, Wrapper } = makeWrapper();

    renderHook(() => useUsageCalendar('user-abc', { year: 2024 }), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(mockGetCalendar).toHaveBeenCalled());

    // Verify the key contains 'usage', 'calendar', and the userId.
    const queries = queryClient.getQueryCache().getAll();
    expect(queries.length).toBeGreaterThan(0);
    const key = queries[0].queryKey;
    expect(key[0]).toBe('usage');
    expect(key[1]).toBe('calendar');
    expect(key[2]).toBe('user-abc');
  });
});

describe('useUsageUsers', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('is always enabled (no userId guard) and calls getUsers', async () => {
    const usersResponse = {
      month: '2025-01',
      scope: 'all',
      basis: 'page_views',
      page: 1,
      limit: 20,
      total: 1,
      pages: 1,
      sort: 'total_actions',
      order: 'desc' as const,
      users: [],
    };
    mockGetUsers.mockResolvedValueOnce(usersResponse);
    const { Wrapper } = makeWrapper();

    const { result } = renderHook(() => useUsageUsers({ month: '2025-01' }), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.data).not.toBeNull());

    expect(mockGetUsers).toHaveBeenCalledTimes(1);
    const [params, signal] = mockGetUsers.mock.calls[0];
    expect(params).toEqual({ month: '2025-01' });
    expect(signal).toBeInstanceOf(AbortSignal);
    expect(result.current.data).toEqual(usersResponse);
  });

  it('builds the correct query key for the users endpoint', async () => {
    mockGetUsers.mockResolvedValueOnce({
      month: '2025-03',
      scope: 'all',
      basis: 'page_views',
      page: 1,
      limit: 20,
      total: 0,
      pages: 0,
      sort: 'total_actions',
      order: 'desc',
      users: [],
    });
    const { queryClient, Wrapper } = makeWrapper();

    renderHook(() => useUsageUsers({ month: '2025-03', sort: 'active_days' }), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(mockGetUsers).toHaveBeenCalled());

    const queries = queryClient.getQueryCache().getAll();
    expect(queries.length).toBeGreaterThan(0);
    const key = queries[0].queryKey;
    expect(key[0]).toBe('usage');
    expect(key[1]).toBe('users');
    expect(key[2]).toEqual({ month: '2025-03', sort: 'active_days' });
  });

  it('forwards errors from the service', async () => {
    mockGetUsers.mockRejectedValueOnce(new Error('server down'));
    const { Wrapper } = makeWrapper();

    const { result } = renderHook(() => useUsageUsers({}), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.error).not.toBeNull());
    expect(result.current.error?.message).toBe('server down');
  });
});

describe('useUsageExportUsersCsv — signal forwarding', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('forwards an AbortSignal to the service layer', async () => {
    const blob = new Blob(['a,b'], { type: 'text/csv' });
    mockExportUsersCsv.mockResolvedValueOnce({
      blob,
      filename: 'test.csv',
    });

    // Stub URL methods that may not exist in jsdom. The fake object URL is a
    // same-document fragment on purpose: jsdom's anchor-click navigation only
    // implements fragment changes and otherwise logs "Not implemented:
    // navigation" — which surfaces once act() yields to the timer queue.
    if (!URL.createObjectURL) {
      URL.createObjectURL = jest.fn(() => '#usage-csv-download');
    }
    if (!URL.revokeObjectURL) {
      URL.revokeObjectURL = jest.fn();
    }

    const { Wrapper } = makeWrapper();
    const { result } = renderHook(() => useUsageExportUsersCsv(), {
      wrapper: Wrapper,
    });

    const controller = new AbortController();
    // exportUsers flips hook state (isExporting/error) around the awaited
    // service call — run it inside async act() so those updates are wrapped.
    await act(async () => {
      await result.current.exportUsers({ month: '2025-01' }, controller.signal);
    });

    expect(mockExportUsersCsv).toHaveBeenCalledTimes(1);
    const [params, signal] = mockExportUsersCsv.mock.calls[0];
    expect(params).toEqual({ month: '2025-01' });
    expect(signal).toBe(controller.signal);
  });

  it('propagates AbortError without masking it', async () => {
    const abortError = new DOMException(
      'The operation was aborted.',
      'AbortError'
    );
    mockExportUsersCsv.mockRejectedValueOnce(abortError);
    const { Wrapper } = makeWrapper();

    const { result } = renderHook(() => useUsageExportUsersCsv(), {
      wrapper: Wrapper,
    });

    const controller = new AbortController();
    controller.abort();

    // The rejection path also setState's (isExporting/error) before rethrowing,
    // so the whole promise must settle inside async act().
    await act(async () => {
      await expect(
        result.current.exportUsers({}, controller.signal)
      ).rejects.toThrow();
    });
  });
});
