import { useMemo, useCallback } from 'react';
import { useAppSelector } from '@/core/redux/hooks';
import { permissionService } from '@/core/permissions/permissionService';
import { Permission, PERMISSIONS, mapLegacyPermission } from '@/core/permissions/constants';
import { useUserContext } from '@/core/hooks/useUserContext';
import { MOCK_PERMISSIONS_ENABLED, MOCK_PERMISSIONS } from '@/core/hooks/usePermissions';

/**
 * @deprecated Use the hooks from `core/hooks/usePermissions.ts` instead.
 *
 * - For single/any/all permission checks → `usePermission`, `useHasAnyPermission`, `useHasAllPermissions`
 * - For active-group-scoped checks → pass `activeOrganization` explicitly via the context arg
 * - For loading/error state → `useUserContext()`
 *
 * Semantic difference to be aware of:
 * `usePermission` in usePermissions.ts passes `activeOrganization` to permissionService,
 * scoping the check to the active org by default. This hook's `hasPermission` omits it,
 * checking all orgs the user belongs to (global). The scoped behaviour from usePermissions.ts
 * is the canonical approach for new code.
 *
 * This hook has no consumers and will be removed in a future release.
 */
export const useRBAC = () => {
  const { isLoading, error } = useUserContext();
  const user = useAppSelector((state) => state.user.userDetails);
  const activeGroup = useAppSelector((state) => state.user.activeGroup);

  // Pre-compute the active group's resolved permission set once.
  // Mirrors permissionService.checkPermission step-0 so legacy strings are mapped.
  const activeGroupPermissions = useMemo((): Set<Permission> => {
    if (!activeGroup?.role?.role_permissions) return new Set();

    const ALL_PERMISSIONS = new Set<Permission>(
      (Object.values(PERMISSIONS) as Array<Record<string, Permission>>).flatMap(
        (group) => Object.values(group)
      )
    );

    const perms = new Set<Permission>();
    activeGroup.role.role_permissions.forEach((rp) => {
      const raw = rp.permission as string;
      if (ALL_PERMISSIONS.has(raw as Permission)) {
        perms.add(raw as Permission);
      } else {
        mapLegacyPermission(raw).forEach((p) => perms.add(p));
      }
    });

    return perms;
  }, [activeGroup]);

  // --- Single permission (all orgs + legacy mapping via permissionService) ---
  // No activeOrganization passed here — permissionService.getEffectivePermissions
  // filters to a single org when organizationId is provided, which would make this
  // identical to hasPermissionInActiveGroup. Omitting it checks all groups/networks.

  const hasPermission = useCallback(
    (permission: string): boolean => {
      if (MOCK_PERMISSIONS_ENABLED) {
        return MOCK_PERMISSIONS[permission as Permission] ?? false;
      }
      if (!user) return false;
      return permissionService.hasPermission(user, permission as Permission);
    },
    [user]
  );

  const hasAnyPermission = useCallback(
    (permissions: string[]): boolean => permissions.some((p) => hasPermission(p)),
    [hasPermission]
  );

  const hasAllPermissions = useCallback(
    (permissions: string[]): boolean => permissions.every((p) => hasPermission(p)),
    [hasPermission]
  );

  // --- Active-group-scoped checks (only the currently active org) ---

  const hasPermissionInActiveGroup = useCallback(
    (permission: string): boolean => {
      if (MOCK_PERMISSIONS_ENABLED) {
        return MOCK_PERMISSIONS[permission as Permission] ?? false;
      }
      return activeGroupPermissions.has(permission as Permission);
    },
    [activeGroupPermissions]
  );

  const hasAnyPermissionInActiveGroup = useCallback(
    (permissions: string[]): boolean =>
      permissions.some((p) => hasPermissionInActiveGroup(p)),
    [hasPermissionInActiveGroup]
  );

  const hasAllPermissionsInActiveGroup = useCallback(
    (permissions: string[]): boolean =>
      permissions.every((p) => hasPermissionInActiveGroup(p)),
    [hasPermissionInActiveGroup]
  );

  return {
    // State
    isLoading,
    error,

    // Checks across all orgs the user belongs to
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,

    // Checks scoped to the currently active group only
    hasPermissionInActiveGroup,
    hasAnyPermissionInActiveGroup,
    hasAllPermissionsInActiveGroup,
  };
};
