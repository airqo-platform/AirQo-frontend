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

  it('detects the current-schema pydantic rejection of a startDate request (mirror signature)', () => {
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
    expect(chartContractToRetryForErrorBody(pydanticBody)).toBe(
      'startDateTime'
    );
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

  it('persists the winning contract to localStorage so a hard reload skips the 400 probe', async () => {
    mockPost
      .mockRejectedValueOnce(axiosLikeError(400, LEGACY_REJECTION_BODY))
      .mockResolvedValueOnce({ data: chartPayload });

    await analyticsService.getChartData({
      startDateTime: '2025-08-15',
      endDateTime: '2025-08-21',
    });

    // The legacy contract is now persisted. A simulated reload — fresh
    // module instance, same localStorage — must use it on the FIRST
    // request, with no 400 probe.
    expect(
      window.localStorage.getItem('nexus:analytics:chart-date-contract')
    ).toBe('startDate');

    // isolateModules runs the callback in a clean module registry: the
    // analyticsService module re-initializes and re-reads localStorage on
    // import. We return the in-flight promise so Jest awaits it before
    // the test ends.
    await new Promise<void>((resolve, reject) => {
      jest.isolateModules(() => {
        // The shared mock instance carries call history from outside the
        // sandbox; clear it so the assertions below are scoped to the
        // reloaded-module path.
        mockPost.mockClear();
        mockPost.mockResolvedValueOnce({ data: chartPayload });

        const { analyticsService: reloadedService } =
          // jest.isolateModules() requires a runtime require() — the only
          // way to re-evaluate the module body inside the sandbox.
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          require('../analyticsService') as {
            analyticsService: {
              getChartData: (req: {
                startDateTime: string;
                endDateTime: string;
              }) => Promise<unknown>;
            };
          };

        reloadedService
          .getChartData({
            startDateTime: '2025-08-15',
            endDateTime: '2025-08-21',
          })
          .then(() => {
            try {
              // One call only — no probe, no 400.
              expect(mockPost).toHaveBeenCalledTimes(1);
              expect(mockPost.mock.calls[0][1]).toEqual(
                expect.objectContaining({
                  startDate: '2025-08-15',
                  endDate: '2025-08-21',
                })
              );
              expect(mockPost.mock.calls[0][1]).not.toHaveProperty(
                'startDateTime'
              );
              expect(mockPost.mock.calls[0][1]).not.toHaveProperty(
                'endDateTime'
              );
              resolve();
            } catch (err) {
              reject(err);
            }
          })
          .catch(reject);
      });
    });
  });

  it('uses the persisted primary contract on reload — no probe, no 400', async () => {
    // Simulate a user whose very first request succeeded with the current
    // (DateTime) schema; that contract was persisted in a previous session.
    window.localStorage.setItem(
      'nexus:analytics:chart-date-contract',
      'startDateTime'
    );

    await new Promise<void>((resolve, reject) => {
      jest.isolateModules(() => {
        mockPost.mockClear();
        mockPost.mockResolvedValueOnce({ data: chartPayload });

        const { analyticsService: reloadedService } =
          // jest.isolateModules() requires a runtime require() — the only
          // way to re-evaluate the module body inside the sandbox.
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          require('../analyticsService') as {
            analyticsService: {
              getChartData: (req: {
                startDateTime: string;
                endDateTime: string;
              }) => Promise<unknown>;
            };
          };

        reloadedService
          .getChartData({
            startDateTime: '2025-08-15',
            endDateTime: '2025-08-21',
          })
          .then(() => {
            try {
              expect(mockPost).toHaveBeenCalledTimes(1);
              expect(mockPost.mock.calls[0][1]).toEqual(
                expect.objectContaining({
                  startDateTime: '2025-08-15',
                  endDateTime: '2025-08-21',
                })
              );
              resolve();
            } catch (err) {
              reject(err);
            }
          })
          .catch(reject);
      });
    });
  });

  it('treats a corrupt localStorage value as a fresh session (re-probes)', async () => {
    // Defensive: if a previous build or migration wrote something we don't
    // recognize, fall back to the in-memory probe path instead of crashing
    // or sending the wrong contract silently.
    window.localStorage.setItem(
      'nexus:analytics:chart-date-contract',
      'not-a-real-contract'
    );

    await new Promise<void>((resolve, reject) => {
      jest.isolateModules(() => {
        mockPost.mockClear();
        mockPost
          .mockRejectedValueOnce(axiosLikeError(400, LEGACY_REJECTION_BODY))
          .mockResolvedValueOnce({ data: chartPayload });

        const { analyticsService: reloadedService } =
          // jest.isolateModules() requires a runtime require() — the only
          // way to re-evaluate the module body inside the sandbox.
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          require('../analyticsService') as {
            analyticsService: {
              getChartData: (req: {
                startDateTime: string;
                endDateTime: string;
              }) => Promise<unknown>;
            };
          };

        reloadedService
          .getChartData({
            startDateTime: '2025-08-15',
            endDateTime: '2025-08-21',
          })
          .then(() => {
            try {
              // Probe + corrected retry, same as a brand-new session.
              expect(mockPost).toHaveBeenCalledTimes(2);
              expect(mockPost.mock.calls[0][1]).toEqual(
                expect.objectContaining({ startDateTime: '2025-08-15' })
              );
              expect(mockPost.mock.calls[1][1]).toEqual(
                expect.objectContaining({ startDate: '2025-08-15' })
              );
              resolve();
            } catch (err) {
              reject(err);
            }
          })
          .catch(reject);
      });
    });
  });

  it('refuses to fire when startDateTime is empty and never hits the network', async () => {
    await expect(
      analyticsService.getChartData({
        startDateTime: '',
        endDateTime: '2025-08-21',
      })
    ).rejects.toThrow(/missing a start date/i);
    expect(mockPost).not.toHaveBeenCalled();
  });

  it('refuses to fire when endDateTime is empty and never hits the network', async () => {
    await expect(
      analyticsService.getChartData({
        startDateTime: '2025-08-15',
        endDateTime: '',
      })
    ).rejects.toThrow(/missing an end date/i);
    expect(mockPost).not.toHaveBeenCalled();
  });

  it('refuses to fire when both dates are missing (undefined) and never hits the network', async () => {
    await expect(
      analyticsService.getChartData({
        // Cast required because the type declares the keys as required, but
        // a corrupted caller can still bypass the type system at runtime.
        startDateTime: undefined as unknown as string,
        endDateTime: undefined as unknown as string,
      })
    ).rejects.toThrow(/missing start and end dates/i);
    expect(mockPost).not.toHaveBeenCalled();
  });
});

describe('AnalyticsService.getChartData single-flight negotiation', () => {
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

  // What a startDate-contract request gets from a CURRENT-schema backend.
  const CURRENT_SCHEMA_REJECTION_BODY = {
    errors: [
      {
        type: 'missing',
        loc: ['body', 'startDateTime'],
        msg: 'Field required',
      },
      {
        type: 'missing',
        loc: ['body', 'endDateTime'],
        msg: 'Field required',
      },
    ],
  };

  /** Drains pending microtasks so in-flight promise chains settle. */
  const flushAsync = () => new Promise<void>(resolve => setTimeout(resolve, 0));

  it('shares ONE probe pair across concurrent requests on a fresh session — no caller surfaces the 400', async () => {
    mockPost
      .mockRejectedValueOnce(axiosLikeError(400, LEGACY_REJECTION_BODY))
      .mockResolvedValue({ data: chartPayload });

    const request = {
      startDateTime: '2025-08-15',
      endDateTime: '2025-08-21',
    };

    const results = await Promise.all([
      analyticsService.getChartData(request),
      analyticsService.getChartData(request),
      analyticsService.getChartData(request),
    ]);

    expect(results).toEqual([chartPayload, chartPayload, chartPayload]);

    // Exactly ONE probe pair: call 0 probed the primary keys and absorbed
    // the legacy 400; call 1 was that same caller's corrected retry. The
    // two other callers joined the shared negotiation and each sent exactly
    // once with the settled contract — they never saw a 400.
    expect(mockPost).toHaveBeenCalledTimes(4);
    const bodies = mockPost.mock.calls.map(call => call[1]);
    expect(bodies[0]).toEqual(
      expect.objectContaining({ startDateTime: '2025-08-15' })
    );
    for (let index = 1; index < bodies.length; index++) {
      expect(bodies[index]).toEqual(
        expect.objectContaining({ startDate: '2025-08-15' })
      );
      expect(bodies[index]).not.toHaveProperty('startDateTime');
    }
    expect(
      window.localStorage.getItem('nexus:analytics:chart-date-contract')
    ).toBe('startDate');
  });

  it('re-probes ONCE when the persisted startDate contract is rejected by a current-schema backend', async () => {
    // Settle the session on the legacy contract first, as a previous visit
    // would have persisted.
    mockPost
      .mockRejectedValueOnce(axiosLikeError(400, LEGACY_REJECTION_BODY))
      .mockResolvedValueOnce({ data: chartPayload });
    await analyticsService.getChartData({
      startDateTime: '2025-08-15',
      endDateTime: '2025-08-21',
    });
    expect(
      window.localStorage.getItem('nexus:analytics:chart-date-contract')
    ).toBe('startDate');

    // The backend flapped to the CURRENT schema: the cached startDate keys
    // now earn the pydantic mirror rejection; the startDateTime retry wins.
    mockPost
      .mockRejectedValueOnce(axiosLikeError(400, CURRENT_SCHEMA_REJECTION_BODY))
      .mockResolvedValueOnce({ data: chartPayload });

    await expect(
      analyticsService.getChartData({
        startDateTime: '2025-08-15',
        endDateTime: '2025-08-21',
      })
    ).resolves.toEqual(chartPayload);

    // Attempt 3 used the stale startDate keys and was rejected; attempt 4
    // retried with startDateTime and succeeded — bounded at two attempts.
    expect(mockPost).toHaveBeenCalledTimes(4);
    expect(mockPost.mock.calls[2][1]).toEqual(
      expect.objectContaining({ startDate: '2025-08-15' })
    );
    expect(mockPost.mock.calls[3][1]).toEqual(
      expect.objectContaining({
        startDateTime: '2025-08-15',
        endDateTime: '2025-08-21',
      })
    );
    expect(mockPost.mock.calls[3][1]).not.toHaveProperty('startDate');
    // The recovered contract replaces the stale persisted one.
    expect(
      window.localStorage.getItem('nexus:analytics:chart-date-contract')
    ).toBe('startDateTime');
  });

  it('runs ONE shared re-probe when concurrent requests hit a stale contract', async () => {
    // Settle on the legacy contract first.
    mockPost
      .mockRejectedValueOnce(axiosLikeError(400, LEGACY_REJECTION_BODY))
      .mockResolvedValueOnce({ data: chartPayload });
    await analyticsService.getChartData({
      startDateTime: '2025-08-15',
      endDateTime: '2025-08-21',
    });

    // All three cached-contract attempts are rejected by the current schema.
    // The shared re-probe hangs on a deferred until we release it, so we can
    // observe that NO other caller fires its own probe while it is in flight.
    let releaseReProbe!: (value: { data: typeof chartPayload }) => void;
    const reProbeResponse = new Promise<{ data: typeof chartPayload }>(
      resolve => {
        releaseReProbe = resolve;
      }
    );
    mockPost
      .mockRejectedValueOnce(axiosLikeError(400, CURRENT_SCHEMA_REJECTION_BODY))
      .mockRejectedValueOnce(axiosLikeError(400, CURRENT_SCHEMA_REJECTION_BODY))
      .mockRejectedValueOnce(axiosLikeError(400, CURRENT_SCHEMA_REJECTION_BODY))
      .mockReturnValueOnce(reProbeResponse)
      .mockResolvedValue({ data: chartPayload });

    const request = {
      startDateTime: '2025-08-15',
      endDateTime: '2025-08-21',
    };
    const allSettled = Promise.all([
      analyticsService.getChartData(request),
      analyticsService.getChartData(request),
      analyticsService.getChartData(request),
    ]);

    await flushAsync();

    // Calls 0-1 settled the session; calls 2-4 are the three stale attempts;
    // call 5 is the SINGLE shared re-probe. The other two failures joined it
    // instead of probing — nothing else fired while it hangs.
    expect(mockPost).toHaveBeenCalledTimes(6);

    releaseReProbe({ data: chartPayload });
    await expect(allSettled).resolves.toEqual([
      chartPayload,
      chartPayload,
      chartPayload,
    ]);

    // After release only the two joiners sent their own settled requests.
    expect(mockPost).toHaveBeenCalledTimes(8);
    // Calls 0-1 are the setup pair (probe + corrected retry); scope the
    // key-family tally to the stale-contract phase: 3 stale startDate
    // attempts + 1 shared re-probe + 2 joiner sends, all startDateTime.
    const phaseBodies = mockPost.mock.calls.slice(2).map(call => call[1]);
    expect(phaseBodies.filter(body => 'startDate' in body)).toHaveLength(3);
    expect(phaseBodies.filter(body => 'startDateTime' in body)).toHaveLength(3);
    expect(
      window.localStorage.getItem('nexus:analytics:chart-date-contract')
    ).toBe('startDateTime');
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
