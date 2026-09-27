export {};

jest.mock('../apiClient', () => {
  const mockPost = jest.fn();
  return {
    createServerClient: () => ({ post: mockPost }),
    __mockPost: mockPost,
  };
});

const { __mockPost: mockPost } = jest.requireMock('../apiClient') as {
  __mockPost: jest.Mock;
};

  const { analyticsService, buildChartPayload, normalizeChartApiFrequency } = jest.requireActual(
  '../analyticsService'
) as {
  analyticsService: {
    getChartData: (
      request: Record<string, unknown>,
      signal?: AbortSignal
    ) => Promise<Record<string, unknown>>;
    downloadData: (
      request: Record<string, unknown>,
      signal?: AbortSignal
    ) => Promise<unknown>;
    getRecentReadings: (
      siteIds: string[],
      signal?: AbortSignal
    ) => Promise<unknown[]>;
    getComparisonReadings: (
      siteIds: string[],
      signal?: AbortSignal
    ) => Promise<unknown[]>;
  };
  buildChartPayload: (
    request: Record<string, unknown>
  ) => Record<string, unknown>;
  normalizeChartApiFrequency: (value: string) => string;
};

const chartRequest = {
  sites: ['site-1'],
  startDateTime: '2026-08-01T00:00:00.000Z',
  endDateTime: '2026-08-08T23:59:59.999Z',
  chartType: 'line',
  frequency: 'daily',
  pollutants: ['pm2_5'],
  organisationName: 'AirQo',
};

const downloadRequest = {
  datatype: 'calibrated',
  downloadType: 'csv',
  endDateTime: '2026-08-08T23:59:59.999Z',
  frequency: 'daily',
  minimum: false,
  outputFormat: 'airqo-standard',
  pollutants: ['pm2_5'],
  startDateTime: '2026-08-01T00:00:00.000Z',
  sites: ['site-1'],
};

describe('AnalyticsService.getChartData', () => {
  beforeEach(() => jest.clearAllMocks());

  it('uses the canonical v2 chart route and exact current request fields', async () => {
    const chartResponse = {
      status: 'success',
      message: 'Chart data retrieved successfully.',
      chart_type: 'line',
      data: [],
      metadata: { total_count: 0, has_more: false, next: null },
    };
    mockPost.mockResolvedValueOnce({ data: chartResponse });

    await expect(analyticsService.getChartData(chartRequest)).resolves.toEqual(
      chartResponse
    );

    expect(mockPost).toHaveBeenCalledTimes(1);
    expect(mockPost).toHaveBeenCalledWith(
      '/analytics/dashboard/chart/data',
      {
        sites: ['site-1'],
        startDateTime: '2026-08-01T00:00:00.000Z',
        endDateTime: '2026-08-08T23:59:59.999Z',
        chartType: 'line',
        frequency: 'daily',
        pollutants: ['pm2_5'],
        metaDataFields: ['site_id'],
        organisationName: 'AirQo',
      },
      { signal: undefined }
    );

    const sentBody = mockPost.mock.calls[0][1];
    expect(sentBody).not.toHaveProperty('pollutant');
    expect(sentBody).not.toHaveProperty('organisation_name');
    expect(sentBody).not.toHaveProperty('startDate');
    expect(sentBody).not.toHaveProperty('endDate');
  });

  it('accumulates chart pages using the response cursor', async () => {
    mockPost
      .mockResolvedValueOnce({
        data: {
          status: 'success',
          message: 'first',
          chart_type: 'line',
          data: [{ site_id: 'site-1', value: 1 }],
          metadata: { total_count: 1, has_more: true, next: 'chart-cursor-2' },
        },
      })
      .mockResolvedValueOnce({
        data: {
          status: 'success',
          message: 'second',
          chart_type: 'line',
          data: [{ site_id: 'site-1', value: 2 }],
          metadata: { total_count: 1, has_more: false, next: null },
        },
      });

    await expect(analyticsService.getChartData(chartRequest)).resolves.toEqual({
      status: 'success',
      message: 'first',
      chart_type: 'line',
      data: [
        { site_id: 'site-1', value: 1 },
        { site_id: 'site-1', value: 2 },
      ],
      metadata: { total_count: 2, has_more: false, next: null },
    });

    expect(mockPost).toHaveBeenCalledTimes(2);
    expect(mockPost.mock.calls[1][1]).toEqual(
      expect.objectContaining({ cursor: 'chart-cursor-2' })
    );
  });

  it('deduplicates pollutants and always requests site_id metadata', () => {
    expect(
      buildChartPayload({
        ...chartRequest,
        pollutants: ['pm10', 'pm10'],
        metaDataFields: ['latitude', 'site_id'],
      })
    ).toEqual(
      expect.objectContaining({
        pollutants: ['pm10'],
        metaDataFields: ['latitude', 'site_id'],
      })
    );
  });

  it('preserves documented raw and yearly chart frequencies', () => {
    expect(
      normalizeChartApiFrequency('raw')
    ).toBe('raw');
    expect(normalizeChartApiFrequency('yearly')).toBe('yearly');
  });

  it('passes only documented chart types to the API', () => {
    expect(buildChartPayload({ ...chartRequest, chartType: 'pie' })).toEqual(
      expect.objectContaining({ chartType: 'pie' })
    );
    expect(buildChartPayload({ ...chartRequest, chartType: 'scatter' })).toEqual(
      expect.objectContaining({ chartType: 'line' })
    );
  });

  it('forwards the abort signal and never retries a rejected request', async () => {
    const controller = new AbortController();
    const failure = new Error('request failed');
    mockPost.mockRejectedValueOnce(failure);

    await expect(
      analyticsService.getChartData(chartRequest, controller.signal)
    ).rejects.toBe(failure);
    expect(mockPost).toHaveBeenCalledTimes(1);
    expect(mockPost).toHaveBeenCalledWith(
      '/analytics/dashboard/chart/data',
      expect.anything(),
      { signal: controller.signal }
    );
  });

  it('rejects missing dates before making a request', async () => {
    await expect(
      analyticsService.getChartData({
        ...chartRequest,
        startDateTime: '',
        endDateTime: '',
      })
    ).rejects.toThrow(/missing start and end dates/i);
    expect(mockPost).not.toHaveBeenCalled();
  });
});

describe('AnalyticsService.downloadData pagination', () => {
  beforeEach(() => jest.clearAllMocks());

  it('requests JSON internally and normalizes a single completed page', async () => {
    mockPost.mockResolvedValueOnce({
      data: {
        status: 'success',
        message: 'ok',
        data: [{ site_name: 'Site 1' }],
        metadata: { total_count: 1, has_more: false, next: null },
      },
    });

    await expect(
      analyticsService.downloadData(downloadRequest)
    ).resolves.toEqual({
      status: 'success',
      message: 'ok',
      data: [{ site_name: 'Site 1' }],
      metadata: { total_count: 1, has_more: false, next: null },
    });
    expect(mockPost).toHaveBeenCalledWith(
      '/analytics/data-download',
      expect.objectContaining({ downloadType: 'json' }),
      { signal: undefined }
    );
  });

  it('follows metadata.next even when an intermediate page is empty', async () => {
    const controller = new AbortController();
    mockPost
      .mockResolvedValueOnce({
        data: {
          status: 'success',
          message: 'first',
          data: [],
          metadata: { total_count: 0, has_more: true, next: 'cursor-2' },
        },
      })
      .mockResolvedValueOnce({
        data: {
          status: 'success',
          message: 'second',
          data: [{ site_name: 'Site 1' }, { site_name: 'Site 2' }],
          metadata: { total_count: 2, has_more: false, next: null },
        },
      });

    await expect(
      analyticsService.downloadData(downloadRequest, controller.signal)
    ).resolves.toEqual({
      status: 'success',
      message: 'first',
      data: [{ site_name: 'Site 1' }, { site_name: 'Site 2' }],
      metadata: { total_count: 2, has_more: false, next: null },
    });

    expect(mockPost).toHaveBeenCalledTimes(2);
    expect(mockPost.mock.calls[0][1]).not.toHaveProperty('cursor');
    expect(mockPost.mock.calls[1][1]).toEqual(
      expect.objectContaining({ cursor: 'cursor-2', downloadType: 'json' })
    );
    expect(mockPost.mock.calls[1][2]).toEqual({ signal: controller.signal });
  });

  it('fails safely when the backend repeats a pagination cursor', async () => {
    mockPost
      .mockResolvedValueOnce({
        data: {
          status: 'success',
          message: 'first',
          data: [],
          metadata: { total_count: 0, has_more: true, next: 'same-cursor' },
        },
      })
      .mockResolvedValueOnce({
        data: {
          status: 'success',
          message: 'second',
          data: [],
          metadata: { total_count: 0, has_more: true, next: 'same-cursor' },
        },
      });

    await expect(
      analyticsService.downloadData(downloadRequest)
    ).rejects.toThrow(/repeated pagination cursor/i);
    expect(mockPost).toHaveBeenCalledTimes(2);
  });

  it('preserves an unexpected legacy CSV response', async () => {
    mockPost.mockResolvedValueOnce({ data: 'site_name,pm2_5\r\nSite 1,12' });
    await expect(analyticsService.downloadData(downloadRequest)).resolves.toBe(
      'site_name,pm2_5\r\nSite 1,12'
    );
  });
});

describe('AnalyticsService reading helpers', () => {
  beforeEach(() => jest.clearAllMocks());

  it('trims site ids for recent readings and returns measurements', async () => {
    const measurements = [{ site_id: 'site-1' }];
    mockPost.mockResolvedValueOnce({
      data: { success: true, message: 'ok', measurements },
    });

    await expect(
      analyticsService.getRecentReadings([' site-1 ', '', 'site-2'])
    ).resolves.toEqual(measurements);
    expect(mockPost).toHaveBeenCalledWith(
      '/devices/readings/recent',
      { site_ids: ['site-1', 'site-2'] },
      { signal: undefined }
    );
  });

  it('does not request recent readings for an empty id list', async () => {
    await expect(
      analyticsService.getRecentReadings(['', ' '])
    ).resolves.toEqual([]);
    expect(mockPost).not.toHaveBeenCalled();
  });

  it('preserves cancellation errors from recent readings', async () => {
    const abortError = new Error('aborted');
    abortError.name = 'AbortError';
    mockPost.mockRejectedValueOnce(abortError);
    await expect(analyticsService.getRecentReadings(['site-1'])).rejects.toBe(
      abortError
    );
  });

  it('returns comparison readings', async () => {
    const readings = [{ site_id: 'site-1', has_reading: true }];
    mockPost.mockResolvedValueOnce({
      data: { success: true, message: 'ok', readings },
    });
    await expect(
      analyticsService.getComparisonReadings([' site-1 '])
    ).resolves.toEqual(readings);
  });
});
