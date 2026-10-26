export {};

jest.mock('../apiClient', () => {
  const orgMockGet = jest.fn();
  const orgMockDelete = jest.fn();
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
      get: orgMockGet,
      post: jest.fn(),
      put: jest.fn(),
      patch: jest.fn(),
      delete: orgMockDelete,
      setAuthToken: jest.fn(),
      removeAuthToken: jest.fn(),
    }),
    createServerClient: createStubClient,
    createOpenClient: createStubClient,
    __orgMockGet: orgMockGet,
    __orgMockDelete: orgMockDelete,
  };
});

jest.mock('../sessionAuthToken', () => ({
  syncClientSessionToken: jest.fn().mockResolvedValue(undefined),
}));

const { __orgMockGet: orgMockGet, __orgMockDelete: orgMockDelete } =
  jest.requireMock('../apiClient') as {
    __orgMockGet: jest.Mock;
    __orgMockDelete: jest.Mock;
  };

interface SummaryGroup {
  _id: string;
}

interface OrganizationsApi {
  getGroupsSummary: (
    params?: { limit?: number; skip?: number },
    signal?: AbortSignal
  ) => Promise<{ success: boolean; message: string; groups: SummaryGroup[] }>;
  getAllGroupsSummary: (signal?: AbortSignal) => Promise<SummaryGroup[]>;
  getGroupAssignedUsers: (
    groupId: string,
    signal?: AbortSignal
  ) => Promise<unknown>;
  unassignManyUsersFromGroup: (
    groupId: string,
    request: { user_ids: string[] }
  ) => Promise<unknown>;
  deleteGroup: (groupId: string) => Promise<unknown>;
}

const { userService } = jest.requireActual('../userService') as {
  userService: OrganizationsApi;
};

const makeGroups = (count: number, prefix: string): SummaryGroup[] =>
  Array.from({ length: count }, (_, index) => ({ _id: `${prefix}-${index}` }));

const successPage = (groups: SummaryGroup[]) => ({
  data: { success: true, message: 'ok', groups },
});

const urlsCalled = (mock: jest.Mock): string[] =>
  mock.mock.calls.map(call => call[0] as string);

describe('UserService organization management', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Drop any queued/persistent implementations too, so a stray mock from
    // one test cannot leak into the next.
    orgMockGet.mockReset();
    orgMockDelete.mockReset();
  });

  describe('getGroupsSummary', () => {
    it('GETs the summary endpoint with the exact limit/skip query and forwards an AbortSignal', async () => {
      orgMockGet.mockResolvedValueOnce(successPage([]));

      const controller = new AbortController();
      await userService.getGroupsSummary(
        { limit: 25, skip: 50 },
        controller.signal
      );

      const calledUrl = orgMockGet.mock.calls[0][0];
      // Relative path: resolves against the authenticated client's baseURL,
      // never a hard-coded /api/v2 prefix.
      expect(calledUrl).toBe('/users/groups/summary?limit=25&skip=50');
      expect(calledUrl).not.toContain('/api/');
      expect(orgMockGet).toHaveBeenCalledWith(
        '/users/groups/summary?limit=25&skip=50',
        { signal: controller.signal }
      );
    });

    it('defaults to limit=100&skip=0 and sanitises invalid paging values', async () => {
      orgMockGet
        .mockResolvedValueOnce(successPage([]))
        .mockResolvedValueOnce(successPage([]))
        .mockResolvedValueOnce(successPage([]));

      await userService.getGroupsSummary();
      await userService.getGroupsSummary({ limit: -10, skip: Number.NaN });
      await userService.getGroupsSummary({ limit: 25.9, skip: 50.2 });

      expect(urlsCalled(orgMockGet)).toEqual([
        '/users/groups/summary?limit=100&skip=0',
        '/users/groups/summary?limit=100&skip=0',
        '/users/groups/summary?limit=25&skip=50',
      ]);
    });

    it('surfaces backend success:false messages as thrown Errors', async () => {
      orgMockGet.mockResolvedValueOnce({
        data: { success: false, message: 'Summary unavailable' },
      });

      await expect(userService.getGroupsSummary()).rejects.toThrow(
        'Summary unavailable'
      );
    });
  });

  describe('getAllGroupsSummary', () => {
    it('pages with limit 100 / skip 0, 100, 200 and stops on the first short page', async () => {
      orgMockGet
        .mockResolvedValueOnce(successPage(makeGroups(100, 'p0')))
        .mockResolvedValueOnce(successPage(makeGroups(100, 'p1')))
        .mockResolvedValueOnce(successPage(makeGroups(40, 'p2')));

      const groups = await userService.getAllGroupsSummary();

      expect(urlsCalled(orgMockGet)).toEqual([
        '/users/groups/summary?limit=100&skip=0',
        '/users/groups/summary?limit=100&skip=100',
        '/users/groups/summary?limit=100&skip=200',
      ]);
      expect(orgMockGet).toHaveBeenCalledTimes(3);
      // Pages are concatenated in order; unique ids are preserved in
      // first-seen order.
      expect(groups).toHaveLength(240);
      expect(groups[0]._id).toBe('p0-0');
      expect(groups[99]._id).toBe('p0-99');
      expect(groups[100]._id).toBe('p1-0');
      expect(groups[239]._id).toBe('p2-39');
    });

    it('forwards the AbortSignal to every page request', async () => {
      orgMockGet
        .mockResolvedValueOnce(successPage(makeGroups(100, 'a')))
        .mockResolvedValueOnce(successPage(makeGroups(1, 'b')));

      const controller = new AbortController();
      await userService.getAllGroupsSummary(controller.signal);

      expect(orgMockGet).toHaveBeenNthCalledWith(
        1,
        '/users/groups/summary?limit=100&skip=0',
        { signal: controller.signal }
      );
      expect(orgMockGet).toHaveBeenNthCalledWith(
        2,
        '/users/groups/summary?limit=100&skip=100',
        { signal: controller.signal }
      );
    });

    it('keeps walking past 20 pages while every full page adds new groups', async () => {
      orgMockGet.mockImplementation(async (url: string) => {
        const skip = Number(
          new URL(url, 'http://localhost').searchParams.get('skip')
        );
        const pageIndex = skip / 100;
        const count = pageIndex < 21 ? 100 : 37;
        return successPage(makeGroups(count, `p${pageIndex}`));
      });

      const groups = await userService.getAllGroupsSummary();

      // 21 full pages (2100 groups) plus a short 37-group final page —
      // well beyond the old 20-page (2000 group) truncation point.
      expect(orgMockGet).toHaveBeenCalledTimes(22);
      expect(groups).toHaveLength(21 * 100 + 37);
      expect(groups[2099]._id).toBe('p20-99');
      expect(groups[2100]._id).toBe('p21-0');
      expect(groups[2136]._id).toBe('p21-36');
    });

    it('stops when a full page repeats every id (backend ignores skip)', async () => {
      // Every request returns the same first page regardless of `skip`.
      orgMockGet.mockResolvedValue(successPage(makeGroups(100, 'p0')));

      const groups = await userService.getAllGroupsSummary();

      // Page 0 is new; page 1 is a full page of already-seen ids → stop.
      expect(orgMockGet).toHaveBeenCalledTimes(2);
      expect(groups).toHaveLength(100);
      expect(groups[0]._id).toBe('p0-0');
      expect(groups[99]._id).toBe('p0-99');
    });

    it('surfaces backend success:false messages as thrown Errors', async () => {
      orgMockGet.mockResolvedValueOnce({
        data: { success: false, message: 'Summary disabled' },
      });

      await expect(userService.getAllGroupsSummary()).rejects.toThrow(
        'Summary disabled'
      );
    });
  });

  describe('getGroupAssignedUsers', () => {
    it('GETs the assigned-users endpoint with the group id encoded and forwards an AbortSignal', async () => {
      orgMockGet.mockResolvedValueOnce({
        data: { success: true, message: 'ok', data: [] },
      });

      const controller = new AbortController();
      await userService.getGroupAssignedUsers('group/1', controller.signal);

      expect(orgMockGet).toHaveBeenCalledWith(
        '/users/groups/group%2F1/assigned-users',
        { signal: controller.signal }
      );
      expect(orgMockGet.mock.calls[0][0]).not.toContain('/api/');
    });

    it('surfaces backend success:false messages as thrown Errors', async () => {
      orgMockGet.mockResolvedValueOnce({
        data: { success: false, message: 'Group has no assigned users' },
      });

      await expect(userService.getGroupAssignedUsers('g1')).rejects.toThrow(
        'Group has no assigned users'
      );
    });
  });

  describe('unassignManyUsersFromGroup', () => {
    it('DELETEs the unassign-many-users endpoint with the user_ids body', async () => {
      orgMockDelete.mockResolvedValueOnce({
        data: { success: true, message: 'Users unassigned' },
      });

      await userService.unassignManyUsersFromGroup('g1', {
        user_ids: ['u1', 'u2'],
      });

      expect(orgMockDelete).toHaveBeenCalledWith(
        '/users/groups/g1/unassign-many-users',
        { data: { user_ids: ['u1', 'u2'] } }
      );
    });

    it('surfaces backend success:false messages as thrown Errors', async () => {
      orgMockDelete.mockResolvedValueOnce({
        data: { success: false, message: 'Group g1 not found' },
      });

      await expect(
        userService.unassignManyUsersFromGroup('g1', { user_ids: ['u1'] })
      ).rejects.toThrow('Group g1 not found');
    });
  });

  describe('deleteGroup', () => {
    it('DELETEs the group endpoint', async () => {
      orgMockDelete.mockResolvedValueOnce({
        data: { success: true, message: 'Group deleted' },
      });

      await userService.deleteGroup('g1');

      expect(orgMockDelete).toHaveBeenCalledWith('/users/groups/g1');
      expect(orgMockDelete.mock.calls[0][0]).not.toContain('/api/');
    });

    it('surfaces backend success:false messages as thrown Errors', async () => {
      orgMockDelete.mockResolvedValueOnce({
        data: {
          success: false,
          message: 'Group deletion temporarily disabled',
        },
      });

      await expect(userService.deleteGroup('g1')).rejects.toThrow(
        'Group deletion temporarily disabled'
      );
    });

    it('lets axios errors propagate so the 501 message reaches the UI', async () => {
      const axiosError = Object.assign(new Error('Request failed'), {
        response: {
          status: 501,
          data: { message: 'Group deletion temporarily disabled' },
        },
      });
      orgMockDelete.mockRejectedValueOnce(axiosError);

      await expect(userService.deleteGroup('g1')).rejects.toBe(axiosError);
    });
  });
});
