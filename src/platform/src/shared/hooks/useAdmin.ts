import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { useSWRConfig } from 'swr';
import { adminService } from '../services/adminService';
import { userService } from '../services/userService';

// Get organization requests
export const useOrganizationRequests = () => {
  return useSWR(
    'system/org-requests',
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
    'system/approve-org-request',
    async (key, { arg }: { arg: { requestId: string } }) => {
      return await adminService.approveOrganizationRequest(arg.requestId);
    },
    {
      onSuccess: () => {
        mutate(
          key =>
            typeof key === 'string' && key.startsWith('system/org-requests')
        );
      },
    }
  );
};

// Reject organization request
export const useRejectOrganizationRequest = () => {
  const { mutate } = useSWRConfig();

  return useSWRMutation(
    'system/reject-org-request',
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
          key =>
            typeof key === 'string' && key.startsWith('system/org-requests')
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
        arg: {
          role_name: string;
          role_code?: string;
          network_id?: string;
          group_id?: string;
          role_description?: string;
        };
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
          role_name: string;
          role_status: 'ACTIVE' | 'INACTIVE';
          role_code: string;
        };
      }
    ) => {
      return await adminService.updateRoleData(arg.roleId, {
        role_name: arg.role_name,
        role_status: arg.role_status,
        role_code: arg.role_code,
      });
    },
    {
      onSuccess: () => {
        mutate(key => typeof key === 'string' && key.startsWith('admin/roles'));
      },
    }
  );
};

// Get users by role
export const useUsersByRole = (roleId: string | null) => {
  return useSWR(
    roleId ? `admin/roles/${roleId}/users` : null,
    roleId ? () => adminService.getUsersByRole(roleId) : null,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );
};

// Assign users to role
export const useAssignUsersToRole = () => {
  const { mutate } = useSWRConfig();

  return useSWRMutation(
    'admin/assign-users-to-role',
    async (key, { arg }: { arg: { roleId: string; user_ids: string[] } }) => {
      return await adminService.assignUsersToRole(arg.roleId, {
        user_ids: arg.user_ids,
      });
    },
    {
      onSuccess: () => {
        mutate(key => typeof key === 'string' && key.startsWith('admin/'));
      },
    }
  );
};

// Unassign users from role
export const useUnassignUsersFromRole = () => {
  const { mutate } = useSWRConfig();

  return useSWRMutation(
    'admin/unassign-users-from-role',
    async (key, { arg }: { arg: { roleId: string; user_ids: string[] } }) => {
      return await adminService.unassignUsersFromRole(arg.roleId, {
        user_ids: arg.user_ids,
      });
    },
    {
      onSuccess: () => {
        mutate(key => typeof key === 'string' && key.startsWith('admin/'));
      },
    }
  );
};

// Get user statistics
export const useUserStatistics = () => {
  return useSWR(
    'admin/user-statistics',
    () => userService.getUserStatistics(),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );
};

// Get all users (optionally filtered by email)
export const useUsers = (email?: string) => {
  return useSWR(
    email ? `admin/users?email=${email}` : 'admin/users',
    () => userService.getUsers(email),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );
};

// Get all roles and permissions summary across all pages
export const useRolesSummary = () => {
  return useSWR(
    'admin/roles/summary/all',
    () => userService.getAllRolesSummary(),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );
};

// Update a user's role
export const useUpdateUserRole = () => {
  const { mutate } = useSWRConfig();

  return useSWRMutation(
    'admin/update-user-role',
    async (key, { arg }: { arg: { userId: string; roleId: string } }) => {
      return await userService.updateUserRole(arg.userId, arg.roleId);
    },
    {
      onSuccess: () => {
        mutate(
          key =>
            typeof key === 'string' &&
            (key.startsWith('user/details/') ||
              key.startsWith('admin/users') ||
              key === 'admin/roles/summary/all' ||
              key === 'admin/user-statistics')
        );
      },
    }
  );
};

// Get tokens with active security bypasses
export const useBypassedTokens = () => {
  return useSWR(
    'system/bypassed-tokens',
    () => adminService.getBypassedTokens(),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );
};

// Update a token's bypass flags
export const useUpdateTokenBypass = () => {
  const { mutate } = useSWRConfig();

  return useSWRMutation(
    'admin/update-token-bypass',
    async (
      key,
      {
        arg,
      }: {
        arg: {
          token: string;
          bypass_anomaly_detection?: boolean;
          bypass_anomaly_detection_expires_at?: string | null;
          bypass_compromise_detection?: boolean;
          bypass_compromise_detection_expires_at?: string | null;
          bypass_ip_blacklist?: boolean;
          bypass_ip_blacklist_expires_at?: string | null;
          reinstate?: boolean;
        };
      }
    ) => {
      const payload: import('../types/api').UpdateTokenBypassRequest = {};

      if (typeof arg.bypass_anomaly_detection === 'boolean') {
        payload.bypass_anomaly_detection = arg.bypass_anomaly_detection;
        if (arg.bypass_anomaly_detection) {
          payload.bypass_anomaly_detection_expires_at =
            arg.bypass_anomaly_detection_expires_at ?? null;
        }
      }
      if (typeof arg.bypass_compromise_detection === 'boolean') {
        payload.bypass_compromise_detection = arg.bypass_compromise_detection;
        if (arg.bypass_compromise_detection) {
          payload.bypass_compromise_detection_expires_at =
            arg.bypass_compromise_detection_expires_at ?? null;
        }
      }
      if (typeof arg.bypass_ip_blacklist === 'boolean') {
        payload.bypass_ip_blacklist = arg.bypass_ip_blacklist;
        if (arg.bypass_ip_blacklist) {
          payload.bypass_ip_blacklist_expires_at =
            arg.bypass_ip_blacklist_expires_at ?? null;
        }
      }
      if (arg.reinstate) {
        payload.request_pattern = { auto_suspended: false };
      }

      return await adminService.updateTokenBypass(arg.token, payload);
    },
    {
      onSuccess: () => {
        mutate(
          key =>
            typeof key === 'string' && key.startsWith('system/bypassed-tokens')
        );
      },
    }
  );
};
