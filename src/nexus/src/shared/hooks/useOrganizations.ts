import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { useSWRConfig } from 'swr';
import type { ScopedMutator } from 'swr';
import { useCallback } from 'react';
import { userService } from '../services/userService';
import { useAbortableFetcher } from './useAbortableSWR';
import { isAbortError } from '../lib/retryPolicy';
import type {
  GroupSummary,
  GetGroupAssignedUsersResponse,
  GetGroupActivityLogParams,
  GetGroupActivityLogResponse,
  UpdateGroupDetailsRequest,
  UpdateGroupDetailsResponse,
  UnassignManyUsersFromGroupResponse,
  DeleteGroupResponse,
} from '../types/api';

/**
 * System → Organization Management hooks.
 *
 * Group detail reads (useGroupDetails), manager changes (useSetGroupManager)
 * and per-group roles (useRolesByGroup) already exist — import them from
 * './useGroups' / './useAdmin' rather than re-declaring them here.
 */

const ORGANIZATIONS_SUMMARY_KEY = 'system/organizations/summary/all';

// Read-only admin list: no focus/reconnect revalidation and no retries, so a
// failing summary endpoint cannot turn into a retry storm. Failures surface
// once as an error state instead (per the AGENTS.md retry policy).
const ORGANIZATION_READ_OPTIONS = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  shouldRetryOnError: false,
} as const;

// Everything a group-membership change can make stale: existing group
// caches, this file's organization caches, the current user's group list
// and the admin user tables. String keys ('groups/...', 'system/organizations/...',
// 'user/details/...', 'admin/users...') and array keys
// (['system/organizations', groupId, 'assigned-users']) are both covered.
// Exported as a pure predicate for cache-invalidation tests only — no
// behavior change.
export const matchesOrganizationCacheKey = (key: unknown): boolean => {
  if (typeof key === 'string') {
    return (
      key.startsWith('groups/') ||
      key.startsWith('system/organizations') ||
      key.startsWith('user/details/') ||
      key.startsWith('admin/users')
    );
  }

  if (Array.isArray(key)) {
    const head = key[0];
    return (
      typeof head === 'string' &&
      (head === 'system/organizations' || head.startsWith('groups/'))
    );
  }

  return false;
};

const invalidateOrganizationCaches = (mutate: ScopedMutator) => {
  mutate(key => matchesOrganizationCacheKey(key));
};

// All organization (group) summaries, assembled by paging the summary
// endpoint (limit=100) until a short page. Stable key — revalidation only
// happens through explicit mutations/invalidate, never on focus/reconnect.
export const useOrganizationsSummary = () => {
  const summaryFetcher = useCallback(
    (signal: AbortSignal) => userService.getAllGroupsSummary(signal),
    []
  );
  const { fetcher } = useAbortableFetcher<GroupSummary[]>(summaryFetcher);

  const result = useSWR<GroupSummary[]>(
    ORGANIZATIONS_SUMMARY_KEY,
    fetcher,
    ORGANIZATION_READ_OPTIONS
  );

  return {
    ...result,
    // A cancelled request is not a user-facing failure.
    error: isAbortError(result.error) ? null : result.error,
    groups: result.data ?? [],
  };
};

// Users assigned to one organization, with flat role fields. Key is null
// (no request) until a group is selected, so a stale response can never
// land in another group's cache entry after a fast switch.
export const useOrganizationAssignedUsers = (groupId: string | null) => {
  const assignedUsersFetcher = useCallback(
    async (signal: AbortSignal) => {
      if (!groupId) throw new Error('Group ID is required');
      return await userService.getGroupAssignedUsers(groupId, signal);
    },
    [groupId]
  );
  const { fetcher } =
    useAbortableFetcher<GetGroupAssignedUsersResponse>(assignedUsersFetcher);

  const result = useSWR<GetGroupAssignedUsersResponse>(
    groupId ? ['system/organizations', groupId, 'assigned-users'] : null,
    fetcher,
    ORGANIZATION_READ_OPTIONS
  );

  return {
    ...result,
    error: isAbortError(result.error) ? null : result.error,
    users: result.data?.data ?? [],
  };
};

// Update an organization's profile details (existing updateGroupDetails).
export const useUpdateOrganizationDetails = () => {
  const { mutate } = useSWRConfig();

  return useSWRMutation<
    UpdateGroupDetailsResponse,
    Error,
    string,
    { groupId: string; details: UpdateGroupDetailsRequest }
  >(
    'system/organizations/update-details',
    async (
      _key,
      { arg }: { arg: { groupId: string; details: UpdateGroupDetailsRequest } }
    ) => {
      return await userService.updateGroupDetails(arg.groupId, arg.details);
    },
    {
      onSuccess: () => {
        invalidateOrganizationCaches(mutate);
      },
    }
  );
};

// Bulk-remove users from an organization's member list.
export const useUnassignUsersFromGroup = () => {
  const { mutate } = useSWRConfig();

  return useSWRMutation<
    UnassignManyUsersFromGroupResponse,
    Error,
    string,
    { groupId: string; user_ids: string[] }
  >(
    'system/organizations/unassign-users',
    async (_key, { arg }: { arg: { groupId: string; user_ids: string[] } }) => {
      return await userService.unassignManyUsersFromGroup(arg.groupId, {
        user_ids: arg.user_ids,
      });
    },
    {
      onSuccess: () => {
        invalidateOrganizationCaches(mutate);
      },
    }
  );
};

// Delete an organization. Staging answers 501 "Group deletion temporarily
// disabled" — the thrown axios error is left untouched so the UI can show
// that exact backend message. No retries configured.
export const useDeleteOrganization = () => {
  const { mutate } = useSWRConfig();

  return useSWRMutation<
    DeleteGroupResponse,
    Error,
    string,
    { groupId: string }
  >(
    'system/organizations/delete',
    async (_key, { arg }: { arg: { groupId: string } }) => {
      return await userService.deleteGroup(arg.groupId);
    },
    {
      onSuccess: () => {
        invalidateOrganizationCaches(mutate);
      },
    }
  );
};

// One organization's activity log. The endpoint pages with limit/skip (it
// ignores `page`) and returns no total count, so callers pass an explicit
// limit/skip window and treat a full page as "there may be more".
//
// The params object is part of the SWR key, so a page or filter change
// fetches its own cache entry and can never render another window's rows.
// The key is null until a group is selected, so a response fired for one
// group cannot resolve into another group's entry after a fast switch.
// No focus/reconnect revalidation and no retries: a failing log endpoint
// surfaces once as an error state instead of looping (AGENTS.md retry
// policy), and aborts are filtered out of `error` below.
export const useOrganizationActivityLog = (
  groupId: string | null,
  params: GetGroupActivityLogParams
) => {
  // Depend on the primitive values rather than the caller's object identity,
  // so a re-created (but equal) params object does not churn the fetcher.
  const { limit, skip, user_id, start_date, end_date } = params;
  const activityLogFetcher = useCallback(
    async (signal: AbortSignal) => {
      if (!groupId) throw new Error('Group ID is required');
      return await userService.getGroupActivityLog(
        groupId,
        { limit, skip, user_id, start_date, end_date },
        signal
      );
    },
    [groupId, limit, skip, user_id, start_date, end_date]
  );
  const { fetcher } =
    useAbortableFetcher<GetGroupActivityLogResponse>(activityLogFetcher);

  const result = useSWR<GetGroupActivityLogResponse>(
    groupId
      ? ['system/organizations', groupId, 'activity-log', params]
      : null,
    fetcher,
    ORGANIZATION_READ_OPTIONS
  );

  return {
    ...result,
    // A cancelled request is not a user-facing failure.
    error: isAbortError(result.error) ? null : result.error,
    activities: result.data?.data.activities ?? [],
    groupName: result.data?.data.group_name,
    filtersApplied: result.data?.data.filters_applied ?? {},
  };
};
