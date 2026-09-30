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

const {
  analyticsService,
  buildChartPayload,
  buildReportPayload,
  normalizeChartApiFrequency,
  REPORT_MAX_POSTS,
  REPORT_MAX_SPLIT_DEPTH,
  setReportPacingForTests,
} = jest.requireActual('../analyticsService') as {
  analyticsService: {
    getChartData: (
      request: Record<string, unknown>,
      signal?: AbortSignal
    ) => Promise<Record<string, unknown>>;
    getReport: (
      request: Record<string, unknown>,
      signal?: AbortSignal
    ) => Promise<unknown>;
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
  buildReportPayload: (
    request: Record<string, unknown>
  ) => Record<string, unknown>;
  REPORT_MAX_POSTS: number;
  REPORT_MAX_SPLIT_DEPTH: number;
  normalizeChartApiFrequency: (value: string) => string;
  setReportPacingForTests: (overrides: {
    minSpacingMs?: number;
    windowMs?: number;
    maxRequests?: number;
  }) => void;
};

// Windowing helpers are used to derive the exact wire payloads the service
// posts, so the budget regression test's mock always matches the real queue
// shape instead of re-pinning boundary dates here.
const { buildReportWindows, splitReportWindow } = jest.requireActual(
  '../utils/reportWindows'
) as {
  buildReportWindows: (request: Record<string, unknown>) => {
    start_time: string;
    end_time: string;
  }[];
  splitReportWindow: (
    window: Record<string, unknown>
  ) =>
    | [
        { start_time: string; end_time: string },
        { start_time: string; end_time: string },
      ]
    | null;
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

const reportRequest = {
  cohort_id: ' cohort-1 ',
  start_time: '2024-01-01T00:00:00Z',
  end_time: '2024-01-20T23:59:59Z',
};

/** 60 days in the past, so the future-start guard never rejects it. */
const longReportRequest = {
  cohort_id: 'cohort-1',
  start_time: '2024-01-01T00:00:00Z',
  end_time: '2024-03-01T00:00:00Z',
};

/** Minimal successful-but-empty report body for pacing/429 tests. */
const buildEmptyReport = (period = longReportRequest) => ({
  status: 'success',
  cohort_id: 'cohort-1',
  devices: { device_ids: [], number_of_devices: 0 },
  period: {
    startTime: period.start_time,
    endTime: period.end_time,
  },
  daily_mean_pm: [],
  datetime_mean_pm: [],
  diurnal: [],
  annual_pm: [],
  monthly_pm: [],
  pm_by_month_year: [],
  pm_by_month_name: [],
  site_monthly_mean_pm: [],
  site_annual_mean_pm: [],
  site_mean_pm: [],
  mean_pm_by_city: [],
  mean_pm_by_country: [],
  mean_pm_by_region: [],
  mean_pm_by_day_of_week: [],
  mean_pm_by_day_hour: [],
});

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
        metaDataFields: ['site_id', 'latitude'],
      })
    );
  });

  it('preserves documented raw and yearly chart frequencies', () => {
    expect(normalizeChartApiFrequency('raw')).toBe('raw');
    expect(normalizeChartApiFrequency('yearly')).toBe('yearly');
  });

  it('passes only documented chart types to the API', () => {
    expect(buildChartPayload({ ...chartRequest, chartType: 'pie' })).toEqual(
      expect.objectContaining({ chartType: 'pie' })
    );
    expect(
      buildChartPayload({ ...chartRequest, chartType: 'scatter' })
    ).toEqual(expect.objectContaining({ chartType: 'line' }));
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

describe('AnalyticsService.getReport', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Drop the real 6 s spacing so the adaptive loop runs without wall-clock
    // delays; the pacing itself is covered by its own test below.
    setReportPacingForTests({ minSpacingMs: 0, windowMs: 60_000 });
  });

  afterEach(() => {
    setReportPacingForTests({
      minSpacingMs: 6_000,
      windowMs: 60_000,
      maxRequests: 10,
    });
  });

  it('sends the documented cohort report payload through the token client', async () => {
    const report = {
      status: 'success',
      cohort_id: 'cohort-1',
      devices: { device_ids: ['device-1'], number_of_devices: 1 },
      period: {
        startTime: '2024-01-01T00:00:00+00:00',
        endTime: '2024-01-20T23:59:59+00:00',
      },
      daily_mean_pm: [],
      datetime_mean_pm: [],
      diurnal: [],
      annual_pm: [],
      monthly_pm: [],
      pm_by_month_year: [],
      pm_by_month_name: [],
      site_monthly_mean_pm: [],
      site_annual_mean_pm: [],
      site_mean_pm: [],
      mean_pm_by_city: [],
      mean_pm_by_country: [],
      mean_pm_by_region: [],
      mean_pm_by_day_of_week: [],
      mean_pm_by_day_hour: [],
    };
    mockPost.mockResolvedValueOnce({ data: { airquality: report } });

    await expect(analyticsService.getReport(reportRequest)).resolves.toEqual(
      report
    );
    expect(mockPost).toHaveBeenCalledWith(
      '/analytics/report',
      {
        cohort_id: 'cohort-1',
        start_time: '2024-01-01T00:00:00Z',
        end_time: '2024-01-20T23:59:59Z',
      },
      { signal: undefined, suppressErrorLogging: true }
    );
  });

  it('issues one POST per 27-day window for a 60-day range and merges the results', async () => {
    // Pin the clock so the future-start guard cannot flake regardless of the
    // machine's date; buildReportPayload only reads it via Date.now().
    const nowSpy = jest
      .spyOn(Date, 'now')
      .mockReturnValue(Date.parse('2026-09-30T12:00:00Z'));
    try {
      mockPost.mockImplementation(
        async (_path: string, body: { start_time: string }) => ({
          data: {
            airquality: {
              status: 'success',
              cohort_id: 'cohort-1',
              devices: { device_ids: [], number_of_devices: 0 },
              period: { startTime: body.start_time, endTime: '' },
              daily_mean_pm: [
                {
                  date: body.start_time.slice(0, 10),
                  pm2_5_calibrated_value: 10,
                },
              ],
              datetime_mean_pm: [],
              diurnal: [],
              annual_pm: [],
              monthly_pm: [],
              pm_by_month_year: [],
              pm_by_month_name: [],
              site_monthly_mean_pm: [],
              site_annual_mean_pm: [],
              site_mean_pm: [],
              mean_pm_by_city: [],
              mean_pm_by_country: [],
              mean_pm_by_region: [],
              mean_pm_by_day_of_week: [],
              mean_pm_by_day_hour: [],
            },
          },
        })
      );

      const report = await analyticsService.getReport({
        cohort_id: 'cohort-1',
        start_time: '2026-01-01',
        end_time: '2026-03-01',
      });

      expect(mockPost).toHaveBeenCalledTimes(3);
      expect(mockPost.mock.calls[0][1]).toEqual({
        cohort_id: 'cohort-1',
        start_time: '2026-01-01T00:00:00.000Z',
        end_time: '2026-01-27T23:59:59.999Z',
      });
      expect(mockPost.mock.calls[1][1]).toEqual({
        cohort_id: 'cohort-1',
        start_time: '2026-01-28T00:00:00.000Z',
        end_time: '2026-02-23T23:59:59.999Z',
      });
      expect(mockPost.mock.calls[2][1]).toEqual({
        cohort_id: 'cohort-1',
        start_time: '2026-02-24T00:00:00.000Z',
        end_time: '2026-03-01T23:59:59.999Z',
      });
      expect(mockPost.mock.calls[0][2]).toEqual({
        signal: undefined,
        suppressErrorLogging: true,
      });

      // The windows are merged into one report covering the overall period.
      const merged = report as {
        period: { startTime: string; endTime: string };
        daily_mean_pm: { date: string }[];
      };
      expect(merged.period).toEqual({
        startTime: '2026-01-01T00:00:00.000Z',
        endTime: '2026-03-01T23:59:59.999Z',
      });
      expect(merged.daily_mean_pm.map(row => row.date)).toEqual([
        '2026-01-01',
        '2026-01-28',
        '2026-02-24',
      ]);
      expect(report).not.toHaveProperty('message');
    } finally {
      nowSpy.mockRestore();
    }
  });

  it('rejects report periods wider than 92 days before making a request', async () => {
    const nowSpy = jest
      .spyOn(Date, 'now')
      .mockReturnValue(Date.parse('2026-09-30T12:00:00Z'));
    try {
      await expect(
        analyticsService.getReport({
          ...reportRequest,
          start_time: '2026-06-01T00:00:00Z',
          end_time: '2026-09-02T23:59:59Z',
        })
      ).rejects.toThrow(/cannot exceed 92 days/i);
      expect(mockPost).not.toHaveBeenCalled();
    } finally {
      nowSpy.mockRestore();
    }
  });

  it('caps report POSTs at a flat ceiling instead of scaling with the range', () => {
    // The request-storm guard. The cap used to be `2 * D + 8`, derived from
    // the range so that a worst-case split down to 1-day leaves always fitted
    // — which meant one rejected date selection could fan out into ~60 paced
    // POSTs. A short range and the longest supported range now get the same
    // budget, because splitting is a bounded fallback, not a search.
    expect(REPORT_MAX_POSTS).toBe(12);
    // One halving per window is enough to tell "too wide" apart from
    // "no data in this month"; deeper recursion only multiplies requests.
    expect(REPORT_MAX_SPLIT_DEPTH).toBe(1);
  });

  it('keeps a 92-UTC-date range intact and rejects 93 UTC dates', () => {
    // Pin the clock so the future-start guard cannot flake regardless of the
    // machine's date; buildReportPayload only reads it via Date.now().
    const nowSpy = jest
      .spyOn(Date, 'now')
      .mockReturnValue(Date.parse('2026-09-30T12:00:00Z'));
    try {
      expect(
        buildReportPayload({
          cohort_id: 'cohort-1',
          start_time: '2026-06-01T00:00:00.000Z',
          end_time: '2026-08-31T23:59:59.999Z',
        })
      ).toEqual({
        cohort_id: 'cohort-1',
        start_time: '2026-06-01T00:00:00.000Z',
        end_time: '2026-08-31T23:59:59.999Z',
      });

      // Jun 1 → Sep 1 is 93 UTC calendar dates, past the overall cap.
      expect(() =>
        buildReportPayload({
          cohort_id: 'cohort-1',
          start_time: '2026-06-01T00:00:00.000Z',
          end_time: '2026-09-01T23:59:59.999Z',
        })
      ).toThrow(/cannot exceed 92 days/i);
    } finally {
      nowSpy.mockRestore();
    }
  });

  it('rejects invalid report scopes before making a request', async () => {
    await expect(
      analyticsService.getReport({ ...reportRequest, cohort_id: ' ' })
    ).rejects.toThrow(/cohort is required/i);
    await expect(
      analyticsService.getReport({
        ...reportRequest,
        start_time: '2024-03-31T23:59:59Z',
        end_time: '2024-01-01T00:00:00Z',
      })
    ).rejects.toThrow(/end date must be after/i);
    await expect(
      analyticsService.getReport({
        ...reportRequest,
        start_time: '2099-01-01T00:00:00Z',
        end_time: '2099-02-01T00:00:00Z',
      })
    ).rejects.toThrow(/future/i);
    expect(mockPost).not.toHaveBeenCalled();
  });

  it('preserves cancellation and sanitizes non-splittable failures', async () => {
    const controller = new AbortController();
    const cancellation = new Error('aborted');
    cancellation.name = 'AbortError';
    mockPost.mockRejectedValueOnce(cancellation);

    await expect(
      analyticsService.getReport(reportRequest, controller.signal)
    ).rejects.toBe(cancellation);

    const failure = Object.assign(new Error('private backend detail'), {
      response: { status: 404 },
    });
    mockPost.mockRejectedValueOnce(failure);

    await expect(analyticsService.getReport(reportRequest)).rejects.toThrow(
      /cohort is no longer available/i
    );

    const serverError = Object.assign(new Error('internal error'), {
      response: { status: 500 },
    });
    mockPost.mockRejectedValueOnce(serverError);

    await expect(analyticsService.getReport(reportRequest)).rejects.toThrow(
      /temporarily unavailable/i
    );
    expect(mockPost).toHaveBeenCalledTimes(3);
  });

  it('splits a Jun→Jul-spanning window on 400 and merges the two halves', async () => {
    // Pin clock to avoid future-start guard flake.
    const nowSpy = jest
      .spyOn(Date, 'now')
      .mockReturnValue(Date.parse('2026-09-30T12:00:00Z'));
    try {
      const okReport = (start: string, end: string) => ({
        status: 'success',
        cohort_id: 'cohort-1',
        devices: { device_ids: [], number_of_devices: 0 },
        period: { startTime: start, endTime: end },
        daily_mean_pm: [
          { date: start.slice(0, 10), pm2_5_calibrated_value: 10 },
        ],
        datetime_mean_pm: [],
        diurnal: [],
        annual_pm: [],
        monthly_pm: [],
        pm_by_month_year: [],
        pm_by_month_name: [],
        site_monthly_mean_pm: [],
        site_annual_mean_pm: [],
        site_mean_pm: [],
        mean_pm_by_city: [],
        mean_pm_by_country: [],
        mean_pm_by_region: [],
        mean_pm_by_day_of_week: [],
        mean_pm_by_day_hour: [],
      });

      // First call: the 27-day window Jun 5 → Jul 1 spans the bad boundary → 400.
      // Its two split halves (Jun 5–30, Jul 1) both succeed.
      const rangeError = Object.assign(new Error('range too wide'), {
        response: { status: 400 },
      });
      mockPost
        .mockRejectedValueOnce(rangeError)
        .mockResolvedValueOnce({
          data: {
            airquality: okReport(
              '2026-06-05T00:00:00.000Z',
              '2026-06-30T23:59:59.999Z'
            ),
          },
        })
        .mockResolvedValueOnce({
          data: {
            airquality: okReport(
              '2026-07-01T00:00:00.000Z',
              '2026-07-01T23:59:59.999Z'
            ),
          },
        });

      const report = await analyticsService.getReport({
        cohort_id: 'cohort-1',
        start_time: '2026-06-05',
        end_time: '2026-07-01',
      });

      expect(mockPost).toHaveBeenCalledTimes(3);
      expect(report).not.toHaveProperty('unavailablePeriods');
      expect(report).not.toHaveProperty('message');
      const merged = report as { daily_mean_pm: { date: string }[] };
      expect(merged.daily_mean_pm.map(r => r.date)).toEqual([
        '2026-06-05',
        '2026-07-01',
      ]);
    } finally {
      nowSpy.mockRestore();
    }
  });

  it('marks an all-bad month unavailable while merging the rest', async () => {
    // Pin clock to avoid future-start guard flake.
    const nowSpy = jest
      .spyOn(Date, 'now')
      .mockReturnValue(Date.parse('2026-09-30T12:00:00Z'));
    try {
      const okReport = (start: string, end: string) => ({
        status: 'success',
        cohort_id: 'cohort-1',
        devices: { device_ids: [], number_of_devices: 0 },
        period: { startTime: start, endTime: end },
        daily_mean_pm: [
          { date: start.slice(0, 10), pm2_5_calibrated_value: 10 },
        ],
        datetime_mean_pm: [],
        diurnal: [],
        annual_pm: [],
        monthly_pm: [],
        pm_by_month_year: [],
        pm_by_month_name: [],
        site_monthly_mean_pm: [],
        site_annual_mean_pm: [],
        site_mean_pm: [],
        mean_pm_by_city: [],
        mean_pm_by_country: [],
        mean_pm_by_region: [],
        mean_pm_by_day_of_week: [],
        mean_pm_by_day_hour: [],
      });

      const rangeError = Object.assign(new Error('range too wide'), {
        response: { status: 400 },
      });

      // Range: 2026-07-15 → 2026-08-15 (32 days → two 27-day windows:
      //   Jul 15–31 (17 days, single month Jul) and Aug 1–15 (15 days, Aug).
      // Jul window succeeds; every August sub-window (down to 1 day) fails →
      // recorded as unavailable while the Jul data is merged.
      mockPost.mockImplementation(
        async (
          _path: string,
          body: { start_time: string; end_time: string }
        ) => {
          const month = body.start_time.slice(0, 7);
          if (month === '2026-08') {
            throw rangeError;
          }
          return {
            data: { airquality: okReport(body.start_time, body.end_time) },
          };
        }
      );

      const report = await analyticsService.getReport({
        cohort_id: 'cohort-1',
        start_time: '2026-07-15',
        end_time: '2026-08-15',
      });

      expect(report).toHaveProperty('unavailablePeriods');
      const merged = report as {
        unavailablePeriods: { startTime: string; endTime: string }[];
      };
      // Every 1-day window in August that was attempted is recorded.
      expect(merged.unavailablePeriods.length).toBeGreaterThan(0);
      expect(
        merged.unavailablePeriods.every(
          p => p.startTime.slice(0, 7) === '2026-08'
        )
      ).toBe(true);
      // Jul data is still present.
      expect(
        (report as { daily_mean_pm: { date: string }[] }).daily_mean_pm.map(
          r => r.date
        )
      ).toEqual(['2026-07-15']);
    } finally {
      nowSpy.mockRestore();
    }
  });

  it('records every failed or skipped window exactly once across a 92-day range with a bad month', async () => {
    // Pin clock to avoid future-start guard flake.
    const nowSpy = jest
      .spyOn(Date, 'now')
      .mockReturnValue(Date.parse('2026-09-30T12:00:00Z'));
    try {
      const okReport = (start: string, end: string) => ({
        status: 'success',
        cohort_id: 'cohort-1',
        devices: { device_ids: [], number_of_devices: 0 },
        period: { startTime: start, endTime: end },
        daily_mean_pm: [
          { date: start.slice(0, 10), pm2_5_calibrated_value: 10 },
        ],
        datetime_mean_pm: [],
        diurnal: [],
        annual_pm: [],
        monthly_pm: [],
        pm_by_month_year: [],
        pm_by_month_name: [],
        site_monthly_mean_pm: [],
        site_annual_mean_pm: [],
        site_mean_pm: [],
        mean_pm_by_city: [],
        mean_pm_by_country: [],
        mean_pm_by_region: [],
        mean_pm_by_day_of_week: [],
        mean_pm_by_day_hour: [],
      });

      const rangeError = Object.assign(new Error('range too wide'), {
        response: { status: 400 },
      });
      const successRanges: { start: string; end: string }[] = [];

      // Jun 1 → Aug 31 2026 (92 dates, four 27-day windows). Anything that
      // touches August is rejected; June and July come back with data.
      mockPost.mockImplementation(
        async (
          _path: string,
          body: { start_time: string; end_time: string }
        ) => {
          const touchesAugust =
            body.start_time.slice(0, 7) === '2026-08' ||
            body.end_time.slice(0, 7) === '2026-08';
          if (touchesAugust) throw rangeError;
          successRanges.push({
            start: body.start_time.slice(0, 10),
            end: body.end_time.slice(0, 10),
          });
          return {
            data: { airquality: okReport(body.start_time, body.end_time) },
          };
        }
      );

      // The POST ceiling is flat, so this range can never fan out into a
      // request per split node.
      expect(REPORT_MAX_POSTS).toBe(12);

      const report = await analyticsService.getReport({
        cohort_id: 'cohort-1',
        start_time: '2026-06-01',
        end_time: '2026-08-31',
      });

      expect(mockPost.mock.calls.length).toBeLessThanOrEqual(REPORT_MAX_POSTS);

      const merged = report as {
        unavailablePeriods: { startTime: string; endTime: string }[];
        daily_mean_pm: { date: string }[];
      };
      expect(merged.unavailablePeriods.length).toBeGreaterThan(0);
      // Every rejected (split down to the depth budget) and skipped
      // (known-bad month) window is recorded — no queued window may be
      // dropped silently.
      expect(
        merged.unavailablePeriods.every(
          p => p.startTime.slice(0, 7) === '2026-08'
        )
      ).toBe(true);

      // A window that ran out of split budget is NOT evidence that its month
      // is unusable, so the month must not be blacklisted: the later
      // Aug 21–31 window still has to be attempted and recorded.
      const unavailableDays = new Set<string>();
      for (const period of merged.unavailablePeriods) {
        const start = Date.parse(`${period.startTime.slice(0, 10)}T00:00:00Z`);
        const end = Date.parse(`${period.endTime.slice(0, 10)}T00:00:00Z`);
        for (let ms = start; ms <= end; ms += 24 * 60 * 60 * 1000) {
          unavailableDays.add(new Date(ms).toISOString().slice(0, 10));
        }
      }
      expect(unavailableDays.has('2026-08-01')).toBe(true);
      expect(unavailableDays.has('2026-08-20')).toBe(true);
      expect(unavailableDays.has('2026-08-31')).toBe(true);

      // Coverage proof: the successful windows plus the unavailable periods
      // must tile the requested range with every calendar day exactly once
      // (no missing day, no day recorded twice).
      const coverage = new Map<string, number>();
      const cover = (start: string, end: string) => {
        const dayMs = 24 * 60 * 60 * 1000;
        for (
          let ms = Date.parse(`${start}T00:00:00.000Z`);
          ms <= Date.parse(`${end}T00:00:00.000Z`);
          ms += dayMs
        ) {
          const day = new Date(ms).toISOString().slice(0, 10);
          coverage.set(day, (coverage.get(day) ?? 0) + 1);
        }
      };
      successRanges.forEach(range => cover(range.start, range.end));
      merged.unavailablePeriods.forEach(period =>
        cover(period.startTime.slice(0, 10), period.endTime.slice(0, 10))
      );

      expect(coverage.size).toBe(92);
      coverage.forEach((count, day) => {
        expect({ day, count }).toEqual({ day, count: 1 });
      });

      // June and July survive the merge.
      expect(merged.daily_mean_pm.map(r => r.date)).toEqual([
        '2026-06-01',
        '2026-06-28',
        '2026-07-25',
      ]);
    } finally {
      nowSpy.mockRestore();
    }
  });

  it('gives up on a fully rejected range instead of splitting down to single days', async () => {
    // Pin clock to avoid future-start guard flake.
    const nowSpy = jest
      .spyOn(Date, 'now')
      .mockReturnValue(Date.parse('2026-09-30T12:00:00Z'));
    // The clock is frozen, so the sliding window can never roll over; raise
    // the request ceiling so the pacing gate doesn't stall this test.
    setReportPacingForTests({ minSpacingMs: 0, maxRequests: 100_000 });
    try {
      const okReport = (start: string, end: string) => ({
        status: 'success',
        cohort_id: 'cohort-1',
        devices: { device_ids: [], number_of_devices: 0 },
        period: { startTime: start, endTime: end },
        daily_mean_pm: [
          { date: start.slice(0, 10), pm2_5_calibrated_value: 10 },
        ],
        datetime_mean_pm: [],
        diurnal: [],
        annual_pm: [],
        monthly_pm: [],
        pm_by_month_year: [],
        pm_by_month_name: [],
        site_monthly_mean_pm: [],
        site_annual_mean_pm: [],
        site_mean_pm: [],
        mean_pm_by_city: [],
        mean_pm_by_country: [],
        mean_pm_by_region: [],
        mean_pm_by_day_of_week: [],
        mean_pm_by_day_hour: [],
      });

      const rangeError = Object.assign(new Error('range too wide'), {
        response: { status: 400 },
      });
      // Reject every window wider than a single day. This is the pathological
      // case: the loop used to keep halving until every window was a 1-day
      // leaf, which turned one selection into ~180 paced POSTs.
      mockPost.mockImplementation(
        async (
          _path: string,
          body: { start_time: string; end_time: string }
        ) => {
          if (body.start_time.slice(0, 10) !== body.end_time.slice(0, 10)) {
            throw rangeError;
          }
          return {
            data: { airquality: okReport(body.start_time, body.end_time) },
          };
        }
      );

      // Nothing above a single day is usable, so the report fails — but it must
      // fail after a handful of requests rather than after exhausting the tree.
      await expect(
        analyticsService.getReport({
          cohort_id: 'cohort-1',
          start_time: '2026-06-01',
          end_time: '2026-08-31',
        })
      ).rejects.toThrow();

      // 4 initial windows, each tried once plus one halving of its two halves.
      // The old recursion kept halving to 1-day leaves and issued ~183 POSTs
      // for the same range, paced 6 s apart.
      expect(mockPost.mock.calls.length).toBeLessThanOrEqual(REPORT_MAX_POSTS);
      expect(mockPost.mock.calls.length).toBe(12);
    } finally {
      nowSpy.mockRestore();
    }
  });

  it('keeps serving the windows that succeed when a sibling window is written off', async () => {
    // Pin clock to avoid future-start guard flake.
    const nowSpy = jest
      .spyOn(Date, 'now')
      .mockReturnValue(Date.parse('2026-09-30T12:00:00Z'));
    setReportPacingForTests({ minSpacingMs: 0, maxRequests: 100_000 });
    try {
      const okReport = (start: string, end: string) => ({
        status: 'success',
        cohort_id: 'cohort-1',
        devices: { device_ids: [], number_of_devices: 0 },
        period: { startTime: start, endTime: end },
        daily_mean_pm: [
          { date: start.slice(0, 10), pm2_5_calibrated_value: 10 },
        ],
        datetime_mean_pm: [],
        diurnal: [],
        annual_pm: [],
        monthly_pm: [],
        pm_by_month_year: [],
        pm_by_month_name: [],
        site_monthly_mean_pm: [],
        site_annual_mean_pm: [],
        site_mean_pm: [],
        mean_pm_by_city: [],
        mean_pm_by_country: [],
        mean_pm_by_region: [],
        mean_pm_by_day_of_week: [],
        mean_pm_by_day_hour: [],
      });

      const rangeError = Object.assign(new Error('range too wide'), {
        response: { status: 400 },
      });
      // Jun 20 → Jul 20 (31 dates, two windows: Jun 20–Jul 16 and Jul 17–20).
      // June is rejected at every size; July is fine.
      mockPost.mockImplementation(
        async (
          _path: string,
          body: { start_time: string; end_time: string }
        ) => {
          if (body.start_time.slice(0, 7) === '2026-06') throw rangeError;
          return {
            data: { airquality: okReport(body.start_time, body.end_time) },
          };
        }
      );

      const report = await analyticsService.getReport({
        cohort_id: 'cohort-1',
        start_time: '2026-06-20',
        end_time: '2026-07-20',
      });

      const merged = report as {
        unavailablePeriods: { startTime: string; endTime: string }[];
        daily_mean_pm: { date: string }[];
      };
      // The June window is written off after one halving and surfaced, not
      // silently retried away.
      expect(merged.unavailablePeriods).toHaveLength(1);
      expect(merged.unavailablePeriods[0].startTime.slice(0, 10)).toBe(
        '2026-06-20'
      );
      expect(merged.unavailablePeriods[0].endTime.slice(0, 10)).toBe(
        '2026-06-30'
      );
      // July still renders.
      expect(merged.daily_mean_pm.map(row => row.date)).toEqual([
        '2026-07-01',
        '2026-07-17',
      ]);
      expect(mockPost.mock.calls.length).toBeLessThanOrEqual(REPORT_MAX_POSTS);
    } finally {
      nowSpy.mockRestore();
    }
  });

  it('retries once on 429 then succeeds', async () => {
    jest.useFakeTimers();
    try {
      const successReport = {
        status: 'success',
        cohort_id: 'cohort-1',
        devices: { device_ids: ['device-1'], number_of_devices: 1 },
        period: {
          startTime: '2024-01-01T00:00:00Z',
          endTime: '2024-01-20T23:59:59Z',
        },
        daily_mean_pm: [],
        datetime_mean_pm: [],
        diurnal: [],
        annual_pm: [],
        monthly_pm: [],
        pm_by_month_year: [],
        pm_by_month_name: [],
        site_monthly_mean_pm: [],
        site_annual_mean_pm: [],
        site_mean_pm: [],
        mean_pm_by_city: [],
        mean_pm_by_country: [],
        mean_pm_by_region: [],
        mean_pm_by_day_of_week: [],
        mean_pm_by_day_hour: [],
      };
      const rateLimitError = Object.assign(new Error('rate limited'), {
        response: { status: 429 },
      });
      mockPost
        .mockRejectedValueOnce(rateLimitError)
        .mockResolvedValueOnce({ data: { airquality: successReport } });

      const promise = analyticsService.getReport(reportRequest);
      await jest.runAllTimersAsync();
      await expect(promise).resolves.toMatchObject({ status: 'success' });
      expect(mockPost).toHaveBeenCalledTimes(2);
    } finally {
      jest.useRealTimers();
    }
  });

  it('honours Retry-After when the service sends it', async () => {
    jest.useFakeTimers();
    try {
      const successReport = {
        status: 'success',
        cohort_id: 'cohort-1',
        devices: { device_ids: ['device-1'], number_of_devices: 1 },
        period: {
          startTime: '2024-01-01T00:00:00Z',
          endTime: '2024-01-20T23:59:59Z',
        },
        daily_mean_pm: [],
        datetime_mean_pm: [],
        diurnal: [],
        annual_pm: [],
        monthly_pm: [],
        pm_by_month_year: [],
        pm_by_month_name: [],
        site_monthly_mean_pm: [],
        site_annual_mean_pm: [],
        site_mean_pm: [],
        mean_pm_by_city: [],
        mean_pm_by_country: [],
        mean_pm_by_region: [],
        mean_pm_by_day_of_week: [],
        mean_pm_by_day_hour: [],
      };
      const rateLimitError = Object.assign(new Error('rate limited'), {
        response: { status: 429, headers: { 'retry-after': '2' } },
      });
      mockPost
        .mockRejectedValueOnce(rateLimitError)
        .mockResolvedValueOnce({ data: { airquality: successReport } });

      const promise = analyticsService.getReport(reportRequest);
      await jest.advanceTimersByTimeAsync(1_999);
      expect(mockPost).toHaveBeenCalledTimes(1);
      await jest.runAllTimersAsync();
      await expect(promise).resolves.toMatchObject({ status: 'success' });
    } finally {
      jest.useRealTimers();
    }
  });

  it('splits a window when the 429 retry comes back as a 400', async () => {
    jest.useFakeTimers();
    try {
      const nowSpy = jest
        .spyOn(Date, 'now')
        .mockReturnValue(Date.parse('2026-10-01T00:00:00.000Z'));
      const rateLimitError = Object.assign(new Error('rate limited'), {
        response: { status: 429 },
      });
      const tooWideError = Object.assign(new Error('too wide'), {
        response: { status: 400 },
      });
      mockPost
        .mockRejectedValueOnce(rateLimitError)
        .mockRejectedValueOnce(tooWideError)
        .mockResolvedValue({
          data: {
            airquality: {
              status: 'success',
              cohort_id: 'cohort-1',
              devices: { device_ids: [], number_of_devices: 0 },
              period: {
                startTime: '2026-09-01T00:00:00Z',
                endTime: '2026-09-27T23:59:59Z',
              },
              daily_mean_pm: [],
              datetime_mean_pm: [],
              diurnal: [],
              annual_pm: [],
              monthly_pm: [],
              pm_by_month_year: [],
              pm_by_month_name: [],
              site_monthly_mean_pm: [],
              site_annual_mean_pm: [],
              site_mean_pm: [],
              mean_pm_by_city: [],
              mean_pm_by_country: [],
              mean_pm_by_region: [],
              mean_pm_by_day_of_week: [],
              mean_pm_by_day_hour: [],
            },
          },
        });

      const promise = analyticsService.getReport(reportRequest);
      await jest.runAllTimersAsync();
      await expect(promise).resolves.toMatchObject({ status: 'success' });
      // Original POST, its 429 retry, then the two split windows.
      expect(mockPost.mock.calls.length).toBeGreaterThanOrEqual(4);
      nowSpy.mockRestore();
    } finally {
      jest.useRealTimers();
    }
  });

  it('records a window as unavailable instead of failing the whole report when 429 retries run out', async () => {
    jest.useFakeTimers();
    try {
      const emptyReport = buildEmptyReport();
      const rateLimitError = Object.assign(new Error('rate limited'), {
        response: { status: 429 },
      });

      // First window exhausts its retries; later windows still succeed, so the
      // successful data must survive alongside the unavailable period.
      mockPost
        .mockRejectedValueOnce(rateLimitError)
        .mockRejectedValueOnce(rateLimitError)
        .mockResolvedValue({ data: { airquality: emptyReport } });

      const promise = analyticsService.getReport(longReportRequest);
      await jest.runAllTimersAsync();
      const merged = (await promise) as { unavailablePeriods?: unknown[] };

      expect(merged.unavailablePeriods).toHaveLength(1);
    } finally {
      jest.useRealTimers();
    }
  });

  it('throws when every window is rate limited', async () => {
    jest.useFakeTimers();
    try {
      const rateLimitError = Object.assign(new Error('rate limited'), {
        response: { status: 429 },
      });
      mockPost.mockRejectedValue(rateLimitError);

      const promise = analyticsService.getReport(reportRequest);
      const assertion = expect(promise).rejects.toThrow();
      await jest.runAllTimersAsync();
      await assertion;
    } finally {
      jest.useRealTimers();
    }
  });

  it('spaces consecutive report POSTs by the configured minimum interval', async () => {
    // Real timers and a monotonic clock: the spacing under test is a
    // wall-clock delay. `longReportRequest` is in 2024, so the future-start
    // guard passes without touching `Date.now` (other tests here pin it).
    jest.useRealTimers();
    setReportPacingForTests({ minSpacingMs: 30, windowMs: 60_000 });
    const mockPostTimes: number[] = [];
    mockPost.mockImplementation(() => {
      mockPostTimes.push(performance.now());
      return Promise.resolve({ data: { airquality: buildEmptyReport() } });
    });

    try {
      // A 60-day range becomes three windows, so at least two gaps must be
      // observed between the POSTs.
      await analyticsService.getReport(longReportRequest);
      expect(mockPostTimes.length).toBeGreaterThanOrEqual(3);
      for (let index = 1; index < mockPostTimes.length; index += 1) {
        expect(
          mockPostTimes[index] - mockPostTimes[index - 1]
        ).toBeGreaterThanOrEqual(25);
      }
    } finally {
      setReportPacingForTests({ minSpacingMs: 0 });
    }
  });

  it('throws an abort error when the request is aborted during the 429 retry delay', async () => {
    jest.useFakeTimers();
    try {
      const controller = new AbortController();
      const rateLimitError = Object.assign(new Error('rate limited'), {
        response: { status: 429 },
      });
      mockPost.mockRejectedValueOnce(rateLimitError);

      const promise = analyticsService.getReport(
        reportRequest,
        controller.signal
      );
      // Flush the rejected POST so the 429 handler reaches the retry delay.
      for (let tick = 0; tick < 10; tick += 1) await Promise.resolve();
      // The bounded retry delay is now pending — abort mid-wait.
      expect(jest.getTimerCount()).toBeGreaterThan(0);
      controller.abort();

      // The abort error surfaces (not the wrapped 429) and no retry is sent.
      await expect(promise).rejects.toMatchObject({ name: 'AbortError' });
      expect(mockPost).toHaveBeenCalledTimes(1);
    } finally {
      jest.useRealTimers();
    }
  });

  it('splits an initial 422 from the 31-day guard into two valid windows', async () => {
    // Pin clock to avoid future-start guard flake.
    const nowSpy = jest
      .spyOn(Date, 'now')
      .mockReturnValue(Date.parse('2026-09-30T12:00:00Z'));
    try {
      const okReport = (start: string, end: string) => ({
        status: 'success',
        cohort_id: 'cohort-1',
        devices: { device_ids: [], number_of_devices: 0 },
        period: { startTime: start, endTime: end },
        daily_mean_pm: [
          { date: start.slice(0, 10), pm2_5_calibrated_value: 10 },
        ],
        datetime_mean_pm: [],
        diurnal: [],
        annual_pm: [],
        monthly_pm: [],
        pm_by_month_year: [],
        pm_by_month_name: [],
        site_monthly_mean_pm: [],
        site_annual_mean_pm: [],
        site_mean_pm: [],
        mean_pm_by_city: [],
        mean_pm_by_country: [],
        mean_pm_by_region: [],
        mean_pm_by_day_of_week: [],
        mean_pm_by_day_hour: [],
      });

      // A 27-day window is used, but simulate the 422 guard rejecting it.
      const guardError = Object.assign(
        new Error('Date range must not exceed 31 days'),
        {
          response: { status: 422 },
        }
      );
      // The initial window is rejected; the two split halves (Sep 1 → Sep 14,
      // Sep 15 → Sep 27) succeed. Match the exact wire payloads the service
      // posts after splitting.
      mockPost.mockImplementation(
        async (
          _path: string,
          body: { start_time: string; end_time: string }
        ) => {
          if (
            body.start_time === '2026-09-01T00:00:00.000Z' &&
            body.end_time === '2026-09-27T23:59:59.999Z'
          ) {
            throw guardError;
          }
          return {
            data: { airquality: okReport(body.start_time, body.end_time) },
          };
        }
      );

      const report = await analyticsService.getReport({
        cohort_id: 'cohort-1',
        start_time: '2026-09-01',
        end_time: '2026-09-27',
      });

      expect(mockPost).toHaveBeenCalledTimes(3);
      expect(report).not.toHaveProperty('unavailablePeriods');
      expect(report).not.toHaveProperty('message');
    } finally {
      nowSpy.mockRestore();
    }
  });

  it('does not let a 429 retry push the report past the POST ceiling', async () => {
    jest.useFakeTimers();
    // Pin clock to avoid future-start guard flake.
    const nowSpy = jest
      .spyOn(Date, 'now')
      .mockReturnValue(Date.parse('2026-09-30T12:00:00Z'));
    // The clock is frozen, so the sliding window can never roll over; raise
    // the request ceiling so the pacing gate doesn't stall this test.
    setReportPacingForTests({ minSpacingMs: 0, maxRequests: 100_000 });
    try {
      const okReport = (start: string, end: string) => ({
        status: 'success',
        cohort_id: 'cohort-1',
        devices: { device_ids: [], number_of_devices: 0 },
        period: { startTime: start, endTime: end },
        daily_mean_pm: [
          { date: start.slice(0, 10), pm2_5_calibrated_value: 10 },
        ],
        datetime_mean_pm: [],
        diurnal: [],
        annual_pm: [],
        monthly_pm: [],
        pm_by_month_year: [],
        pm_by_month_name: [],
        site_monthly_mean_pm: [],
        site_annual_mean_pm: [],
        site_mean_pm: [],
        mean_pm_by_city: [],
        mean_pm_by_country: [],
        mean_pm_by_region: [],
        mean_pm_by_day_of_week: [],
        mean_pm_by_day_hour: [],
      });
      const rangeError = Object.assign(new Error('range too wide'), {
        response: { status: 400 },
      });
      const rateLimitError = Object.assign(new Error('rate limited'), {
        response: { status: 429 },
      });

      // The four initial windows are rejected once so their split halves queue
      // enough windows to walk the shared attempt counter up to the cap;
      // every window that is neither initial nor a designated success is rate
      // limited on every attempt.
      const windowKey = (window: { start_time: string; end_time: string }) =>
        `${window.start_time}|${window.end_time}`;
      const initialWindows = buildReportWindows(
        buildReportPayload({
          cohort_id: 'cohort-1',
          start_time: '2026-06-01',
          end_time: '2026-08-31',
        })
      );
      const halves = initialWindows.flatMap(
        window => splitReportWindow(window) ?? []
      );
      const initialKeys = new Set(initialWindows.map(windowKey));
      // First half of window 2 (Jun 28 → Jun 30) and first half of window 3
      // (Jul 25 → Jul 31): after them the counter sits on 11, so the next
      // window's first POST is the 12th and its 429 retry would be the 13th.
      const successKeys = new Set([windowKey(halves[2]), windowKey(halves[4])]);
      const successRanges: { start: string; end: string }[] = [];

      mockPost.mockImplementation(
        async (
          _path: string,
          body: { start_time: string; end_time: string }
        ) => {
          const key = windowKey(body);
          if (initialKeys.has(key)) throw rangeError;
          if (successKeys.has(key)) {
            successRanges.push({
              start: body.start_time.slice(0, 10),
              end: body.end_time.slice(0, 10),
            });
            return {
              data: { airquality: okReport(body.start_time, body.end_time) },
            };
          }
          throw rateLimitError;
        }
      );

      const promise = analyticsService.getReport({
        cohort_id: 'cohort-1',
        start_time: '2026-06-01',
        end_time: '2026-08-31',
      });
      await jest.runAllTimersAsync();
      const merged = (await promise) as {
        unavailablePeriods: { startTime: string; endTime: string }[];
      };

      // The hard ceiling: a window entered one short of the cap may still
      // send its first POST, but its 429 retry must not follow it.
      expect(mockPost.mock.calls.length).toBeLessThanOrEqual(REPORT_MAX_POSTS);

      // The window written off mid-queue (Aug 1 → Aug 20) and the window that
      // was still queued behind it (Aug 21 → Aug 31, drained by the cap) both
      // surface as unavailable, and together with the successes they tile all
      // 92 days exactly once — nothing dropped, nothing counted twice.
      expect(merged.unavailablePeriods).toHaveLength(5);
      const coverage = new Map<string, number>();
      const cover = (start: string, end: string) => {
        const dayMs = 24 * 60 * 60 * 1000;
        for (
          let ms = Date.parse(`${start}T00:00:00.000Z`);
          ms <= Date.parse(`${end}T00:00:00.000Z`);
          ms += dayMs
        ) {
          const day = new Date(ms).toISOString().slice(0, 10);
          coverage.set(day, (coverage.get(day) ?? 0) + 1);
        }
      };
      successRanges.forEach(range => cover(range.start, range.end));
      merged.unavailablePeriods.forEach(period =>
        cover(period.startTime.slice(0, 10), period.endTime.slice(0, 10))
      );
      expect(coverage.size).toBe(92);
      coverage.forEach((count, day) => {
        expect({ day, count }).toEqual({ day, count: 1 });
      });

      // Same walk with nothing succeeding: exhausting the budget with an
      // empty success list must still throw the report error rather than
      // return an empty report — and it must not overspend the ceiling doing
      // so either.
      mockPost.mockClear();
      mockPost.mockImplementation(
        async (
          _path: string,
          body: { start_time: string; end_time: string }
        ) => {
          if (initialKeys.has(windowKey(body))) throw rangeError;
          throw rateLimitError;
        }
      );

      const failing = analyticsService.getReport({
        cohort_id: 'cohort-1',
        start_time: '2026-06-01',
        end_time: '2026-08-31',
      });
      const assertion = expect(failing).rejects.toThrow();
      await jest.runAllTimersAsync();
      await assertion;
      expect(mockPost.mock.calls.length).toBeLessThanOrEqual(REPORT_MAX_POSTS);
    } finally {
      nowSpy.mockRestore();
      jest.useRealTimers();
    }
  });
});
