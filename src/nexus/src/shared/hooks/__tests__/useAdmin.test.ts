// Focused wiring tests for useAdmin: the SWR cache keys these hooks generate
// and invalidate. SWR itself is mocked so the assertions target the hook's
// key/predicate construction rather than SWR's cache internals.
import { renderHook } from '@testing-library/react';
import { useUpdateUserRole, useUsers } from '../useAdmin';

const mockMutate = jest.fn();
const mockUseSWR = jest.fn();
const mockUseSWRMutation = jest.fn();

jest.mock('swr', () => ({
  __esModule: true,
  default: (...args: unknown[]) => mockUseSWR(...args),
  useSWRConfig: () => ({ mutate: mockMutate }),
}));

jest.mock('swr/mutation', () => ({
  __esModule: true,
  default: (...args: unknown[]) => mockUseSWRMutation(...args),
}));

jest.mock('../../services/adminService', () => ({ adminService: {} }));
jest.mock('../../services/userService', () => ({ userService: {} }));

describe('useAdmin hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSWR.mockReturnValue({ data: undefined, error: undefined });
    mockUseSWRMutation.mockReturnValue({ trigger: jest.fn() });
  });

  describe('useUsers', () => {
    it('encodes the email filter in the SWR key so it matches the service URL', () => {
      renderHook(() => useUsers('user+tag@example.com'));

      expect(mockUseSWR).toHaveBeenCalledWith(
        'admin/users?email=user%2Btag%40example.com',
        expect.any(Function),
        expect.any(Object)
      );
    });

    it('uses the bare key when no email filter is set', () => {
      renderHook(() => useUsers());

      expect(mockUseSWR).toHaveBeenCalledWith(
        'admin/users',
        expect.any(Function),
        expect.any(Object)
      );
    });
  });

  describe('useUpdateUserRole', () => {
    const callOnSuccess = () => {
      const call = mockUseSWRMutation.mock.calls[0];
      const options = call[2] as { onSuccess: () => void };
      options.onSuccess();
    };

    it('invalidates group-scoped role caches alongside the existing keys', () => {
      renderHook(() => useUpdateUserRole());

      callOnSuccess();

      expect(mockMutate).toHaveBeenCalledTimes(1);
      const filter = mockMutate.mock.calls[0][0] as (key: string) => boolean;

      // Group-scoped role caches (useRolesByGroup) must be invalidated too.
      expect(filter('admin/roles')).toBe(true);
      expect(filter('admin/roles?group_id=group-1')).toBe(true);
      expect(filter('admin/roles/role-1')).toBe(true);
      // Pre-existing keys are preserved.
      expect(filter('admin/roles/summary/all')).toBe(true);
      expect(filter('admin/users?email=a%40b.com')).toBe(true);
      expect(filter('user/details/user-1')).toBe(true);
      expect(filter('admin/user-statistics')).toBe(true);
      // Unrelated caches must not be revalidated.
      expect(filter('system/org-requests')).toBe(false);
      expect(filter('admin/permissions')).toBe(false);
    });
  });
});
