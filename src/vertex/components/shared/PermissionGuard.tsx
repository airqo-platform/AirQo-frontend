'use client';

import React, { useMemo } from 'react';
import { ShieldOff } from 'lucide-react';
import { useRBAC } from '@/core/hooks/useRBAC';

interface PermissionGuardProps {
  children: React.ReactNode;

  /** User must have ANY of these permissions. */
  requiredPermissions?: string[];

  /** User must have ALL of these permissions. */
  requiredAllPermissions?: string[];

  /**
   * Same as requiredPermissions but scoped only to the currently active group.
   * Use when a feature should only unlock if the active org grants the capability,
   * regardless of what other orgs the user belongs to.
   */
  requiredPermissionsInActiveGroup?: string[];

  /** ALL of the listed permissions must be present in the active group. */
  requiredAllPermissionsInActiveGroup?: string[];

  /** Shown while permissions are still resolving. Pass a skeleton to avoid layout shift. */
  loadingComponent?: React.ReactNode;

  /** Replaces the default AccessDenied message entirely. */
  fallback?: React.ReactNode;

  /** Title shown inside the default inline AccessDenied. */
  accessDeniedTitle?: string;

  /** Body text shown inside the default inline AccessDenied. */
  accessDeniedMessage?: string;
}

const InlineAccessDenied: React.FC<{
  title?: string;
  message?: string;
}> = ({
  title = 'Access Restricted',
  message = 'You do not have permission to view this content.',
}) => (
  <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
    <ShieldOff className="h-8 w-8 text-muted-foreground opacity-40" />
    <p className="text-sm font-medium text-muted-foreground">{title}</p>
    <p className="text-xs text-muted-foreground/70">{message}</p>
  </div>
);

/**
 * PermissionGuard — inline component-level permission gate.
 *
 * Wraps any subtree and hides it until permissions have resolved, then either
 * renders children or shows an AccessDenied fallback. Use this for feature-level
 * gating inside already-protected pages (buttons, modals, sections).
 *
 * For page-level protection (full route redirect + context enforcement)
 * continue using RouteGuard in the layout.
 *
 * @example
 * <PermissionGuard
 *   requiredPermissions={[PERMISSIONS.DEVICE.DEPLOY]}
 *   loadingComponent={<Skeleton className="h-10 w-32" />}
 * >
 *   <DeployDeviceButton />
 * </PermissionGuard>
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  requiredPermissions,
  requiredAllPermissions,
  requiredPermissionsInActiveGroup,
  requiredAllPermissionsInActiveGroup,
  loadingComponent,
  fallback,
  accessDeniedTitle,
  accessDeniedMessage,
}) => {
  const {
    isLoading,
    hasAnyPermission,
    hasAllPermissions,
    hasAnyPermissionInActiveGroup,
    hasAllPermissionsInActiveGroup,
  } = useRBAC();

  const hasAccess = useMemo(() => {
    if (requiredPermissions && !hasAnyPermission(requiredPermissions)) return false;
    if (requiredAllPermissions && !hasAllPermissions(requiredAllPermissions)) return false;
    if (
      requiredPermissionsInActiveGroup &&
      !hasAnyPermissionInActiveGroup(requiredPermissionsInActiveGroup)
    )
      return false;
    if (
      requiredAllPermissionsInActiveGroup &&
      !hasAllPermissionsInActiveGroup(requiredAllPermissionsInActiveGroup)
    )
      return false;

    return true;
  }, [
    requiredPermissions,
    requiredAllPermissions,
    requiredPermissionsInActiveGroup,
    requiredAllPermissionsInActiveGroup,
    hasAnyPermission,
    hasAllPermissions,
    hasAnyPermissionInActiveGroup,
    hasAllPermissionsInActiveGroup,
  ]);

  if (isLoading) {
    return <>{loadingComponent ?? null}</>;
  }

  if (!hasAccess) {
    if (fallback !== undefined) return <>{fallback}</>;
    return (
      <InlineAccessDenied
        title={accessDeniedTitle}
        message={accessDeniedMessage}
      />
    );
  }

  return <>{children}</>;
};
