import { UserDetails, Network, Group } from "@/app/types/users";
import { PERMISSIONS, Permission, mapLegacyPermission } from "./constants";

// Access context for permission checking
export interface AccessContext {
  user: UserDetails;
  activeOrganization?: Group;
  activeNetwork?: Network;
  userRoles?: string[];
  requestedPermission: Permission;
  resourceContext?: {
    organizationId?: string;
    deviceId?: string;
    siteId?: string;
    userId?: string;
  };
}

// Permission check result with detailed information
export interface PermissionResult {
  hasPermission: boolean;
  reason?: string;
  role?: string;
  organizationContext?: string;
  canOverride?: boolean;
}

class PermissionService {
  /**
   * Check if user has permission in current context
   */
  hasPermission(user: UserDetails, permission: Permission, context?: Partial<AccessContext>): boolean {
    const result = this.checkPermission(user, permission, context);
    return result.hasPermission;
  }

  /**
 * Detailed permission check with reasoning
 */
  checkPermission(user: UserDetails, permission: Permission, context?: Partial<AccessContext>): PermissionResult {
    if (!user) {
      return { hasPermission: false, reason: "User not authenticated" };
    }

    // 0. Fast-path: respect active organization role permissions if provided in context
    const activeOrg = context?.activeOrganization;
    // Build new-permission set from active org role permissions
    const activeOrgNewPerms = new Set<Permission>();
    activeOrg?.role?.role_permissions?.forEach((rp) => {
      const perm = rp.permission as string;

      const ALL_PERMISSIONS = new Set<Permission>(
        (Object.values(PERMISSIONS) as Array<Record<string, Permission>>)
          .flatMap(group => Object.values(group))
      );

      const isNewPermission = ALL_PERMISSIONS.has(perm as Permission);

      if (isNewPermission) {
        activeOrgNewPerms.add(perm as Permission);
        return;
      }

      // Otherwise map legacy → new
      mapLegacyPermission(perm).forEach((p) => activeOrgNewPerms.add(p));
    });

    if (activeOrg && activeOrgNewPerms.has(permission)) {
      return {
        hasPermission: true,
        reason: "Granted by active organization role",
        role: activeOrg.role?.role_name,
        organizationContext: activeOrg._id,
      };
    }

    // 1. Check if user is AIRQO_SUPER_ADMIN (system-wide override)
    if (this.isSuperAdmin(user)) {
      return {
        hasPermission: true,
        reason: "User has SUPER_ADMIN role with system-wide access",
        role: "SUPER_ADMIN",
        canOverride: true,
      };
    }

    // 2. Get user's effective permissions
    const effectivePermissions = this.getEffectivePermissions(user, context?.activeOrganization?._id);

    // 3. Check direct permission
    if (effectivePermissions.includes(permission)) {
      return {
        hasPermission: true,
        reason: "User has direct permission",
        role: this.getUserRole(user, context?.activeOrganization?._id),
        organizationContext: context?.activeOrganization?._id,
      };
    }

    // 4. Fallback deny
    return {
      hasPermission: false,
      reason: `User lacks permission: ${permission}`,
      role: this.getUserRole(user, context?.activeOrganization?._id),
      organizationContext: context?.activeOrganization?._id,
    };

  }

  /**
   * Get user's effective permissions (including inherited)
   */

  getEffectivePermissions(user: UserDetails, organizationId?: string): Permission[] {
    if (!user) return [];

    const permissions = new Set<Permission>();

    // helper to add new-style permissions (handles legacy strings)
    const addPerm = (permStr: string | undefined) => {
      if (!permStr) return;
      const mapped = mapLegacyPermission(permStr);
      if (mapped.length === 0) return;
      mapped.forEach((p) => permissions.add(p));
    };

    // From user's networks
    if (user.networks) {
      user.networks.forEach((network) => {
        network.role?.role_permissions?.forEach((rp) => addPerm(rp.permission));
      });
    }

    // From user's groups
    if (user.groups) {
      user.groups.forEach((group) => {
        group.role?.role_permissions?.forEach((rp) =>
          addPerm(rp.permission)
        )
      });
    }

    if (organizationId) {
      return Array.from(permissions).filter((p) =>
        this.hasPermissionInOrganization(user, p, organizationId)
      );
    }

    return Array.from(permissions);
  }

  /**
   * Check if user can perform action on specific resource
   */
  canPerformAction(user: UserDetails, action: string, resource: { deviceId?: string; organizationId?: string }): boolean {
    // Map common actions to permissions
    const actionPermissionMap: Record<string, Permission> = {
      'view': PERMISSIONS.DEVICE.VIEW,
      'create': PERMISSIONS.DEVICE.UPDATE,
      'update': PERMISSIONS.DEVICE.UPDATE,
      'delete': PERMISSIONS.DEVICE.DELETE,
      'deploy': PERMISSIONS.DEVICE.DEPLOY,
      'maintain': PERMISSIONS.DEVICE.MAINTAIN,
      'recall': PERMISSIONS.DEVICE.RECALL,
    };

    const permission = actionPermissionMap[action.toLowerCase()];
    if (!permission) {
      return false;
    }

    return this.hasPermission(user, permission, {
      resourceContext: {
        deviceId: resource.deviceId,
        organizationId: resource.organizationId,
      },
    });
  }

  /**
   * Get user's role in specific organization
   */
  getUserRole(user: UserDetails, organizationId?: string): string | undefined {
    if (!user.networks && !user.groups) return undefined;

    // Check networks first
    if (user.networks) {
      const networkRole = user.networks.find((network) => network._id === organizationId);
      if (networkRole?.role?.role_name) {
        return networkRole.role.role_name;
      }
    }

    // Check groups
    if (user.groups) {
      const groupRole = user.groups.find((group) => group._id === organizationId);
      if (groupRole?.role?.role_name) {
        return groupRole.role.role_name;
      }
    }

    return undefined;
  }

  /**
   * Check if user is super admin
   */
  isSuperAdmin(user: UserDetails): boolean {
    if (!user.networks && !user.groups) return false;

    // Check if user has SUPER_ADMIN permission in any network
    if (user.networks) {
      return user.networks.some((network) =>
        network.role?.role_permissions?.some((p) => p.permission === PERMISSIONS.SYSTEM.SUPER_ADMIN)
      );
    }

    // Check if user has SUPER_ADMIN permission in any group
    if (user.groups) {
      return user.groups.some((group) =>
        group.role?.role_permissions?.some((p) => p.permission === PERMISSIONS.SYSTEM.SUPER_ADMIN)
      );
    }

    return false;
  }

  /**
   * Check if permission is organization-specific
   */
  isOrganizationPermission(permission: Permission): boolean {
    const orgPermissions = [
      ...Object.values(PERMISSIONS.SYSTEM),
      ...Object.values(PERMISSIONS.ORGANIZATION),
      ...Object.values(PERMISSIONS.GROUP),
      ...Object.values(PERMISSIONS.USER),
      ...Object.values(PERMISSIONS.MEMBER),
      ...Object.values(PERMISSIONS.ROLE),
      ...Object.values(PERMISSIONS.DEVICE),
      ...Object.values(PERMISSIONS.SITE),
      ...Object.values(PERMISSIONS.ANALYTICS),
      ...Object.values(PERMISSIONS.SETTINGS),
    ];

    return orgPermissions.includes(permission);
  }

  /**
   * Get user's permissions in specific organization
   */
  getOrganizationPermissions(user: UserDetails, organizationId: string): Permission[] {
    const permissions = new Set<Permission>();

    // Check networks
    if (user.networks) {
      const network = user.networks.find((n) => n._id === organizationId);
      if (network?.role?.role_permissions) {
        network.role.role_permissions.forEach((permission) => {
          if (permission.permission) {
            permissions.add(permission.permission as Permission);
          }
        });
      }
    }

    // Check groups
    if (user.groups) {
      const group = user.groups.find((g) => g._id === organizationId);
      if (group?.role?.role_permissions) {
        group.role.role_permissions.forEach((permission) => {
          if (permission.permission) {
            permissions.add(permission.permission as Permission);
          }
        });
      }
    }

    return Array.from(permissions);
  }

  /**
   * Check if user has permission in specific organization
   */
  hasPermissionInOrganization(user: UserDetails, permission: Permission, organizationId: string): boolean {
    const orgPermissions = this.getOrganizationPermissions(user, organizationId);
    return orgPermissions.includes(permission);
  }

  /**
   * Get all roles user has across organizations
   */
  getUserRoles(user: UserDetails): Array<{ role: string; organizationId: string; organizationName: string }> {
    const roles: Array<{ role: string; organizationId: string; organizationName: string }> = [];

    // Add network roles
    if (user.networks) {
      user.networks.forEach((network) => {
        if (network.role?.role_name) {
          roles.push({
            role: network.role.role_name,
            organizationId: network._id,
            organizationName: network.net_name,
          });
        }
      });
    }

    // Add group roles
    if (user.groups) {
      user.groups.forEach((group) => {
        if (group.role?.role_name) {
          roles.push({
            role: group.role.role_name,
            organizationId: group._id,
            organizationName: group.grp_title,
          });
        }
      });
    }

    return roles;
  }

  /**
   * Check if user can manage organization
   */
  canManageOrganization(user: UserDetails, organizationId: string): boolean {
    return this.hasPermission(user, PERMISSIONS.ORGANIZATION.UPDATE, {
      resourceContext: { organizationId },
    });
  }

  /**
   * Check if user can view organization
   */
  canViewOrganization(user: UserDetails, organizationId: string): boolean {
    return this.hasPermission(user, PERMISSIONS.ORGANIZATION.VIEW, {
      resourceContext: { organizationId },
    });
  }

  /**
   * Get permission description for UI
   */
  getPermissionDescription(permission: Permission): string {
    const descriptions: Record<Permission, string> = {
      [PERMISSIONS.SYSTEM.SUPER_ADMIN]: "Complete system access with ability to override any restrictions",
      [PERMISSIONS.SYSTEM.SYSTEM_ADMIN]: "System-wide administrative access",
      [PERMISSIONS.SYSTEM.DATABASE_ADMIN]: "Database administration access",

      [PERMISSIONS.ORGANIZATION.CREATE]: "Create new organizations",
      [PERMISSIONS.ORGANIZATION.VIEW]: "View organization information",
      [PERMISSIONS.ORGANIZATION.UPDATE]: "Update organization settings",
      [PERMISSIONS.ORGANIZATION.DELETE]: "Delete organizations",
      [PERMISSIONS.ORGANIZATION.APPROVE]: "Approve organization requests",
      [PERMISSIONS.ORGANIZATION.REJECT]: "Reject organization requests",

      [PERMISSIONS.GROUP.VIEW]: "View group information",
      [PERMISSIONS.GROUP.CREATE]: "Create new groups",
      [PERMISSIONS.GROUP.EDIT]: "Edit group settings",
      [PERMISSIONS.GROUP.DELETE]: "Delete groups",
      [PERMISSIONS.GROUP.MANAGEMENT]: "Full group management access",

      [PERMISSIONS.USER.VIEW]: "View user information",
      [PERMISSIONS.USER.CREATE]: "Create new users",
      [PERMISSIONS.USER.EDIT]: "Edit user information",
      [PERMISSIONS.USER.DELETE]: "Delete users",
      [PERMISSIONS.USER.MANAGEMENT]: "Full user management access",
      [PERMISSIONS.USER.INVITE]: "Invite new users",

      [PERMISSIONS.MEMBER.VIEW]: "View organization members",
      [PERMISSIONS.MEMBER.INVITE]: "Invite new members",
      [PERMISSIONS.MEMBER.REMOVE]: "Remove members",
      [PERMISSIONS.MEMBER.SEARCH]: "Search members",
      [PERMISSIONS.MEMBER.EXPORT]: "Export member data",

      [PERMISSIONS.ROLE.VIEW]: "View roles and permissions",
      [PERMISSIONS.ROLE.CREATE]: "Create new roles",
      [PERMISSIONS.ROLE.EDIT]: "Edit existing roles",
      [PERMISSIONS.ROLE.DELETE]: "Delete roles",
      [PERMISSIONS.ROLE.ASSIGNMENT]: "Assign roles to users",

      [PERMISSIONS.DEVICE.VIEW]: "View device information",
      [PERMISSIONS.DEVICE.DEPLOY]: "Deploy devices to sites",
      [PERMISSIONS.DEVICE.RECALL]: "Recall devices from deployment",
      [PERMISSIONS.DEVICE.MAINTAIN]: "Perform device maintenance",
      [PERMISSIONS.DEVICE.UPDATE]: "Update device configuration",
      [PERMISSIONS.DEVICE.DELETE]: "Delete device records",

      [PERMISSIONS.SITE.VIEW]: "View site information",
      [PERMISSIONS.SITE.CREATE]: "Create new sites",
      [PERMISSIONS.SITE.UPDATE]: "Update site information",
      [PERMISSIONS.SITE.DELETE]: "Delete sites",

      [PERMISSIONS.ANALYTICS.DASHBOARD_VIEW]: "View dashboard",
      [PERMISSIONS.ANALYTICS.ANALYTICS_VIEW]: "View analytics and reports",
      [PERMISSIONS.ANALYTICS.ANALYTICS_EXPORT]: "Export analytics data",
      [PERMISSIONS.ANALYTICS.DATA_VIEW]: "View data",
      [PERMISSIONS.ANALYTICS.DATA_EXPORT]: "Export data",
      [PERMISSIONS.ANALYTICS.DATA_COMPARE]: "Compare data across sources",

      [PERMISSIONS.SETTINGS.VIEW]: "View system settings",
      [PERMISSIONS.SETTINGS.EDIT]: "Edit system settings",
      [PERMISSIONS.SETTINGS.GROUP_SETTINGS]: "Manage group-specific settings",
    };

    return descriptions[permission] || "Permission description not available";
  }
}

// Export singleton instance
export const permissionService = new PermissionService(); 