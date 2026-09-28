export {};

jest.mock('../apiClient', () => {
  const mockGet = jest.fn();
  return {
    createAuthenticatedClient: () => ({ get: mockGet }),
    __mockGet: mockGet,
  };
});

jest.mock('../sessionAuthToken', () => ({
  syncClientSessionToken: jest.fn(),
}));

const { __mockGet: mockGet } = jest.requireMock('../apiClient') as {
  __mockGet: jest.Mock;
};

const { syncClientSessionToken } = jest.requireMock('../sessionAuthToken') as {
  syncClientSessionToken: jest.Mock;
};

const { apiKeyUsageService } = jest.requireActual('../apiKeyUsageService') as {
  apiKeyUsageService: {
    getLeaderboard: (
      params?: Record<string, unknown>,
      signal?: AbortSignal
    ) => Promise<unknown>;
    getTimeseries: (
      params?: Record<string, unknown>,
      signal?: AbortSignal
    ) => Promise<unknown>;
    getDetail: (
      clientId: string,
      params?: Record<string, unknown>,
      signal?: AbortSignal
    ) => Promise<unknown>;
    getLeaderboardCsv: (
      params?: Record<string, unknown>,
      signal?: AbortSignal
    ) => Promise<string>;
  };
};

type GetCall = [string, Record<string, unknown>];

const lastGetCall = (): GetCall =>
  mockGet.mock.calls[mockGet.mock.calls.length - 1] as GetCall;

const queryOf = (url: string): URLSearchParams => {
  const separatorIndex = url.indexOf('?');
  return new URLSearchParams(
    separatorIndex === -1 ? '' : url.slice(separatorIndex + 1)
  );
};

const okResponse = (data: unknown) => ({ data: { success: true, data } });

describe('ApiKeyUsageService.getLeaderboard', () => {
  beforeEach(() => jest.clearAllMocks());

  it('syncs the session token and forwards the abort signal', async () => {
    const controller = new AbortController();
    mockGet.mockResolvedValueOnce(okResponse({ keys: [], meta: {} }));

    await apiKeyUsageService.getLeaderboard({}, controller.signal);

    expect(syncClientSessionToken).toHaveBeenCalledTimes(1);
    expect(mockGet).toHaveBeenCalledWith('/users/usage/api-keys', {
      signal: controller.signal,
    });
  });

  it('builds the query from every documented param and never sends format', async () => {
    mockGet.mockResolvedValueOnce(okResponse({ keys: [], meta: {} }));

    await apiKeyUsageService.getLeaderboard({
      from: '2026-09-01',
      to: '2026-09-27',
      service: 'analytics',
      user_id: 'user-1',
      sort: 'active_days',
      order: 'asc',
      page: 3,
      limit: 50,
      format: 'json',
    });

    const [url] = lastGetCall();
    expect(url.startsWith('/users/usage/api-keys?')).toBe(true);

    const query = queryOf(url);
    expect(query.get('from')).toBe('2026-09-01');
    expect(query.get('to')).toBe('2026-09-27');
    expect(query.get('service')).toBe('analytics');
    expect(query.get('user_id')).toBe('user-1');
    expect(query.get('sort')).toBe('active_days');
    expect(query.get('order')).toBe('asc');
    expect(query.get('page')).toBe('3');
    expect(query.get('limit')).toBe('50');
    // JSON calls must never carry a format param.
    expect(query.get('format')).toBeNull();
    expect(url).not.toContain('format');
  });

  it('omits undefined, null and empty params and drops a falsy service', async () => {
    mockGet.mockResolvedValueOnce(okResponse({ keys: [], meta: {} }));

    await apiKeyUsageService.getLeaderboard({
      from: undefined,
      to: '2026-09-05',
      service: '',
      user_id: null,
      page: undefined,
      limit: undefined,
    });

    const [url] = lastGetCall();
    expect(url).toBe('/users/usage/api-keys?to=2026-09-05');
  });

  it('returns the unwrapped payload when success is true', async () => {
    const payload = {
      range: { from: '2026-09-01', to: '2026-09-27', days: 27 },
      service: null,
      totals: { keys: 0, calls: 0 },
      keys: [],
      meta: { page: 1, limit: 20, total: 0, pages: 0 },
    };
    mockGet.mockResolvedValueOnce(okResponse(payload));

    await expect(apiKeyUsageService.getLeaderboard()).resolves.toEqual(payload);
  });

  it('throws the server message when success is false', async () => {
    mockGet.mockResolvedValueOnce({
      data: { success: false, message: 'You do not have permission' },
    });

    await expect(apiKeyUsageService.getLeaderboard()).rejects.toThrow(
      'You do not have permission'
    );

    mockGet.mockResolvedValueOnce({ data: { success: false } });

    await expect(apiKeyUsageService.getLeaderboard()).rejects.toThrow(
      'Failed to get API key usage leaderboard'
    );
  });
});

describe('ApiKeyUsageService.getTimeseries', () => {
  beforeEach(() => jest.clearAllMocks());

  it('hits the timeseries path with the documented query and no format', async () => {
    mockGet.mockResolvedValueOnce(
      okResponse({ labels: [], series: [], other: [], total: [] })
    );

    await apiKeyUsageService.getTimeseries({
      from: '2026-09-21',
      to: '2026-09-27',
      interval: 'hour',
      top: 5,
      service: 'analytics',
      format: 'csv',
    });

    const [url, config] = lastGetCall();
    expect(url.startsWith('/users/usage/api-keys/timeseries?')).toBe(true);

    const query = queryOf(url);
    expect(query.get('from')).toBe('2026-09-21');
    expect(query.get('to')).toBe('2026-09-27');
    expect(query.get('interval')).toBe('hour');
    expect(query.get('top')).toBe('5');
    expect(query.get('service')).toBe('analytics');
    expect(query.get('format')).toBeNull();
    expect(url).not.toContain('format');
    expect(config).toEqual({ signal: undefined });
  });

  it('omits an empty service filter', async () => {
    mockGet.mockResolvedValueOnce(okResponse({ labels: [], series: [] }));

    await apiKeyUsageService.getTimeseries({ interval: 'day', service: '' });

    const [url] = lastGetCall();
    expect(url).toBe('/users/usage/api-keys/timeseries?interval=day');
  });
});

describe('ApiKeyUsageService.getDetail', () => {
  beforeEach(() => jest.clearAllMocks());

  it('URL-encodes the client id and passes from/to', async () => {
    mockGet.mockResolvedValueOnce(okResponse({ key: {}, totals: {} }));

    const clientId = 'abc 123/xyz';
    await apiKeyUsageService.getDetail(clientId, {
      from: '2026-09-21',
      to: '2026-09-27',
    });

    const [url] = lastGetCall();
    expect(url).toBe(
      `/users/usage/api-keys/${encodeURIComponent(clientId)}` +
        '?from=2026-09-21&to=2026-09-27'
    );
    expect(url).toContain('abc%20123%2Fxyz');
  });

  it('propagates a 404 rejection unchanged', async () => {
    const notFound = Object.assign(
      new Error('Request failed with status code 404'),
      { response: { status: 404 } }
    );
    mockGet.mockRejectedValueOnce(notFound);

    await expect(apiKeyUsageService.getDetail('missing-key')).rejects.toBe(
      notFound
    );
    expect(mockGet).toHaveBeenCalledTimes(1);
  });
});

describe('ApiKeyUsageService.getLeaderboardCsv', () => {
  beforeEach(() => jest.clearAllMocks());

  it('forces format=csv with a text response type and returns the CSV text', async () => {
    const csv = 'client_id,key_name,calls\r\nabc,heavy-pipeline,10\r\n';
    mockGet.mockResolvedValueOnce({ data: csv });
    const controller = new AbortController();

    await expect(
      apiKeyUsageService.getLeaderboardCsv(
        { from: '2026-09-01', service: 'analytics', limit: 100 },
        controller.signal
      )
    ).resolves.toBe(csv);

    const [url, config] = lastGetCall();
    const query = queryOf(url);
    expect(query.get('format')).toBe('csv');
    expect(query.get('from')).toBe('2026-09-01');
    expect(query.get('service')).toBe('analytics');
    expect(query.get('limit')).toBe('100');
    expect(config).toEqual({
      responseType: 'text',
      headers: { Accept: 'text/csv' },
      signal: controller.signal,
      timeout: 60000,
    });
  });

  it('sends format=csv even when no other params are set', async () => {
    mockGet.mockResolvedValueOnce({ data: 'client_id,calls\r\nabc,1\r\n' });

    await apiKeyUsageService.getLeaderboardCsv();

    const [url] = lastGetCall();
    expect(url).toBe('/users/usage/api-keys?format=csv');
  });

  it('throws the message from a JSON error envelope returned as text', async () => {
    mockGet.mockResolvedValueOnce({
      data: '{"success":false,"message":"Export limit exceeded"}',
    });

    await expect(apiKeyUsageService.getLeaderboardCsv()).rejects.toThrow(
      'Export limit exceeded'
    );
  });

  it('throws when the payload is not a string', async () => {
    mockGet.mockResolvedValueOnce({
      data: { success: false, message: 'Row limit reached' },
    });

    await expect(apiKeyUsageService.getLeaderboardCsv()).rejects.toThrow(
      'Row limit reached'
    );

    mockGet.mockResolvedValueOnce({ data: { unexpected: true } });

    await expect(apiKeyUsageService.getLeaderboardCsv()).rejects.toThrow(
      'Failed to export API key usage'
    );
  });
});
