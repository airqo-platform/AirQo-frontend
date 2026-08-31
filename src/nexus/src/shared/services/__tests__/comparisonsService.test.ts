export {};

jest.mock('../apiClient', () => {
  const mockGet = jest.fn();
  const mockPost = jest.fn();
  const mockPatch = jest.fn();
  const mockDelete = jest.fn();
  const mockSetAuthToken = jest.fn();
  const mockRemoveAuthToken = jest.fn();
  return {
    createAuthenticatedClient: () => ({
      get: mockGet,
      post: mockPost,
      patch: mockPatch,
      delete: mockDelete,
      setAuthToken: mockSetAuthToken,
      removeAuthToken: mockRemoveAuthToken,
    }),
    __mockGet: mockGet,
    __mockPost: mockPost,
    __mockPatch: mockPatch,
    __mockDelete: mockDelete,
  };
});

jest.mock('../sessionAuthToken', () => ({
  syncClientSessionToken: jest.fn(),
}));

const {
  __mockGet: mockGet,
  __mockPost: mockPost,
  __mockPatch: mockPatch,
  __mockDelete: mockDelete,
} = jest.requireMock('../apiClient') as {
  __mockGet: jest.Mock;
  __mockPost: jest.Mock;
  __mockPatch: jest.Mock;
  __mockDelete: jest.Mock;
};

const { comparisonsService } = jest.requireActual('../comparisonsService') as {
  comparisonsService: {
    list: (params: unknown) => Promise<{ comparisons: unknown[] }>;
    get: (id: string) => Promise<{ comparison: unknown }>;
    create: (payload: unknown) => Promise<{ comparison: unknown }>;
    update: (id: string, payload: unknown) => Promise<{ comparison: unknown }>;
    remove: (id: string) => Promise<{ success: boolean }>;
  };
};

const makeComparison = (overrides: Record<string, unknown> = {}) => ({
  id: 'comp-1',
  user_id: 'user-1',
  group_id: 'group-1',
  name: 'My comparison',
  site_ids: ['site-1', 'site-2'],
  sites: [{ id: 'site-1', name: 'Kampala Site', location: 'Kampala Site' }],
  created_at: '2026-08-01T00:00:00Z',
  updated_at: '2026-08-22T00:00:00Z',
  ...overrides,
});

describe('ComparisonsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('sends group_id + params and returns the comparisons array', async () => {
      const comparisons = [makeComparison()];
      mockGet.mockResolvedValueOnce({
        data: {
          success: true,
          message: 'ok',
          comparisons,
          meta: {
            total: 1,
            total_pages: 1,
            page: 1,
            skip: 0,
            limit: 100,
          },
        },
      });

      const result = await comparisonsService.list({
        group_id: 'group-1',
        limit: 100,
        skip: 0,
        search: 'foo',
      });

      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(mockGet).toHaveBeenCalledWith(
        '/users/comparisons',
        expect.objectContaining({
          params: { group_id: 'group-1', limit: 100, skip: 0, search: 'foo' },
        })
      );
      expect(result.comparisons).toEqual(comparisons);
    });

    it('omits undefined params', async () => {
      mockGet.mockResolvedValueOnce({
        data: {
          success: true,
          message: 'ok',
          comparisons: [],
          meta: { total: 0, total_pages: 0, page: 1, skip: 0, limit: 100 },
        },
      });

      await comparisonsService.list({ group_id: 'group-1' });

      expect(mockGet).toHaveBeenCalledWith(
        '/users/comparisons',
        expect.objectContaining({
          params: { group_id: 'group-1' },
        })
      );
    });

    it('throws a sanitized EnhancedError when success is false', async () => {
      mockGet.mockResolvedValueOnce({
        data: { success: false, message: 'nope', comparisons: [], meta: null },
      });

      await expect(
        comparisonsService.list({ group_id: 'group-1' })
      ).rejects.toThrow('nope');
    });
  });

  describe('get', () => {
    it('GETs the comparison by id', async () => {
      const comparison = makeComparison();
      mockGet.mockResolvedValueOnce({
        data: { success: true, message: 'ok', comparison },
      });

      const result = await comparisonsService.get('comp-1');
      expect(mockGet).toHaveBeenCalledWith('/users/comparisons/comp-1');
      expect(result.comparison).toEqual(comparison);
    });
  });

  describe('create', () => {
    it('POSTs the payload', async () => {
      const comparison = makeComparison();
      mockPost.mockResolvedValueOnce({
        data: { success: true, message: 'ok', comparison },
      });

      const payload = {
        group_id: 'group-1',
        name: 'My comparison',
        site_ids: ['site-1'],
        sites: [{ id: 'site-1', name: 'Kampala Site' }],
      };
      const result = await comparisonsService.create(payload);

      expect(mockPost).toHaveBeenCalledWith('/users/comparisons', payload);
      expect(result.comparison).toEqual(comparison);
    });
  });

  describe('update', () => {
    it('PATCHes the comparison by id with a partial payload', async () => {
      const comparison = makeComparison({ name: 'Renamed' });
      mockPatch.mockResolvedValueOnce({
        data: { success: true, message: 'ok', comparison },
      });

      const result = await comparisonsService.update('comp-1', {
        name: 'Renamed',
      });
      expect(mockPatch).toHaveBeenCalledWith('/users/comparisons/comp-1', {
        name: 'Renamed',
      });
      expect(result.comparison).toEqual(comparison);
    });
  });

  describe('remove', () => {
    it('resolves success on a 204 empty body', async () => {
      // Axios resolves on 204 with empty data — no error thrown.
      mockDelete.mockResolvedValueOnce({ data: '' });

      await expect(comparisonsService.remove('comp-1')).resolves.toEqual({
        success: true,
      });
      expect(mockDelete).toHaveBeenCalledWith('/users/comparisons/comp-1');
    });

    it('resolves success when the backend returns 404 (already deleted)', async () => {
      const notFoundError = new Error('Not Found');
      (notFoundError as unknown as { response: { status: number } }).response =
        {
          status: 404,
        };
      mockDelete.mockRejectedValueOnce(notFoundError);

      await expect(comparisonsService.remove('comp-1')).resolves.toEqual({
        success: true,
      });
    });

    it('rejects a sanitized error on a 500', async () => {
      const serverError = new Error('Internal Server Error');
      (serverError as unknown as { response: { status: number } }).response = {
        status: 500,
      };
      mockDelete.mockRejectedValueOnce(serverError);

      // The handler surfaces the (sanitized) axios error MESSAGE — never the
      // raw axios error object that carries Authorization headers.
      await expect(comparisonsService.remove('comp-1')).rejects.toThrow(
        'Internal Server Error'
      );
    });
  });
});
