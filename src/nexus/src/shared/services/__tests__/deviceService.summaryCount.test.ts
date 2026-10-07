export {};

jest.mock('../apiClient', () => {
  const mockGet = jest.fn();
  return {
    createAuthenticatedClient: () => ({ get: mockGet }),
    createServerClient: () => ({ get: jest.fn() }),
    __mockGet: mockGet,
  };
});

jest.mock('../sessionAuthToken', () => ({
  syncClientSessionToken: jest.fn().mockResolvedValue(undefined),
}));

const { __mockGet: mockGet } = jest.requireMock('../apiClient') as {
  __mockGet: jest.Mock;
};

const { deviceService } = jest.requireActual('../deviceService') as {
  deviceService: {
    getDeviceSummaryCountAuthenticated: (
      params: {
        category: string;
        status?: string;
        network?: string;
        group_id?: string;
        cohort_id?: string;
      },
      signal?: AbortSignal
    ) => Promise<{
      total_monitors: number;
      operational: number;
      transmitting: number;
      not_transmitting: number;
      data_available: number;
    }>;
  };
};

const summaryPayload = (overrides = {}) => ({
  total_monitors: 120,
  operational: 98,
  transmitting: 80,
  not_transmitting: 20,
  data_available: 75,
  ...overrides,
});

describe('deviceService.getDeviceSummaryCountAuthenticated', () => {
  beforeEach(() => {
    mockGet.mockReset();
  });

  it('unwraps counts from the { success, message, data: {...} } envelope', async () => {
    mockGet.mockResolvedValueOnce({
      data: {
        success: true,
        message: 'ok',
        data: summaryPayload(),
      },
    });

    const result = await deviceService.getDeviceSummaryCountAuthenticated({
      category: 'lowcost',
      status: 'deployed',
    });

    expect(result).toEqual(summaryPayload());
  });

  it('unwraps counts from the { success, message, summary: {...} } envelope', async () => {
    mockGet.mockResolvedValueOnce({
      data: {
        success: true,
        message: 'ok',
        summary: summaryPayload({ total_monitors: 5 }),
      },
    });

    const result = await deviceService.getDeviceSummaryCountAuthenticated({
      category: 'bam',
    });

    expect(result.total_monitors).toBe(5);
    expect(result.operational).toBe(98);
  });

  it('reads counts at the top level of the response', async () => {
    mockGet.mockResolvedValueOnce({
      data: summaryPayload({ total_monitors: 7, operational: 3 }),
    });

    const result = await deviceService.getDeviceSummaryCountAuthenticated({
      category: 'gas',
    });

    expect(result.total_monitors).toBe(7);
    expect(result.operational).toBe(3);
  });

  it('prefers the `data` bucket over `summary` and top-level', async () => {
    mockGet.mockResolvedValueOnce({
      data: {
        data: summaryPayload({ total_monitors: 1 }),
        summary: summaryPayload({ total_monitors: 2 }),
        ...summaryPayload({ total_monitors: 3 }),
      },
    });

    const result = await deviceService.getDeviceSummaryCountAuthenticated({
      category: 'lowcost',
    });

    expect(result.total_monitors).toBe(1);
  });

  it('coerces non-finite / missing values to 0', async () => {
    mockGet.mockResolvedValueOnce({
      data: {
        data: {
          total_monitors: '99',
          operational: null,
          transmitting: NaN,
          not_transmitting: undefined,
        },
      },
    });

    const result = await deviceService.getDeviceSummaryCountAuthenticated({
      category: 'lowcost',
    });

    expect(result.total_monitors).toBe(0);
    expect(result.operational).toBe(0);
    expect(result.transmitting).toBe(0);
    expect(result.not_transmitting).toBe(0);
    expect(result.data_available).toBe(0);
  });

  it('passes params through and drops undefined / empty values', async () => {
    mockGet.mockResolvedValueOnce({
      data: { data: summaryPayload() },
    });

    await deviceService.getDeviceSummaryCountAuthenticated({
      category: 'lowcost',
      status: 'deployed',
      network: 'airqo',
      group_id: 'grp-1',
      cohort_id: 'c-1',
    });

    expect(mockGet).toHaveBeenCalledWith('/devices/summary/count', {
      params: {
        category: 'lowcost',
        status: 'deployed',
        network: 'airqo',
        group_id: 'grp-1',
        cohort_id: 'c-1',
      },
      signal: undefined,
      suppressErrorLogging: true,
    });

    // Now verify undefined/empty values are dropped.
    mockGet.mockResolvedValueOnce({
      data: { data: summaryPayload() },
    });
    await deviceService.getDeviceSummaryCountAuthenticated({
      category: 'bam',
      status: undefined,
      network: '',
    });

    expect(mockGet).toHaveBeenCalledWith('/devices/summary/count', {
      params: { category: 'bam' },
      signal: undefined,
      suppressErrorLogging: true,
    });
  });

  it('throws the backend message when success is false', async () => {
    mockGet.mockResolvedValueOnce({
      data: { success: false, message: 'summary count exploded' },
    });

    await expect(
      deviceService.getDeviceSummaryCountAuthenticated({ category: 'gas' })
    ).rejects.toThrow('summary count exploded');
  });

  it('forwards the AbortSignal and never retries at this layer', async () => {
    const controller = new AbortController();
    mockGet.mockResolvedValueOnce({
      data: { data: summaryPayload() },
    });

    await deviceService.getDeviceSummaryCountAuthenticated(
      { category: 'lowcost', status: 'deployed' },
      controller.signal
    );

    expect(mockGet).toHaveBeenCalledWith(
      '/devices/summary/count',
      expect.objectContaining({ signal: controller.signal })
    );
    expect(mockGet).toHaveBeenCalledTimes(1);
  });
});
