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
    getCohortsSummary: (
      cohortIds: string[],
      signal?: AbortSignal
    ) => Promise<
      Array<{
        _id: string;
        name: string;
        network?: string;
        visibility?: boolean;
        cohort_tags?: string[];
        groups?: string[];
        createdAt?: string;
      }>
    >;
  };
};

const summaryEntry = (id: string, name: string) => ({
  _id: id,
  name,
  network: 'airqo',
  visibility: true,
  cohort_tags: ['kampala'],
  groups: ['org-group-1'],
  createdAt: '2024-01-01T00:00:00.000Z',
});

describe('deviceService.getCohortsSummary', () => {
  beforeEach(() => {
    mockGet.mockReset();
  });

  it('requests the summary endpoint once with a CSV cohort_id param and include_devices=false via the JWT client', async () => {
    mockGet.mockResolvedValueOnce({
      data: {
        success: true,
        message: 'ok',
        cohorts: [
          summaryEntry('cohort-1', 'Kampala Central'),
          summaryEntry('cohort-2', 'Jinja Network'),
        ],
      },
    });

    await expect(
      deviceService.getCohortsSummary(['cohort-1', 'cohort-2'])
    ).resolves.toEqual([
      expect.objectContaining({ _id: 'cohort-1', name: 'Kampala Central' }),
      expect.objectContaining({ _id: 'cohort-2', name: 'Jinja Network' }),
    ]);

    expect(mockGet).toHaveBeenCalledTimes(1);
    expect(mockGet).toHaveBeenCalledWith('/devices/cohorts/summary', {
      params: {
        cohort_id: 'cohort-1,cohort-2',
        include_devices: false,
        limit: 2,
      },
      signal: undefined,
      suppressErrorLogging: true,
    });
    // The endpoint paginates (default 30, cap 80): limit must cover every
    // requested id or the tail of the set is silently dropped.
    expect(mockGet.mock.calls[0][1].params.limit).toBe(2);
  });

  it('unwraps the { success, message, data: [...] } envelope', async () => {
    mockGet.mockResolvedValueOnce({
      data: {
        success: true,
        message: 'ok',
        data: [summaryEntry('cohort-1', 'Kampala Central')],
      },
    });

    await expect(
      deviceService.getCohortsSummary(['cohort-1'])
    ).resolves.toHaveLength(1);
    expect(mockGet).toHaveBeenCalledTimes(1);
  });

  it('unwraps the { success, message, data: { cohorts: [...] } } envelope', async () => {
    mockGet.mockResolvedValueOnce({
      data: {
        success: true,
        message: 'ok',
        data: { cohorts: [summaryEntry('cohort-1', 'Kampala Central')] },
      },
    });

    const summaries = await deviceService.getCohortsSummary(['cohort-1']);

    expect(summaries).toHaveLength(1);
    expect(summaries[0]).toEqual(
      expect.objectContaining({ _id: 'cohort-1', name: 'Kampala Central' })
    );
  });

  it('normalizes and dedupes ids before building the CSV param', async () => {
    mockGet.mockResolvedValueOnce({
      data: {
        success: true,
        message: 'ok',
        cohorts: [summaryEntry('cohort-1', 'Kampala Central')],
      },
    });

    await deviceService.getCohortsSummary([
      ' cohort-1 ',
      'cohort-1',
      '',
      'cohort-2',
    ]);

    expect(mockGet).toHaveBeenCalledWith('/devices/cohorts/summary', {
      params: {
        cohort_id: 'cohort-1,cohort-2',
        include_devices: false,
        limit: 2,
      },
      signal: undefined,
      suppressErrorLogging: true,
    });
  });

  it('splits >80 ids into parallel <=80-id calls with per-chunk limits and merges by _id', async () => {
    const controller = new AbortController();
    const ids = Array.from(
      { length: 120 },
      (_, index) => `cohort-${index + 1}`
    );
    const chunkOne = ids.slice(0, 80);
    const chunkTwo = ids.slice(80);

    mockGet
      .mockResolvedValueOnce({
        data: {
          success: true,
          message: 'ok',
          cohorts: chunkOne.map(id => summaryEntry(id, `Name ${id}`)),
        },
      })
      .mockResolvedValueOnce({
        data: {
          success: true,
          message: 'ok',
          // The server may echo an id that chunk one already returned.
          cohorts: [
            summaryEntry('cohort-5', 'Name cohort-5'),
            ...chunkTwo.map(id => summaryEntry(id, `Name ${id}`)),
          ],
        },
      });

    const summaries = await deviceService.getCohortsSummary(
      ids,
      controller.signal
    );

    expect(mockGet).toHaveBeenCalledTimes(2);
    expect(mockGet.mock.calls[0][1].params).toEqual({
      cohort_id: chunkOne.join(','),
      include_devices: false,
      limit: 80,
    });
    expect(mockGet.mock.calls[1][1].params).toEqual({
      cohort_id: chunkTwo.join(','),
      include_devices: false,
      limit: 40,
    });
    // Both chunks share the caller's signal.
    expect(mockGet.mock.calls[0][1].signal).toBe(controller.signal);
    expect(mockGet.mock.calls[1][1].signal).toBe(controller.signal);

    // Merged by _id: 121 returned entries collapse to 120 unique summaries.
    expect(summaries).toHaveLength(120);
    expect(new Set(summaries.map(summary => summary._id)).size).toBe(120);
    expect(
      summaries.filter(summary => summary._id === 'cohort-5')
    ).toHaveLength(1);
  });

  it('resolves with the successful chunk when one of two chunks fails', async () => {
    const controller = new AbortController();
    const ids = Array.from(
      { length: 120 },
      (_, index) => `cohort-${index + 1}`
    );
    const chunkTwo = ids.slice(80);

    // Keyed on the requested ids, so the assertions do not depend on which
    // chunk fires first once chunks run in parallel.
    mockGet.mockImplementation(
      (
        _url: string,
        config: { params?: { cohort_id?: string } } | undefined
      ) => {
        const requested = config?.params?.cohort_id ?? '';
        return requested.startsWith('cohort-81,')
          ? Promise.resolve({
              data: {
                success: true,
                message: 'ok',
                cohorts: chunkTwo.map(id => summaryEntry(id, `Name ${id}`)),
              },
            })
          : Promise.resolve({
              data: { success: false, message: 'chunk one exploded' },
            });
      }
    );

    const summaries = await deviceService.getCohortsSummary(
      ids,
      controller.signal
    );

    expect(mockGet).toHaveBeenCalledTimes(2);
    // Fulfilled chunk's summaries survive; the failed chunk's ids simply have
    // no summaries (the selector falls back to `Cohort N`).
    expect(summaries).toHaveLength(chunkTwo.length);
    expect(new Set(summaries.map(summary => summary._id))).toEqual(
      new Set(chunkTwo)
    );
    expect(
      mockGet.mock.calls.every(call => call[1].signal === controller.signal)
    ).toBe(true);
  });

  it('rejects with the first failure when every chunk fails', async () => {
    const ids = Array.from(
      { length: 120 },
      (_, index) => `cohort-${index + 1}`
    );

    mockGet.mockImplementation(
      (
        _url: string,
        config: { params?: { cohort_id?: string } } | undefined
      ) => {
        const requested = config?.params?.cohort_id ?? '';
        return Promise.reject(
          new Error(
            requested.startsWith('cohort-81,')
              ? 'chunk two exploded'
              : 'chunk one exploded'
          )
        );
      }
    );

    await expect(deviceService.getCohortsSummary(ids)).rejects.toThrow(
      'chunk one exploded'
    );
    expect(mockGet).toHaveBeenCalledTimes(2);
  });

  it('skips the network entirely when no ids remain after normalization', async () => {
    await expect(deviceService.getCohortsSummary(['', '   '])).resolves.toEqual(
      []
    );
    expect(mockGet).not.toHaveBeenCalled();
  });

  it('trims names and drops entries without a usable _id', async () => {
    mockGet.mockResolvedValueOnce({
      data: {
        success: true,
        message: 'ok',
        cohorts: [
          summaryEntry('cohort-1', '  Kampala Central  '),
          { name: 'missing id' },
          summaryEntry('   ', 'blank id'),
          'not-an-object',
        ],
      },
    });

    await expect(
      deviceService.getCohortsSummary(['cohort-1'])
    ).resolves.toEqual([
      expect.objectContaining({ _id: 'cohort-1', name: 'Kampala Central' }),
    ]);
  });

  it('throws when the backend reports success:false', async () => {
    mockGet.mockResolvedValueOnce({
      data: { success: false, message: 'cohort summary exploded' },
    });

    await expect(deviceService.getCohortsSummary(['cohort-1'])).rejects.toThrow(
      'cohort summary exploded'
    );
  });

  it('passes the AbortSignal through and propagates abort errors untouched', async () => {
    const controller = new AbortController();
    const abortError = new Error('canceled');
    abortError.name = 'AbortError';
    mockGet.mockRejectedValueOnce(abortError);

    await expect(
      deviceService.getCohortsSummary(['cohort-1'], controller.signal)
    ).rejects.toBe(abortError);

    expect(mockGet).toHaveBeenCalledWith(
      '/devices/cohorts/summary',
      expect.objectContaining({ signal: controller.signal })
    );
    // Aborted requests are never retried at this layer.
    expect(mockGet).toHaveBeenCalledTimes(1);
  });
});
