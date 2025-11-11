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

// Get roles by group - with optional group filter
export const useRolesByGroup = (groupId?: string) => {
  const key = groupId ? `admin/roles?group_id=${groupId}` : 'admin/roles';

  return useSWR(key, () => adminService.getRolesByGroup(groupId), {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });
};

// Get role by ID
export const useRoleById = (roleId: string | null) => {
  return useSWR(
    roleId ? `admin/roles/${roleId}` : null,
    roleId ? () => adminService.getRoleById(roleId) : null,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );
};

// Get all permissions
export const usePermissions = () => {
  return useSWR('admin/permissions', () => adminService.getPermissions(), {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });
};

// Create a new role
export const useCreateRole = () => {
  const { mutate } = useSWRConfig();

  return useSWRMutation(
    'admin/create-role',
    async (
      key,
      {
        arg,
      }: {
        arg: { role_name: string; group_id: string; role_description?: string };
      }
    ) => {
      return await adminService.createRole(arg);
    },
    {
      onSuccess: () => {
        mutate(key => typeof key === 'string' && key.startsWith('admin/roles'));
      },
    }
  );
};

// Update role permissions
export const useUpdateRolePermissions = () => {
  const { mutate } = useSWRConfig();

  return useSWRMutation(
    'admin/update-role-permissions',
    async (
      key,
      { arg }: { arg: { roleId: string; permission_ids: string[] } }
    ) => {
      return await adminService.updateRolePermissions(arg.roleId, {
        permission_ids: arg.permission_ids,
      });
    },
    {
      onSuccess: () => {
        mutate(key => typeof key === 'string' && key.startsWith('admin/roles'));
      },
    }
  );
};

// Update role data (name and status)
export const useUpdateRoleData = () => {
  const { mutate } = useSWRConfig();

  return useSWRMutation(
    'admin/update-role-data',
    async (
      key,
      {
        arg,
      }: {
        arg: {
          roleId: string;
          role_name?: string;
          role_status?: 'ACTIVE' | 'INACTIVE';
        };
      }
    ) => {
      return await adminService.updateRoleData(arg.roleId, {
        role_name: arg.role_name,
        role_status: arg.role_status,
      });
    },
    {
      onSuccess: () => {
        mutate(key => typeof key === 'string' && key.startsWith('admin/roles'));
      },
    }
  );
};
