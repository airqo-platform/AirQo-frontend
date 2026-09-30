export {};

jest.mock('../apiClient', () => {
  const mockGet = jest.fn();
  const mockSetAuthToken = jest.fn();
  const mockRemoveAuthToken = jest.fn();
  return {
    createAuthenticatedClient: () => ({
      get: mockGet,
      setAuthToken: mockSetAuthToken,
      removeAuthToken: mockRemoveAuthToken,
    }),
    __mockGet: mockGet,
  };
});

jest.mock('../sessionAuthToken', () => ({
  syncClientSessionToken: jest.fn(),
}));

const { __mockGet: mockGet } = jest.requireMock('../apiClient') as {
  __mockGet: jest.Mock;
};

const { usageService } = jest.requireActual('../usageService') as {
  usageService: {
    getCalendar: (
      userId: string,
      params?: Record<string, unknown>,
      signal?: AbortSignal
    ) => Promise<unknown>;
    getSummary: (
      userId: string,
      params?: Record<string, unknown>,
      signal?: AbortSignal
    ) => Promise<unknown>;
    getBreakdown: (
      userId: string,
      params?: Record<string, unknown>,
      signal?: AbortSignal
    ) => Promise<unknown>;
    getTimeline: (
      userId: string,
      params: Record<string, unknown>,
      signal?: AbortSignal
    ) => Promise<unknown>;
    getRhythm: (
      userId: string,
      params?: Record<string, unknown>,
      signal?: AbortSignal
    ) => Promise<unknown>;
    getOverview: (
      params?: Record<string, unknown>,
      signal?: AbortSignal
    ) => Promise<unknown>;
    getPages: (
      params?: Record<string, unknown>,
      signal?: AbortSignal
    ) => Promise<unknown>;
    getUsers: (
      params?: Record<string, unknown>,
      signal?: AbortSignal
    ) => Promise<unknown>;
    getRetention: (
      params?: Record<string, unknown>,
      signal?: AbortSignal
    ) => Promise<unknown>;
    exportUsersCsv: (
      params?: Record<string, unknown>,
      signal?: AbortSignal
    ) => Promise<{
      blob: Blob;
      filename: string;
    }>;
  };
};

const envelope = (data: unknown) => ({
  success: true,
  message: 'ok',
  data,
});

describe('usageService — URLs and params', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockReset();
  });

  it('getCalendar builds the right URL, encodes userId, drops empties', async () => {
    mockGet.mockResolvedValueOnce({ data: envelope({ days: [] }) });

    await usageService.getCalendar('user 1@x', {
      year: 2025,
      metric: 'activity',
      tz: 'Africa/Kampala',
    });

    expect(mockGet).toHaveBeenCalledTimes(1);
    const [url] = mockGet.mock.calls[0];
    expect(url).toContain('/users/usage/users/user%201%40x/calendar');
    expect(url).toContain('year=2025');
    expect(url).toContain('metric=activity');
    expect(url).toContain('tz=Africa%2FKampala');
  });

  it('getSummary relative path under /api/v2 (baseURL) with no hard-coded version', async () => {
    mockGet.mockResolvedValueOnce({ data: envelope({ month: '2025-01' }) });

    await usageService.getSummary('u1', { month: '2025-01' });

    const [url] = mockGet.mock.calls[0];
    expect(url).toMatch(/^\/users\/usage\/users\/u1\/summary/);
    expect(url).not.toMatch(/\/api\/v2/);
    expect(url).toContain('month=2025-01');
  });

  it('getTimeline forwards the required date param', async () => {
    mockGet.mockResolvedValueOnce({ data: envelope({ hours: [] }) });

    await usageService.getTimeline('u1', { date: '2025-01-15' });

    const [url] = mockGet.mock.calls[0];
    expect(url).toContain('/users/usage/users/u1/timeline');
    expect(url).toContain('date=2025-01-15');
  });

  it('getOverview is relative and omits exclude_internal when falsy', async () => {
    mockGet.mockResolvedValueOnce({ data: envelope({ mau: 1 }) });

    await usageService.getOverview({ month: '2025-01' });

    const [url] = mockGet.mock.calls[0];
    expect(url).toContain('/users/usage/overview');
    expect(url).not.toContain('exclude_internal');
  });

  it('getPages only sends exclude_internal when true', async () => {
    mockGet.mockResolvedValueOnce({ data: envelope({ items: [] }) });

    await usageService.getPages({ kind: 'page', exclude_internal: true });

    const [url] = mockGet.mock.calls[0];
    expect(url).toContain('exclude_internal=true');
    expect(url).toContain('kind=page');
  });

  it('getUsers URL-encodes the search term', async () => {
    mockGet.mockResolvedValueOnce({ data: envelope({ users: [] }) });

    await usageService.getUsers({ search: 'john@doe.org' });

    const [url] = mockGet.mock.calls[0];
    expect(url).toContain('/users/usage/users');
    expect(url).toContain('search=john%40doe.org');
  });

  it('getRetention relative path', async () => {
    mockGet.mockResolvedValueOnce({ data: envelope({ cohorts: [] }) });

    await usageService.getRetention({ months: 6 });

    const [url] = mockGet.mock.calls[0];
    expect(url).toContain('/users/usage/retention');
    expect(url).toContain('months=6');
  });

  it('getRhythm forwards from/to/metric/tz', async () => {
    mockGet.mockResolvedValueOnce({ data: envelope({ matrix: [] }) });

    await usageService.getRhythm('u1', {
      from: '2025-01-01',
      to: '2025-01-31',
      metric: 'page_views',
    });

    const [url] = mockGet.mock.calls[0];
    expect(url).toContain('/users/usage/users/u1/rhythm');
    expect(url).toContain('from=2025-01-01');
    expect(url).toContain('to=2025-01-31');
    expect(url).toContain('metric=page_views');
  });
});

describe('usageService — envelope unwrap', () => {
  beforeEach(() => {
    mockGet.mockReset();
  });

  it('unwraps the inner data payload', async () => {
    mockGet.mockResolvedValueOnce({
      data: { success: true, message: 'ok', data: { mau: 42 } },
    });

    const result = await usageService.getOverview({});

    expect(result).toEqual({ mau: 42 });
  });

  it('returns the payload directly when no data envelope present', async () => {
    mockGet.mockResolvedValueOnce({
      data: { mau: 7 },
    });

    const result = await usageService.getOverview({});

    expect(result).toEqual({ mau: 7 });
  });

  it('throws the message when success is false', async () => {
    mockGet.mockResolvedValueOnce({
      data: { success: false, message: 'nope', data: null },
    });

    await expect(usageService.getOverview({})).rejects.toThrow('nope');
  });

  it('throws a default message when success is false without message', async () => {
    mockGet.mockResolvedValueOnce({
      data: { success: false, data: null },
    });

    await expect(usageService.getOverview({})).rejects.toThrow(
      'Usage request failed'
    );
  });
});

describe('usageService — signal forwarding', () => {
  beforeEach(() => {
    mockGet.mockReset();
  });

  it('forwards the AbortSignal to the underlying GET', async () => {
    mockGet.mockResolvedValueOnce({ data: envelope({ days: [] }) });
    const controller = new AbortController();

    await usageService.getCalendar('u1', {}, controller.signal);

    const config = mockGet.mock.calls[0][1];
    expect(config).toEqual({ signal: controller.signal });
  });

  it('propagates AbortError untouched', async () => {
    const abortError = new Error('canceled');
    abortError.name = 'AbortError';
    mockGet.mockRejectedValueOnce(abortError);

    await expect(usageService.getCalendar('u1', {})).rejects.toBe(abortError);
  });
});

describe('usageService — CSV export', () => {
  beforeEach(() => {
    mockGet.mockReset();
  });

  it('requests a blob and parses content-disposition filename', async () => {
    const blob = new Blob(['a,b']);
    mockGet.mockResolvedValueOnce({
      data: blob,
      headers: {
        'content-disposition': 'attachment; filename="nexus-usage-2025-01.csv"',
      },
    });

    const result = await usageService.exportUsersCsv({ month: '2025-01' });

    expect(result.blob).toBe(blob);
    expect(result.filename).toBe('nexus-usage-2025-01.csv');

    const [url, config] = mockGet.mock.calls[0];
    expect(url).toContain('/users/usage/users');
    expect(url).toContain('format=csv');
    expect(config).toMatchObject({ responseType: 'blob' });
  });

  it('falls back to a generated filename when content-disposition absent', async () => {
    const blob = new Blob(['a,b']);
    mockGet.mockResolvedValueOnce({ data: blob, headers: {} });

    const result = await usageService.exportUsersCsv({ month: '2025-03' });

    expect(result.filename).toBe('nexus-usage-2025-03.csv');
  });

  it('uses "current" when no month is given', async () => {
    const blob = new Blob(['a,b']);
    mockGet.mockResolvedValueOnce({ data: blob, headers: {} });

    const result = await usageService.exportUsersCsv({});

    expect(result.filename).toBe('nexus-usage-current.csv');
  });

  it('forwards the AbortSignal to the underlying GET', async () => {
    const blob = new Blob(['a,b']);
    mockGet.mockResolvedValueOnce({ data: blob, headers: {} });
    const controller = new AbortController();

    await usageService.exportUsersCsv({ month: '2025-01' }, controller.signal);

    const [, config] = mockGet.mock.calls[0];
    expect(config).toMatchObject({
      responseType: 'blob',
      signal: controller.signal,
    });
  });
});
