// Focused tests for the organization hooks: the cache-key matcher that drives
// post-mutation invalidation, and the null-key guard that must keep services
// untouched until a group is selected. Real SWR with a fresh cache provider,
// mocked services — so "no request" means the service function was never
// invoked, not just that SWR hid it.
import type { ReactNode } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { SWRConfig } from 'swr';
import {
  matchesOrganizationCacheKey,
  useOrganizationAssignedUsers,
  useOrganizationActivityLog,
} from '../useOrganizations';

const mockGetGroupAssignedUsers = jest.fn();
const mockGetGroupActivityLog = jest.fn();

jest.mock('../../services/userService', () => ({
  userService: {
    getGroupAssignedUsers: (...args: unknown[]) =>
      mockGetGroupAssignedUsers(...args),
    getGroupActivityLog: (...args: unknown[]) => mockGetGroupActivityLog(...args),
  },
}));

const wrapper = ({ children }: { children: ReactNode }) => (
  <SWRConfig value={{ provider: () => new Map() }}>{children}</SWRConfig>
);

describe('matchesOrganizationCacheKey', () => {
  it('matches the string key families a membership change can make stale', () => {
    expect(matchesOrganizationCacheKey('groups/group-1')).toBe(true);
    expect(matchesOrganizationCacheKey('system/organizations')).toBe(true);
    expect(
      matchesOrganizationCacheKey('system/organizations/summary/all')
    ).toBe(true);
    expect(matchesOrganizationCacheKey('user/details/user-1')).toBe(true);
    expect(matchesOrganizationCacheKey('admin/users')).toBe(true);
    expect(
      matchesOrganizationCacheKey('admin/users?email=a%40b.com')
    ).toBe(true);
  });

  it('matches organization and groups array keys', () => {
    expect(
      matchesOrganizationCacheKey(['system/organizations', 'g-1', 'assigned-users'])
    ).toBe(true);
    expect(matchesOrganizationCacheKey(['groups/group-1'])).toBe(true);
  });

  it('rejects unrelated string and array keys', () => {
    expect(matchesOrganizationCacheKey('system/org-requests')).toBe(false);
    expect(matchesOrganizationCacheKey('admin/roles')).toBe(false);
    expect(matchesOrganizationCacheKey('notifications/inbox')).toBe(false);
    expect(matchesOrganizationCacheKey(['admin/roles', 'role-1'])).toBe(false);
    expect(matchesOrganizationCacheKey([])).toBe(false);
  });

  it('rejects non-string, non-array keys', () => {
    expect(matchesOrganizationCacheKey(null)).toBe(false);
    expect(matchesOrganizationCacheKey(undefined)).toBe(false);
    expect(matchesOrganizationCacheKey(42)).toBe(false);
    expect(matchesOrganizationCacheKey({ key: 'groups/x' })).toBe(false);
  });
});

describe('useOrganizationAssignedUsers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('never calls the service while the group id is null', async () => {
    renderHook(() => useOrganizationAssignedUsers(null), { wrapper });

    // Flush effects/microtasks so a mis-scheduled fetch would have landed.
    await act(async () => {});
    expect(mockGetGroupAssignedUsers).not.toHaveBeenCalled();
  });

  it('calls the service once a group id is provided', async () => {
    mockGetGroupAssignedUsers.mockResolvedValue({
      success: true,
      message: 'ok',
      data: [],
    });

    const { result } = renderHook(() => useOrganizationAssignedUsers('g-1'), {
      wrapper,
    });

    await waitFor(() =>
      expect(mockGetGroupAssignedUsers).toHaveBeenCalledWith(
        'g-1',
        expect.any(AbortSignal)
      )
    );
    expect(result.current.users).toEqual([]);
  });
});

describe('useOrganizationActivityLog', () => {
  const params = { limit: 20, skip: 0 };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('never calls the service while the group id is null', async () => {
    renderHook(() => useOrganizationActivityLog(null, params), { wrapper });

    // Flush effects/microtasks so a mis-scheduled fetch would have landed.
    await act(async () => {});
    expect(mockGetGroupActivityLog).not.toHaveBeenCalled();
  });

  it('calls the service with the window params once a group id is provided', async () => {
    mockGetGroupActivityLog.mockResolvedValue({
      success: true,
      message: 'ok',
      data: {
        activities: [],
        group_name: 'AirQo Kampala',
        filters_applied: {},
      },
    });

    const { result } = renderHook(
      () => useOrganizationActivityLog('g-1', params),
      { wrapper }
    );

    await waitFor(() =>
      expect(mockGetGroupActivityLog).toHaveBeenCalledWith(
        'g-1',
        expect.objectContaining({ limit: 20, skip: 0 }),
        expect.any(AbortSignal)
      )
    );
    expect(result.current.groupName).toBe('AirQo Kampala');
  });
});
