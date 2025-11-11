import { useMemo } from 'react';
import { useUserRolesById } from './useAuth';
import { useUser } from './useUser';

export interface UserRole {
  group_id?: string;
  group_name?: string;
  network_id?: string;
  network_name?: string;
  role_id: string;
  role_name: string;
  permissions: string[];
}

export interface UserRolesData {
  user_id: string;
  groups: UserRole[];
  networks: UserRole[];
}

/**
 * Hook for managing Role-Based Access Control (RBAC)
 * Provides utilities to check user permissions and roles
 */
export const useRBAC = () => {
  const { user } = useUser();
  const { activeGroup } = useUser();
  const {
    data: rolesData,
    error,
    isLoading,
  } = useUserRolesById(user?.id || null);

  const userRoles = useMemo((): UserRolesData | null => {
    if (!rolesData?.user_roles) return null;
    return rolesData.user_roles;
  }, [rolesData]);

  const allPermissions = useMemo((): string[] => {
    if (!userRoles) return [];

    const permissions = new Set<string>();

    // Collect permissions from groups
    userRoles.groups.forEach(group => {
      group.permissions.forEach(permission => permissions.add(permission));
    });

    // Collect permissions from networks
    userRoles.networks.forEach(network => {
      network.permissions.forEach(permission => permissions.add(permission));
    });

    return Array.from(permissions);
  }, [userRoles]);

  const allRoles = useMemo((): string[] => {
    if (!userRoles) return [];

    const roles = new Set<string>();

    // Collect roles from groups
    userRoles.groups.forEach(group => {
      roles.add(group.role_name);
    });

    // Collect roles from networks
    userRoles.networks.forEach(network => {
      roles.add(network.role_name);
    });

    return Array.from(roles);
  }, [userRoles]);

  /**
   * Check if user has a specific permission
   */
  const hasPermission = (permission: string): boolean => {
    return allPermissions.includes(permission);
  };

  /**
   * Check if user has any of the specified permissions
   */
  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  };

  /**
   * Check if user has all of the specified permissions
   */
  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every(permission => hasPermission(permission));
  };

  /**
   * Check if user has a specific role
   */
  const hasRole = (role: string): boolean => {
    return allRoles.includes(role);
  };

  /**
   * Check if user has any of the specified roles
   */
  const hasAnyRole = (roles: string[]): boolean => {
    return roles.some(role => hasRole(role));
  };

  /**
   * Check if user has a specific permission in a specific group
   */
  const hasPermissionInGroup = (
    permission: string,
    groupName: string
  ): boolean => {
    if (!userRoles) return false;

    const group = userRoles.groups.find(g => g.group_name === groupName);
    return group ? group.permissions.includes(permission) : false;
  };

  /**
   * Check if user has a specific permission in a specific network
   */
  const hasPermissionInNetwork = (
    permission: string,
    networkName: string
  ): boolean => {
    if (!userRoles) return false;

    const network = userRoles.networks.find(
      n => n.network_name === networkName
    );
    return network ? network.permissions.includes(permission) : false;
  };

  /**
   * Check if user has a specific role in a specific group
   */
  const hasRoleInGroup = (role: string, groupName: string): boolean => {
    if (!userRoles) return false;

    const group = userRoles.groups.find(g => g.group_name === groupName);
    return group ? group.role_name === role : false;
  };

  /**
   * Check if user has a specific role in a specific network
   */
  const hasRoleInNetwork = (role: string, networkName: string): boolean => {
    if (!userRoles) return false;

    const network = userRoles.networks.find(
      n => n.network_name === networkName
    );
    return network ? network.role_name === role : false;
  };

  /**
   * Get all groups the user belongs to
   */
  const getUserGroups = (): UserRole[] => {
    return userRoles?.groups || [];
  };

  /**
   * Get all networks the user belongs to
   */
  const getUserNetworks = (): UserRole[] => {
    return userRoles?.networks || [];
  };

  /**
   * Check if user is admin (has any admin role)
   */
  const isAdmin = (): boolean => {
    return allRoles.some(role => role.toLowerCase().includes('admin'));
  };

  /**
   * Check if user is super admin
   */
  const isSuperAdmin = (): boolean => {
    return allRoles.some(role => role.toLowerCase().includes('super_admin'));
  };

  /**
   * Check if user has a specific permission in the active group
   */
  const hasPermissionInActiveGroup = (permission: string): boolean => {
    if (!userRoles || !activeGroup) return false;

    const group = userRoles.groups.find(
      g => g.group_name === activeGroup.title
    );
    return group ? group.permissions.includes(permission) : false;
  };

  /**
   * Check if user has any of the specified permissions in the active group
   */
  const hasAnyPermissionInActiveGroup = (permissions: string[]): boolean => {
    return permissions.some(permission =>
      hasPermissionInActiveGroup(permission)
    );
  };

  /**
   * Check if user has all of the specified permissions in the active group
   */
  const hasAllPermissionsInActiveGroup = (permissions: string[]): boolean => {
    return permissions.every(permission =>
      hasPermissionInActiveGroup(permission)
    );
  };

  /**
   * Check if user has a specific role in the active group
   */
  const hasRoleInActiveGroup = (role: string): boolean => {
    if (!userRoles || !activeGroup) return false;

    const group = userRoles.groups.find(
      g => g.group_name === activeGroup.title
    );
    return group ? group.role_name === role : false;
  };

  /**
   * Check if user can access admin panel (AIRQO_ADMIN role + @airqo.net email)
   */
  const canAccessAdminPanel = (): boolean => {
    return hasRole('AIRQO_ADMIN') && !!user?.email?.endsWith('@airqo.net');
  };

  return {
    // Data
    userRoles,
    allPermissions,
    allRoles,

    // Loading state
    isLoading,
    error,

    // Permission checks
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,

    // Role checks
    hasRole,
    hasAnyRole,

    // Group-specific checks
    hasPermissionInGroup,
    hasRoleInGroup,

    // Network-specific checks
    hasPermissionInNetwork,
    hasRoleInNetwork,

    // Utility functions
    getUserGroups,
    getUserNetworks,
    isAdmin,
    isSuperAdmin,
    canAccessAdminPanel,

    // Active group permission checks
    hasPermissionInActiveGroup,
    hasAnyPermissionInActiveGroup,
    hasAllPermissionsInActiveGroup,
    hasRoleInActiveGroup,
  };
};
