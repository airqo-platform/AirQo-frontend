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

const { __mockGet: mockGet, __mockPost: mockPost } = jest.requireMock(
  '../apiClient'
) as {
  __mockGet: jest.Mock;
  __mockPost: jest.Mock;
};

const { analyticsService } = jest.requireActual('../analyticsService') as {
  analyticsService: {
    getRecentReadings: (
      request: { site_id: string },
      signal?: AbortSignal
    ) => Promise<{
      success: boolean;
      message: string;
      measurements: unknown[];
    }>;
  };
};

describe('AnalyticsService.getRecentReadings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const singleBatchPayload = {
    success: true,
    message: 'Recent readings fetched successfully',
    measurements: [
      { site_id: 'site-1', pm2_5_value: 10 },
    ],
  };

  it('uses GET for ≤10 site_ids (single request)', async () => {
    mockGet.mockResolvedValueOnce({ data: singleBatchPayload });

    const result = await analyticsService.getRecentReadings({
      site_id: 'a,b,c',
    });

    expect(mockGet).toHaveBeenCalledTimes(1);
    expect(mockGet).toHaveBeenCalledWith(
      '/devices/readings/recent',
      expect.objectContaining({
        params: { site_id: 'a,b,c' },
      })
    );
    expect(mockPost).not.toHaveBeenCalled();
    expect(result.measurements).toHaveLength(1);
    expect(result.success).toBe(true);
  });

  it('uses POST for >10 site_ids (single request with correct body)', async () => {
    const siteIds = Array.from({ length: 15 }, (_, i) => `site-${i + 1}`);
    const postIdPayload = {
      success: true,
      message: 'Recent readings fetched successfully',
      measurements: siteIds.map(id => ({ site_id: id, pm2_5_value: 5 })),
    };

    mockPost.mockResolvedValueOnce({ data: postIdPayload });

    const result = await analyticsService.getRecentReadings({
      site_id: siteIds.join(','),
    });

    expect(mockPost).toHaveBeenCalledTimes(1);
    expect(mockPost).toHaveBeenCalledWith(
      '/devices/readings/recent',
      { site_ids: siteIds },
      expect.objectContaining({})
    );
    expect(mockGet).not.toHaveBeenCalled();
    expect(result.measurements).toHaveLength(15);
    expect(result.success).toBe(true);
  });

  it('deduplicates site_ids before deciding GET vs POST', async () => {
    // 11 site IDs but two are duplicates — after dedup, 10 → GET
    const rawSiteIds = [
      'a',
      'b',
      'c',
      'd',
      'e',
      'f',
      'g',
      'h',
      'i',
      'j',
      'a',
    ];
    // After dedup: a,b,c,d,e,f,g,h,i,j → 10 → GET

    mockGet.mockResolvedValueOnce({ data: singleBatchPayload });

    await analyticsService.getRecentReadings({
      site_id: rawSiteIds.join(','),
    });

    expect(mockGet).toHaveBeenCalledTimes(1);
    expect(mockPost).not.toHaveBeenCalled();
    expect(mockGet).toHaveBeenCalledWith(
      '/devices/readings/recent',
      expect.objectContaining({
        params: { site_id: 'a,b,c,d,e,f,g,h,i,j' },
      })
    );
  });

  it('returns empty measurements without calling the API for empty site_ids', async () => {
    const result = await analyticsService.getRecentReadings({ site_id: '' });

    expect(result).toEqual({
      success: true,
      message: 'No site IDs provided',
      measurements: [],
    });
    expect(mockGet).not.toHaveBeenCalled();
    expect(mockPost).not.toHaveBeenCalled();
  });

  it('returns empty measurements for whitespace-only site_ids', async () => {
    const result = await analyticsService.getRecentReadings({
      site_id: ' , , ',
    });

    expect(result).toEqual({
      success: true,
      message: 'No site IDs provided',
      measurements: [],
    });
    expect(mockGet).not.toHaveBeenCalled();
    expect(mockPost).not.toHaveBeenCalled();
  });

  it('forwards abort signal on GET path', async () => {
    const controller = new AbortController();
    const abortError = new Error('The operation was aborted.');
    abortError.name = 'AbortError';
    mockGet.mockRejectedValueOnce(abortError);

    await expect(
      analyticsService.getRecentReadings(
        { site_id: 'a,b' },
        controller.signal
      )
    ).rejects.toThrow();

    expect(mockGet).toHaveBeenCalledWith(
      '/devices/readings/recent',
      expect.objectContaining({
        signal: controller.signal,
      })
    );
  });

  it('forwards abort signal on POST path', async () => {
    const controller = new AbortController();
    const siteIds = Array.from({ length: 12 }, (_, i) => `site-${i + 1}`);
    const abortError = new Error('The operation was aborted.');
    abortError.name = 'AbortError';
    mockPost.mockRejectedValueOnce(abortError);

    await expect(
      analyticsService.getRecentReadings(
        { site_id: siteIds.join(',') },
        controller.signal
      )
    ).rejects.toThrow();

    expect(mockPost).toHaveBeenCalledWith(
      '/devices/readings/recent',
      expect.anything(),
      expect.objectContaining({ signal: controller.signal })
    );
  });

  it('exactly 10 site_ids uses GET', async () => {
    const siteIds = Array.from({ length: 10 }, (_, i) => `site-${i + 1}`);
    mockGet.mockResolvedValueOnce({ data: singleBatchPayload });

    await analyticsService.getRecentReadings({
      site_id: siteIds.join(','),
    });

    expect(mockGet).toHaveBeenCalledTimes(1);
    expect(mockPost).not.toHaveBeenCalled();
  });

  it('11 site_ids uses POST', async () => {
    const siteIds = Array.from({ length: 11 }, (_, i) => `site-${i + 1}`);
    mockPost.mockResolvedValueOnce({
      data: {
        success: true,
        message: 'ok',
        measurements: [{ site_id: 'site-1', pm2_5_value: 1 }],
      },
    });

    await analyticsService.getRecentReadings({
      site_id: siteIds.join(','),
    });

    expect(mockPost).toHaveBeenCalledTimes(1);
    expect(mockGet).not.toHaveBeenCalled();
    expect(mockPost).toHaveBeenCalledWith(
      '/devices/readings/recent',
      { site_ids: siteIds },
      expect.anything()
    );
  });
});
