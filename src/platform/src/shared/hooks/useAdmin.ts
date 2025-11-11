import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { useSWRConfig } from 'swr';
import { adminService } from '../services/adminService';

// Get organization requests
export const useOrganizationRequests = () => {
  return useSWR(
    'admin/org-requests',
    () => adminService.getOrganizationRequests(),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );
};

// Approve organization request
export const useApproveOrganizationRequest = () => {
  const { mutate } = useSWRConfig();

  return useSWRMutation(
    'admin/approve-org-request',
    async (key, { arg }: { arg: { requestId: string } }) => {
      return await adminService.approveOrganizationRequest(arg.requestId);
    },
    {
      onSuccess: () => {
        mutate(
          key => typeof key === 'string' && key.startsWith('admin/org-requests')
        );
      },
    }
  );
};

// Reject organization request
export const useRejectOrganizationRequest = () => {
  const { mutate } = useSWRConfig();

  return useSWRMutation(
    'admin/reject-org-request',
    async (
      key,
      { arg }: { arg: { requestId: string; rejection_reason?: string } }
    ) => {
      return await adminService.rejectOrganizationRequest(
        arg.requestId,
        arg.rejection_reason || ''
      );
    },
    {
      onSuccess: () => {
        mutate(
          key => typeof key === 'string' && key.startsWith('admin/org-requests')
        );
      },
    }
  );
};
