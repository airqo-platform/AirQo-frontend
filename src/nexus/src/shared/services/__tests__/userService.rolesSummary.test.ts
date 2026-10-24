import type { GetRolesSummaryResponse } from '../../types/api';

jest.mock('../apiClient', () => {
  const rolesSummaryMockGet = jest.fn();
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
      get: rolesSummaryMockGet,
      post: jest.fn(),
      put: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
      setAuthToken: jest.fn(),
      removeAuthToken: jest.fn(),
    }),
    createServerClient: createStubClient,
    createOpenClient: createStubClient,
    __rolesSummaryMockGet: rolesSummaryMockGet,
  };
});

jest.mock('../sessionAuthToken', () => ({
  syncClientSessionToken: jest.fn().mockResolvedValue(undefined),
}));

const { __rolesSummaryMockGet: rolesSummaryMockGet } = jest.requireMock(
  '../apiClient'
) as { __rolesSummaryMockGet: jest.Mock };

interface SummaryRole {
  _id: string;
  role_status: string;
  role_name: string;
  user_count: number;
  role_permissions: unknown[];
  group: { _id: string; grp_title: string };
}

const makeRole = (id: string, groupId = 'g-1'): SummaryRole => ({
  _id: id,
  role_status: 'active',
  role_name: id.toUpperCase(),
  user_count: 0,
  role_permissions: [],
  group: { _id: groupId, grp_title: `Group ${groupId}` },
});

const makePage = (
  roles: SummaryRole[],
  meta: { total: number; page: number; pages: number; limit: number }
) => ({
  data: {
    success: true,
    message: 'ok',
    meta: { ...meta, skip: (meta.page - 1) * meta.limit },
    roles,
  },
});

const { userService } = jest.requireActual('../userService') as {
  userService: {
    getRolesSummary: (
      page?: number,
      limit?: number
    ) => Promise<GetRolesSummaryResponse>;
    getAllRolesSummary: (limit?: number) => Promise<GetRolesSummaryResponse>;
  };
};

describe('UserService roles summary pagination', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getRolesSummary', () => {
    it('translates page/limit into the skip/limit contract the backend honors', async () => {
      rolesSummaryMockGet.mockResolvedValueOnce(
        makePage([makeRole('r-101')], {
          total: 203,
          page: 2,
          pages: 3,
          limit: 100,
        })
      );

      await userService.getRolesSummary(2, 100);

      const calledUrl = rolesSummaryMockGet.mock.calls[0][0] as string;
      expect(calledUrl).toBe('/users/roles/summary?skip=100&limit=100');
      // The live API ignores `page`, so the query must never carry it.
      expect(calledUrl).not.toContain('page=');
    });

    it('defaults to skip=0 for page 1', async () => {
      rolesSummaryMockGet.mockResolvedValueOnce(
        makePage([], { total: 0, page: 1, pages: 1, limit: 100 })
      );

      await userService.getRolesSummary();

      expect(rolesSummaryMockGet).toHaveBeenCalledWith(
        '/users/roles/summary?skip=0&limit=100'
      );
    });

    it('surfaces backend success:false messages as thrown Errors', async () => {
      rolesSummaryMockGet.mockResolvedValueOnce({
        data: { success: false, message: 'Roles summary unavailable' },
      });

      await expect(userService.getRolesSummary(1, 100)).rejects.toThrow(
        'Roles summary unavailable'
      );
    });
  });

  describe('getAllRolesSummary', () => {
    it('walks skip 0/100/200 from meta.pages, dedupes overlapping ids, and normalizes meta', async () => {
      const pageOne = Array.from({ length: 100 }, (_, i) =>
        makeRole(`role-${i + 1}`)
      );
      // Overlaps page one by 10 ids (role-91..role-100).
      const pageTwo = Array.from({ length: 100 }, (_, i) =>
        makeRole(`role-${i + 91}`)
      );
      // Overlaps page two by 1 id (role-190), adds 2 new.
      const pageThree = [
        makeRole('role-190'),
        makeRole('role-191'),
        makeRole('role-192'),
      ];

      rolesSummaryMockGet
        .mockResolvedValueOnce(
          makePage(pageOne, { total: 203, page: 1, pages: 3, limit: 100 })
        )
        .mockResolvedValueOnce(
          makePage(pageTwo, { total: 203, page: 2, pages: 3, limit: 100 })
        )
        .mockResolvedValueOnce(
          makePage(pageThree, { total: 203, page: 3, pages: 3, limit: 100 })
        );

      const result = await userService.getAllRolesSummary(100);

      const requestedUrls = rolesSummaryMockGet.mock.calls.map(
        call => call[0] as string
      );
      expect(requestedUrls).toEqual([
        '/users/roles/summary?skip=0&limit=100',
        '/users/roles/summary?skip=100&limit=100',
        '/users/roles/summary?skip=200&limit=100',
      ]);
      requestedUrls.forEach(url => expect(url).not.toContain('page='));

      // 100 + 90 new + 2 new = 192 unique roles, first-seen order preserved.
      expect(result.roles).toHaveLength(192);
      expect(result.roles[0]._id).toBe('role-1');
      expect(result.roles[191]._id).toBe('role-192');
      const uniqueIds = new Set(result.roles.map(role => role._id));
      expect(uniqueIds.size).toBe(192);

      expect(result.meta).toEqual({
        total: 192,
        page: 1,
        pages: 1,
        skip: 0,
        limit: 192,
      });
    });

    it('keeps the original limit when no roles are returned', async () => {
      rolesSummaryMockGet.mockResolvedValueOnce(
        makePage([], { total: 0, page: 1, pages: 1, limit: 100 })
      );

      const result = await userService.getAllRolesSummary(100);

      expect(result.roles).toEqual([]);
      expect(result.meta.total).toBe(0);
      expect(result.meta.limit).toBe(100);
      expect(result.meta.pages).toBe(1);
      expect(result.meta.skip).toBe(0);
    });

    it('collapses pages that return the same first page (API ignores page)', async () => {
      const firstPageRoles = Array.from({ length: 100 }, (_, i) =>
        makeRole(`role-${i + 1}`)
      );
      const samePageAgain = makePage(firstPageRoles, {
        total: 203,
        page: 1,
        pages: 2,
        limit: 100,
      });
      rolesSummaryMockGet
        .mockResolvedValueOnce(samePageAgain)
        .mockResolvedValueOnce(samePageAgain);

      const result = await userService.getAllRolesSummary(100);

      expect(rolesSummaryMockGet).toHaveBeenCalledTimes(2);
      expect(result.roles).toHaveLength(100);
      expect(result.meta.total).toBe(100);
      expect(result.meta.pages).toBe(1);
    });
  });
});
