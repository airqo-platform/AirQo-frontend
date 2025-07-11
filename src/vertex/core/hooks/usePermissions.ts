import { useMemo } from "react";
import { useAppSelector } from "@/core/redux/hooks";
import { permissionService, AccessContext } from "@/core/permissions/permissionService";
import { Permission, PERMISSIONS } from "@/core/permissions/constants";

// DYNAMIC MOCK PERMISSIONS FOR DEVELOPMENT/TESTING
// Control with NEXT_PUBLIC_MOCK_PERMISSIONS_ENABLED env variable (true/false)
// Mock permissions are NEVER enabled in production, even if the env variable is set.
export const MOCK_PERMISSIONS_ENABLED =
  process.env.NEXT_PUBLIC_MOCK_PERMISSIONS_ENABLED === "true" &&
  process.env.NODE_ENV !== "production";
export const MOCK_PERMISSIONS: Partial<Record<Permission, boolean>> = {
  // Example: Only allow device deploy and site create, deny device update
  [PERMISSIONS.DEVICE.DEPLOY]: true,
  [PERMISSIONS.DEVICE.UPDATE]: true,
  [PERMISSIONS.SITE.CREATE]: false,
  [PERMISSIONS.SITE.VIEW]: true,
  [PERMISSIONS.DEVICE.VIEW]: true,
  [PERMISSIONS.DEVICE.RECALL]: true
  // Add more as needed for your test scenarios
};

/**
 * Hook to check if user has a specific permission
 */
export const usePermission = (permission: Permission, context?: Partial<AccessContext>) => {
  const user = useAppSelector((state) => state.user.userDetails);
  const activeGroup = useAppSelector((state) => state.user.activeGroup);
  const activeNetwork = useAppSelector((state) => state.user.activeNetwork);

  const result = useMemo(() => {
    if (MOCK_PERMISSIONS_ENABLED) {
      // If permission is explicitly set in the mock map, use it; otherwise default to false
      return MOCK_PERMISSIONS[permission] ?? false;
    }

    if (!user) return false;

    return permissionService.hasPermission(user, permission, {
      activeOrganization: activeGroup ?? undefined,
      activeNetwork: activeNetwork ?? undefined,
      ...context,
    });
  }, [user, permission, activeGroup, activeNetwork, context]);

  return result;
};

/**
 * Hook to get detailed permission check result
 */
export const usePermissionCheck = (permission: Permission, context?: Partial<AccessContext>) => {
  const user = useAppSelector((state) => state.user.userDetails);
  const activeGroup = useAppSelector((state) => state.user.activeGroup);
  const activeNetwork = useAppSelector((state) => state.user.activeNetwork);

  return useMemo(() => {
    if (!user) {
      return {
        hasPermission: false,
        reason: "User not authenticated",
      };
    }

    return permissionService.checkPermission(user, permission, {
      activeOrganization: activeGroup ?? undefined,
      activeNetwork: activeNetwork ?? undefined,
      ...context,
    });
  }, [user, permission, activeGroup, activeNetwork, context]);
};

/**
 * Hook to get user's effective permissions
 */
export const useEffectivePermissions = (organizationId?: string) => {
  const user = useAppSelector((state) => state.user.userDetails);

  return useMemo(() => {
    if (!user) return [];
    return permissionService.getEffectivePermissions(user, organizationId);
  }, [user, organizationId]);
};

/**
 * Hook to get user's role in current organization
 */
export const useUserRole = (organizationId?: string) => {
  const user = useAppSelector((state) => state.user.userDetails);
  const activeGroup = useAppSelector((state) => state.user.activeGroup);

  return useMemo(() => {
    if (!user) return undefined;
    return permissionService.getUserRole(user, organizationId || (activeGroup?._id ?? undefined));
  }, [user, organizationId, activeGroup]);
};

/**
 * Hook to get all user roles across organizations
 */
export const useUserRoles = () => {
  const user = useAppSelector((state) => state.user.userDetails);

  return useMemo(() => {
    if (!user) return [];
    return permissionService.getUserRoles(user);
  }, [user]);
};

/**
 * Hook to check if user is super admin
 */
export const useIsSuperAdmin = () => {
  const user = useAppSelector((state) => state.user.userDetails);

  return useMemo(() => {
    if (!user) return false;
    return permissionService.isSuperAdmin(user);
  }, [user]);
};

/**
 * Hook to check if user can perform action on resource
 */
export const useCanPerformAction = (action: string, resource: unknown) => {
  const user = useAppSelector((state) => state.user.userDetails);

  return useMemo(() => {
    if (!user) return false;
    return permissionService.canPerformAction(user, action, resource);
  }, [user, action, resource]);
};

/**
 * Hook to check if user can manage organization
 */
export const useCanManageOrganization = (organizationId: string) => {
  const user = useAppSelector((state) => state.user.userDetails);

  return useMemo(() => {
    if (!user) return false;
    return permissionService.canManageOrganization(user, organizationId);
  }, [user, organizationId]);
};

/**
 * Hook to check if user can view organization
 */
export const useCanViewOrganization = (organizationId: string) => {
  const user = useAppSelector((state) => state.user.userDetails);

  return useMemo(() => {
    if (!user) return false;
    return permissionService.canViewOrganization(user, organizationId);
  }, [user, organizationId]);
};

/**
 * Hook to get permission description
 */
export const usePermissionDescription = (permission: Permission) => {
  return useMemo(() => {
    return permissionService.getPermissionDescription(permission);
  }, [permission]);
};

/**
 * Hook to check multiple permissions at once
 */
export const usePermissions = (permissions: Permission[], context?: Partial<AccessContext>) => {
  const user = useAppSelector((state) => state.user.userDetails);
  const activeGroup = useAppSelector((state) => state.user.activeGroup);
  const activeNetwork = useAppSelector((state) => state.user.activeNetwork);

  const result = useMemo(() => {
    if (MOCK_PERMISSIONS_ENABLED) {
      return permissions.reduce((acc, permission) => {
        acc[permission] = MOCK_PERMISSIONS[permission] ?? false;
        return acc;
      }, {} as Record<Permission, boolean>);
    }

    if (!user) {
      return permissions.reduce((acc, permission) => {
        acc[permission] = false;
        return acc;
      }, {} as Record<Permission, boolean>);
    }

    return permissions.reduce((acc, permission) => {
      acc[permission] = permissionService.hasPermission(user, permission, {
        activeOrganization: activeGroup ?? undefined,
        activeNetwork: activeNetwork ?? undefined,
        ...context,
      });
      return acc;
    }, {} as Record<Permission, boolean>);
  }, [user, permissions, activeGroup, activeNetwork, context]);

  return result;
};

/**
 * Hook to check if user has any of the specified permissions
 */
export const useHasAnyPermission = (permissions: Permission[], context?: Partial<AccessContext>) => {
  const user = useAppSelector((state) => state.user.userDetails);
  const activeGroup = useAppSelector((state) => state.user.activeGroup);
  const activeNetwork = useAppSelector((state) => state.user.activeNetwork);

  return useMemo(() => {
    if (!user) return false;

    return permissions.some((permission) =>
      permissionService.hasPermission(user, permission, {
        activeOrganization: activeGroup ?? undefined,
        activeNetwork: activeNetwork ?? undefined,
        ...context,
      })
    );
  }, [user, permissions, activeGroup, activeNetwork, context]);
};

/**
 * Hook to check if user has all of the specified permissions
 */
export const useHasAllPermissions = (permissions: Permission[], context?: Partial<AccessContext>) => {
  const user = useAppSelector((state) => state.user.userDetails);
  const activeGroup = useAppSelector((state) => state.user.activeGroup);
  const activeNetwork = useAppSelector((state) => state.user.activeNetwork);

  return useMemo(() => {
    if (!user) return false;

    return permissions.every((permission) =>
      permissionService.hasPermission(user, permission, {
        activeOrganization: activeGroup ?? undefined,
        activeNetwork: activeNetwork ?? undefined,
        ...context,
      })
    );
  }, [user, permissions, activeGroup, activeNetwork, context]);
};
