export {};

jest.mock('../apiClient', () => {
  const mockGet = jest.fn();
  const mockPost = jest.fn();
  const mockSetAuthToken = jest.fn();
  const mockRemoveAuthToken = jest.fn();
  return {
    createAuthenticatedClient: () => ({
      get: mockGet,
      post: mockPost,
      setAuthToken: mockSetAuthToken,
      removeAuthToken: mockRemoveAuthToken,
    }),
    createServerClient: () => ({
      get: mockGet,
      post: mockPost,
      setAuthToken: mockSetAuthToken,
      removeAuthToken: mockRemoveAuthToken,
    }),
    __mockGet: mockGet,
    __mockPost: mockPost,
  };
});

jest.mock('../sessionAuthToken', () => ({
  syncClientSessionToken: jest.fn(),
}));

const { __mockPost: mockPost } = jest.requireMock('../apiClient') as {
  __mockGet: jest.Mock;
  __mockPost: jest.Mock;
};

const {
  analyticsService,
  chartContractToRetryForErrorBody,
  resetChartDateContract,
} = jest.requireActual('../analyticsService') as {
  analyticsService: {
    getChartData: (
      request: {
        sites?: string[];
        startDateTime: string;
        endDateTime: string;
        frequency?: string;
        pollutant?: string;
        chartType?: string;
        organisation_name?: string;
      },
      signal?: AbortSignal
    ) => Promise<{
      status: string;
      data: unknown[];
    }>;
    getRecentReadings: (
      siteIds: string[],
      signal?: AbortSignal
    ) => Promise<unknown[]>;
  };
  chartContractToRetryForErrorBody: (body: unknown) => string | null;
  resetChartDateContract: () => void;
};

const LEGACY_REJECTION_BODY = {
  errors: {
    startDate: ['Missing data for required field.'],
    endDate: ['Missing data for required field.'],
    endDateTime: ['Unknown field.'],
    startDateTime: ['Unknown field.'],
  },
};

describe('AnalyticsService.getChartData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetChartDateContract();
  });

  const chartPayload = {
    status: 'success',
    data: [{ date: '2025-01-01', pm2_5: 10 }],
  };

  it('normalizes ISO datetime to YYYY-MM-DD in the request body', async () => {
    mockPost.mockResolvedValueOnce({ data: chartPayload });

    await analyticsService.getChartData({
      startDateTime: '2025-08-21T00:00:00.000Z',
      endDateTime: '2025-08-21T23:59:59.000Z',
    });

    expect(mockPost).toHaveBeenCalledTimes(1);
    expect(mockPost).toHaveBeenCalledWith(
      '/analytics/dashboard/chart/d3/data',
      expect.objectContaining({
        startDateTime: '2025-08-21',
        endDateTime: '2025-08-21',
      }),
      expect.anything()
    );
  });

  it('passes through YYYY-MM-DD dates unchanged', async () => {
    mockPost.mockResolvedValueOnce({ data: chartPayload });

    await analyticsService.getChartData({
      startDateTime: '2025-08-21',
      endDateTime: '2025-08-21',
    });

    expect(mockPost).toHaveBeenCalledWith(
      '/analytics/dashboard/chart/d3/data',
      expect.objectContaining({
        startDateTime: '2025-08-21',
        endDateTime: '2025-08-21',
      }),
      expect.anything()
    );
  });

  it('maps the rejected raw frequency to daily (live backend 400s on raw)', async () => {
    mockPost.mockResolvedValueOnce({ data: chartPayload });

    await analyticsService.getChartData({
      startDateTime: '2025-08-21',
      endDateTime: '2025-08-21',
      frequency: 'raw',
    });

    expect(mockPost).toHaveBeenCalledWith(
      '/analytics/dashboard/chart/d3/data',
      expect.objectContaining({ frequency: 'daily' }),
      expect.anything()
    );
  });

  it('passes accepted frequencies through unchanged', async () => {
    mockPost.mockResolvedValue({ data: chartPayload });

    for (const frequency of ['hourly', 'daily', 'weekly', 'monthly']) {
      await analyticsService.getChartData({
        startDateTime: '2025-08-21',
        endDateTime: '2025-08-21',
        frequency,
      });
    }

    const bodies = mockPost.mock.calls.map(call => call[1]);
    expect(bodies.map(body => body.frequency)).toEqual([
      'hourly',
      'daily',
      'weekly',
      'monthly',
    ]);
  });

  it('forwards abort signal', async () => {
    const controller = new AbortController();
    const abortError = new Error('The operation was aborted.');
    abortError.name = 'AbortError';
    mockPost.mockRejectedValueOnce(abortError);

    await expect(
      analyticsService.getChartData(
        { startDateTime: '2025-08-21', endDateTime: '2025-08-21' },
        controller.signal
      )
    ).rejects.toThrow();

    expect(mockPost).toHaveBeenCalledWith(
      '/analytics/dashboard/chart/d3/data',
      expect.anything(),
      expect.objectContaining({ signal: controller.signal })
    );
  });
});

describe('chartContractToRetryForErrorBody', () => {
  it('detects the legacy schema rejection and returns the alternate contract', () => {
    expect(chartContractToRetryForErrorBody(LEGACY_REJECTION_BODY)).toBe(
      'startDate'
    );
  });

  it('returns null for the current (pydantic) schema validation body', () => {
    const pydanticBody = {
      message: 'Validation error',
      status: 'error',
      errors: [
        {
          type: 'missing',
          loc: ['body', 'startDateTime'],
          msg: 'Field required',
        },
      ],
    };
    expect(chartContractToRetryForErrorBody(pydanticBody)).toBeNull();
  });

  it('returns null for unrelated 400 bodies (no retry)', () => {
    expect(
      chartContractToRetryForErrorBody({
        message:
          'No data source configured for datatype=calibrated, device_category=lowcost, frequency=raw',
      })
    ).toBeNull();
    expect(chartContractToRetryForErrorBody(null)).toBeNull();
    expect(chartContractToRetryForErrorBody(undefined)).toBeNull();
    expect(chartContractToRetryForErrorBody({})).toBeNull();
  });
});

describe('AnalyticsService.getChartData contract negotiation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetChartDateContract();
  });

  const chartPayload = { status: 'success', data: [] };

  const axiosLikeError = (status: number, data: unknown) => {
    const error = new Error(`Request failed with status code ${status}`);
    (error as { response?: unknown }).response = { status, data };
    return error;
  };

  it('retries ONCE with startDate/endDate on the legacy rejection, then caches the winning contract', async () => {
    mockPost
      .mockRejectedValueOnce(axiosLikeError(400, LEGACY_REJECTION_BODY))
      .mockResolvedValueOnce({ data: chartPayload });

    const request = {
      sites: ['site-1'],
      startDateTime: '2025-08-15T00:00:00.000Z',
      endDateTime: '2025-08-21T00:00:00.000Z',
      frequency: 'daily',
    };

    await expect(analyticsService.getChartData(request)).resolves.toEqual(
      chartPayload
    );

    // First attempt: primary keys; second attempt: legacy keys.
    expect(mockPost).toHaveBeenCalledTimes(2);
    expect(mockPost.mock.calls[0][1]).toEqual(
      expect.objectContaining({
        startDateTime: '2025-08-15',
        endDateTime: '2025-08-21',
      })
    );
    expect(mockPost.mock.calls[1][1]).toEqual(
      expect.objectContaining({
        startDate: '2025-08-15',
        endDate: '2025-08-21',
      })
    );
    // The legacy body must never leak into the retry payload.
    expect(mockPost.mock.calls[1][1]).not.toHaveProperty('startDateTime');
    expect(mockPost.mock.calls[1][1]).not.toHaveProperty('endDateTime');

    // Cached: the NEXT request goes straight to the legacy key set.
    mockPost.mockResolvedValueOnce({ data: chartPayload });
    await analyticsService.getChartData(request);
    expect(mockPost).toHaveBeenCalledTimes(3);
    expect(mockPost.mock.calls[2][1]).toEqual(
      expect.objectContaining({ startDate: '2025-08-15' })
    );
    expect(mockPost).toHaveBeenCalledTimes(3); // no extra probe call
  });

  it('does not retry on unrelated 400 bodies', async () => {
    mockPost.mockRejectedValueOnce(
      axiosLikeError(400, {
        message: 'No data source configured for datatype=calibrated',
      })
    );

    await expect(
      analyticsService.getChartData({
        startDateTime: '2025-08-21',
        endDateTime: '2025-08-21',
      })
    ).rejects.toThrow();

    expect(mockPost).toHaveBeenCalledTimes(1);
  });

  it('never retries an aborted first attempt', async () => {
    const abortError = new Error('canceled');
    abortError.name = 'AbortError';
    mockPost.mockRejectedValueOnce(abortError);

    await expect(
      analyticsService.getChartData({
        startDateTime: '2025-08-21',
        endDateTime: '2025-08-21',
      })
    ).rejects.toThrow();

    expect(mockPost).toHaveBeenCalledTimes(1);
  });

  it('surfaces the ORIGINAL error when the alternate contract also fails', async () => {
    const originalError = axiosLikeError(400, LEGACY_REJECTION_BODY);
    mockPost
      .mockRejectedValueOnce(originalError)
      .mockRejectedValueOnce(axiosLikeError(422, { message: 'bad values' }));

    await expect(
      analyticsService.getChartData({
        startDateTime: '2025-08-21',
        endDateTime: '2025-08-21',
      })
    ).rejects.toBe(originalError);

    expect(mockPost).toHaveBeenCalledTimes(2);
  });

  it('passes the abort signal through to both attempts', async () => {
    const controller = new AbortController();
    mockPost
      .mockRejectedValueOnce(axiosLikeError(400, LEGACY_REJECTION_BODY))
      .mockResolvedValueOnce({ data: chartPayload });

    await analyticsService.getChartData(
      { startDateTime: '2025-08-21', endDateTime: '2025-08-21' },
      controller.signal
    );

    expect(mockPost.mock.calls[0][2]).toEqual(
      expect.objectContaining({ signal: controller.signal })
    );
    expect(mockPost.mock.calls[1][2]).toEqual(
      expect.objectContaining({ signal: controller.signal })
    );
  });
});

describe('AnalyticsService.getRecentReadings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('POSTs the trimmed site_ids to /devices/readings/recent and returns measurements', async () => {
    const measurements = [{ site_id: 'site-1', aqi_index: 72 }];
    mockPost.mockResolvedValueOnce({
      data: { success: true, message: 'ok', measurements },
    });

    await expect(
      analyticsService.getRecentReadings([' site-1 ', '', 'site-2'])
    ).resolves.toEqual(measurements);

    expect(mockPost).toHaveBeenCalledTimes(1);
    expect(mockPost).toHaveBeenCalledWith(
      '/devices/readings/recent',
      { site_ids: ['site-1', 'site-2'] },
      expect.anything()
    );
  });

  it('short-circuits to [] without a network call when no valid ids remain', async () => {
    await expect(
      analyticsService.getRecentReadings(['', '   '])
    ).resolves.toEqual([]);
    expect(mockPost).not.toHaveBeenCalled();
  });

  it('throws a fixed safe message on success:false (does not leak backend wording)', async () => {
    mockPost.mockResolvedValueOnce({
      data: {
        success: false,
        message: 'site_ids must be valid',
        measurements: [],
      },
    });

    await expect(
      analyticsService.getRecentReadings(['bad-id'])
    ).rejects.toThrow('Failed to fetch the latest readings.');
  });

  it('returns [] for a successful empty payload', async () => {
    mockPost.mockResolvedValueOnce({
      data: { success: true, message: 'ok', measurements: [] },
    });

    await expect(
      analyticsService.getRecentReadings(['site-x'])
    ).resolves.toEqual([]);
  });

  it('forwards the abort signal', async () => {
    const controller = new AbortController();
    mockPost.mockResolvedValueOnce({
      data: { success: true, message: 'ok', measurements: [] },
    });

    await analyticsService.getRecentReadings(['site-1'], controller.signal);

    expect(mockPost).toHaveBeenCalledWith(
      '/devices/readings/recent',
      expect.anything(),
      expect.objectContaining({ signal: controller.signal })
    );
  });
});
