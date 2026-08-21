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

const { analyticsService } = jest.requireActual('../analyticsService') as {
  analyticsService: {
    getChartData: (
      request: { startDateTime: string; endDateTime: string },
      signal?: AbortSignal
    ) => Promise<{
      status: string;
      data: unknown[];
    }>;
  };
};

describe('AnalyticsService.getChartData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
