import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { useSWRConfig } from 'swr';
import { userService } from '../services/userService';
import type {
  GetGroupJoinRequestsResponse,
  GetGroupDetailsResponse,
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
