jest.mock('../apiClient', () => {
  const discoverMockGet = jest.fn();
  const discoverMockPost = jest.fn();
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
      get: discoverMockGet,
      post: discoverMockPost,
      put: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
      setAuthToken: jest.fn(),
      removeAuthToken: jest.fn(),
    }),
    createServerClient: createStubClient,
    createOpenClient: createStubClient,
    __discoverMockGet: discoverMockGet,
    __discoverMockPost: discoverMockPost,
  };
});

jest.mock('../sessionAuthToken', () => ({
  syncClientSessionToken: jest.fn().mockResolvedValue(undefined),
}));

const {
  __discoverMockGet: discoverMockGet,
  __discoverMockPost: discoverMockPost,
} = jest.requireMock('../apiClient') as {
  __discoverMockGet: jest.Mock;
  __discoverMockPost: jest.Mock;
};

const { userService } = jest.requireActual('../userService') as {
  userService: {
    discoverGroups: (signal?: AbortSignal) => Promise<unknown>;
    requestGroupAccess: (groupId: string) => Promise<unknown>;
  };
};

describe('UserService discover/request access', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('discoverGroups', () => {
    it('requests the relative v2 discover path (no hard-coded API version)', async () => {
      discoverMockGet.mockResolvedValueOnce({
        data: {
          success: true,
          groups: [{ _id: 'd-1', grp_title: 'Org', organization_slug: 'org' }],
        },
      });

      await userService.discoverGroups();

      const calledUrl = discoverMockGet.mock.calls[0][0];
      // Relative path: it resolves against the authenticated client's
      // /api/v2 baseURL, so no version prefix may be baked into the string.
      expect(calledUrl).toBe('/users/groups/discover');
      expect(calledUrl).not.toContain('/api/');
    });

    it('forwards an AbortSignal to the discover request', async () => {
      discoverMockGet.mockResolvedValueOnce({
        data: { success: true, groups: [] },
      });

      const controller = new AbortController();
      await userService.discoverGroups(controller.signal);

      expect(discoverMockGet).toHaveBeenCalledWith('/users/groups/discover', {
        signal: controller.signal,
      });
    });

    it('surfaces backend success:false messages as thrown Errors', async () => {
      discoverMockGet.mockResolvedValueOnce({
        data: { success: false, message: 'Discovery disabled' },
      });

      await expect(userService.discoverGroups()).rejects.toThrow(
        'Discovery disabled'
      );
    });
  });

  describe('requestGroupAccess', () => {
    it('POSTs the v2 request-access endpoint for the given group', async () => {
      discoverMockPost.mockResolvedValueOnce({
        data: { success: true, message: 'Request received' },
      });

      await userService.requestGroupAccess('g1');

      expect(discoverMockPost).toHaveBeenCalledWith(
        '/users/requests/groups/g1'
      );
    });

    it('surfaces backend success:false messages as thrown Errors', async () => {
      discoverMockPost.mockResolvedValueOnce({
        data: { success: false, message: 'Already a member' },
      });

      await expect(userService.requestGroupAccess('g1')).rejects.toThrow(
        'Already a member'
      );
    });

    it('encodes reserved characters in the group path segment', async () => {
      discoverMockPost.mockResolvedValueOnce({
        data: { success: true, message: 'Request received' },
      });

      await userService.requestGroupAccess('group/1?source=selector#access');

      expect(discoverMockPost).toHaveBeenCalledWith(
        '/users/requests/groups/group%2F1%3Fsource%3Dselector%23access'
      );
    });
  });
});
