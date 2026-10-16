import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { useSWRConfig } from 'swr';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { userService } from '../services/userService';
import {
  NOTIFICATIONS_INBOX_QUERY_KEY,
  NOTIFICATIONS_UNREAD_QUERY_KEY,
} from '../services/notificationService';
import { STABLE_SWR_OPTIONS, useAbortableFetcher } from './useAbortableSWR';
import type {
  GetGroupJoinRequestsResponse,
  GetGroupDetailsResponse,
  DiscoverGroupsResponse,
  RequestGroupAccessResponse,
  SendGroupInviteRequest,
  UnassignUserFromGroupResponse,
  LeaveGroupResponse,
  SetGroupManagerResponse,
} from '../types/api';

// Get group join requests
export const useGroupJoinRequests = (groupId: string | null) => {
  return useSWR<GetGroupJoinRequestsResponse>(
    groupId ? `groups/${groupId}/join-requests` : null,
    async () => {
      if (!groupId) throw new Error('Group ID is required');
      return await userService.getGroupJoinRequests(groupId);
    }
  );
};

// Get group details
export const useGroupDetails = (groupId: string | null) => {
  return useSWR<GetGroupDetailsResponse>(
    groupId ? `groups/${groupId}/details` : null,
    async () => {
      if (!groupId) throw new Error('Group ID is required');
      return await userService.getGroupDetails(groupId);
    }
  );
};

// Send group invite
export const useSendGroupInvite = () => {
  const { mutate } = useSWRConfig();

  return useSWRMutation(
    'groups/send-invite',
    async (
      key,
      { arg }: { arg: { groupId: string; inviteData: SendGroupInviteRequest } }
    ) => {
      return await userService.sendGroupInvite(arg.groupId, arg.inviteData);
    },
    {
      onSuccess: () => {
        // Invalidate group-related caches
        mutate(key => typeof key === 'string' && key.startsWith('groups/'));
      },
    }
  );
};

// Approve group join request
export const useApproveGroupJoinRequest = () => {
  const { mutate } = useSWRConfig();

  return useSWRMutation(
    'groups/approve-request',
    async (key, { arg }: { arg: { requestId: string } }) => {
      return await userService.approveGroupJoinRequest(arg.requestId);
    },
    {
      onSuccess: () => {
        // Invalidate group-related caches
        mutate(key => typeof key === 'string' && key.startsWith('groups/'));
      },
    }
  );
};

// Reject group join request
export const useRejectGroupJoinRequest = () => {
  const { mutate } = useSWRConfig();

  return useSWRMutation(
    'groups/reject-request',
    async (key, { arg }: { arg: { requestId: string } }) => {
      return await userService.rejectGroupJoinRequest(arg.requestId);
    },
    {
      onSuccess: () => {
        // Invalidate group-related caches
        mutate(key => typeof key === 'string' && key.startsWith('groups/'));
      },
    }
  );
};

// Unassign user from group
export const useUnassignUserFromGroup = () => {
  const { mutate } = useSWRConfig();

  return useSWRMutation<
    UnassignUserFromGroupResponse,
    Error,
    string,
    { groupId: string; userId: string }
  >(
    'groups/unassign-user',
    async (key, { arg }: { arg: { groupId: string; userId: string } }) => {
      return await userService.unassignUserFromGroup(arg.groupId, arg.userId);
    },
    {
      onSuccess: () => {
        // Invalidate group-related caches and user details
        mutate(key => typeof key === 'string' && key.startsWith('groups/'));
        mutate(key => typeof key === 'string' && key.startsWith('users/'));
      },
    }
  );
};

// Leave group
export const useLeaveGroup = () => {
  const { mutate } = useSWRConfig();

  return useSWRMutation<LeaveGroupResponse, Error, string, { groupId: string }>(
    'groups/leave',
    async (key, { arg }: { arg: { groupId: string } }) => {
      return await userService.leaveGroup(arg.groupId);
    },
    {
      onSuccess: () => {
        // Invalidate all caches to refresh user's groups and related data
        mutate(key => typeof key === 'string' && key.startsWith('groups/'));
        mutate(key => typeof key === 'string' && key.startsWith('users/'));
        mutate('user-roles');
      },
    }
  );
};

// Set group manager
export const useSetGroupManager = () => {
  const { mutate } = useSWRConfig();

  return useSWRMutation<
    SetGroupManagerResponse,
    Error,
    string,
    { groupId: string; userId: string }
  >(
    'groups/set-manager',
    async (key, { arg }: { arg: { groupId: string; userId: string } }) => {
      return await userService.setGroupManager(arg.groupId, arg.userId);
    },
    {
      onSuccess: () => {
        // Invalidate group-related caches
        mutate(key => typeof key === 'string' && key.startsWith('groups/'));
      },
    }
  );
};

// Discover all organizations available for join requests. The user id keeps
// this user-scoped cache from being reused after an account change.
export const useDiscoverGroups = (enabled: boolean, userId?: string | null) => {
  const discoverFetcher = useCallback(
    (signal: AbortSignal) => userService.discoverGroups(signal),
    []
  );
  const { fetcher } =
    useAbortableFetcher<DiscoverGroupsResponse>(discoverFetcher);

  return useSWR<DiscoverGroupsResponse>(
    enabled && userId ? ['groups/discover', userId] : null,
    fetcher,
    {
      ...STABLE_SWR_OPTIONS,
      // Discovery data changes rarely and the dialog is reopened frequently,
      // so a longer dedupe window avoids repeat fetches while the bounded
      // retry policy (errorRetryCount: 1 via STABLE_SWR_OPTIONS) still applies.
      dedupingInterval: 60_000,
    }
  );
};

// Request access to an organization the user is not a member of
export const useRequestGroupAccess = (userId?: string | null) => {
  const queryClient = useQueryClient();

  return useSWRMutation<
    RequestGroupAccessResponse,
    Error,
    readonly [string, string] | null,
    { groupId: string }
  >(
    userId ? ['groups/request-access', userId] : null,
    async (_key, { arg }: { arg: { groupId: string } }) => {
      return await userService.requestGroupAccess(arg.groupId);
    },
    {
      onSuccess: () => {
        // The backend creates the inbox notification as part of a successful
        // access request. Refresh active notification queries without making
        // the request mutation depend on a second notification request.
        void queryClient.invalidateQueries({
          queryKey: NOTIFICATIONS_UNREAD_QUERY_KEY,
        });
        void queryClient.invalidateQueries({
          queryKey: NOTIFICATIONS_INBOX_QUERY_KEY,
        });
      },
    }
  );
};
