import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { useSWRConfig } from 'swr';
import { userService } from '../services/userService';
import type {
  GetGroupJoinRequestsResponse,
  GetGroupDetailsResponse,
  SendGroupInviteRequest,
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
