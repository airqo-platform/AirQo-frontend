export {};

jest.mock('../apiClient', () => {
  const activityMockGet = jest.fn();
  const createStubClient = () => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
    setAuthToken: jest.fn(),
    removeAuthToken: jest.fn(),
  });
  return {
    createAuthenticatedClient: () => ({
      get: activityMockGet,
      post: jest.fn(),
      put: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
      setAuthToken: jest.fn(),
      removeAuthToken: jest.fn(),
    }),
    createServerClient: createStubClient,
    createOpenClient: createStubClient,
    __activityMockGet: activityMockGet,
  };
});

jest.mock('../sessionAuthToken', () => ({
  syncClientSessionToken: jest.fn().mockResolvedValue(undefined),
}));

const { __activityMockGet: activityMockGet } = jest.requireMock(
  '../apiClient'
) as { __activityMockGet: jest.Mock };

interface ActivityLogApi {
  getGroupActivityLog: (
    groupId: string,
    params?: {
      limit?: number;
      skip?: number;
      user_id?: string;
      start_date?: string;
      end_date?: string;
    },
    signal?: AbortSignal
  ) => Promise<unknown>;
}

const { userService } = jest.requireActual('../userService') as {
  userService: ActivityLogApi;
};

const urlsCalled = (mock: jest.Mock): string[] =>
  mock.mock.calls.map(call => call[0] as string);

describe('UserService group activity log', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    activityMockGet.mockReset();
  });

  it('GETs the activity-log endpoint with the exact query, encoded group id and AbortSignal', async () => {
    activityMockGet.mockResolvedValueOnce({
      data: {
        success: true,
        message: 'ok',
        data: { activities: [], group_name: 'Org', filters_applied: {} },
      },
    });

    const controller = new AbortController();
    await userService.getGroupActivityLog(
      'group/1',
      {
        limit: 20,
        skip: 40,
        user_id: 'u1',
        start_date: '2026-01-01',
        end_date: '2026-02-01',
      },
      controller.signal
    );

    const calledUrl = activityMockGet.mock.calls[0][0] as string;
    // Relative path: resolves against the authenticated client's baseURL,
    // never a hard-coded /api/v2 prefix.
    expect(calledUrl).toBe(
      '/users/groups/group%2F1/activity-log?limit=20&skip=40&user_id=u1&start_date=2026-01-01&end_date=2026-02-01'
    );
    expect(calledUrl).not.toContain('/api/');
    expect(activityMockGet).toHaveBeenCalledWith(
      '/users/groups/group%2F1/activity-log?limit=20&skip=40&user_id=u1&start_date=2026-01-01&end_date=2026-02-01',
      { signal: controller.signal }
    );
  });

  it('defaults to limit=20&skip=0 when params are omitted', async () => {
    activityMockGet.mockResolvedValueOnce({
      data: {
        success: true,
        message: 'ok',
        data: { activities: [], group_name: 'Org', filters_applied: {} },
      },
    });

    await userService.getGroupActivityLog('g1');

    expect(urlsCalled(activityMockGet)).toEqual([
      '/users/groups/g1/activity-log?limit=20&skip=0',
    ]);
  });

  it('omits the AbortSignal config when no signal is passed', async () => {
    activityMockGet.mockResolvedValueOnce({
      data: {
        success: true,
        message: 'ok',
        data: { activities: [], group_name: 'Org', filters_applied: {} },
      },
    });

    await userService.getGroupActivityLog('g1');

    expect(activityMockGet).toHaveBeenCalledWith(
      '/users/groups/g1/activity-log?limit=20&skip=0',
      undefined
    );
  });

  it('surfaces backend success:false messages as thrown Errors', async () => {
    activityMockGet.mockResolvedValueOnce({
      data: { success: false, message: 'Activity log unavailable' },
    });

    await expect(userService.getGroupActivityLog('g1')).rejects.toThrow(
      'Activity log unavailable'
    );
  });
});
