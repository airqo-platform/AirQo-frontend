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
    error,
    hasAnyPermission,
    hasAllPermissions,
    hasAnyPermissionInActiveGroup,
    hasAllPermissionsInActiveGroup,
  } = useRBAC();

  // Warn in dev when a defined-but-empty array is passed — it will be treated as
  // "no requirement" (same as undefined). This catches accidental [] from computed
  // lists before they silently allow access in production.
  if (process.env.NODE_ENV !== 'production') {
    if (requiredPermissions !== undefined && requiredPermissions.length === 0)
      console.warn('[PermissionGuard] requiredPermissions is an empty array — treated as no requirement. Pass undefined to suppress this warning.');
    if (requiredAllPermissions !== undefined && requiredAllPermissions.length === 0)
      console.warn('[PermissionGuard] requiredAllPermissions is an empty array — treated as no requirement. Pass undefined to suppress this warning.');
    if (requiredPermissionsInActiveGroup !== undefined && requiredPermissionsInActiveGroup.length === 0)
      console.warn('[PermissionGuard] requiredPermissionsInActiveGroup is an empty array — treated as no requirement. Pass undefined to suppress this warning.');
    if (requiredAllPermissionsInActiveGroup !== undefined && requiredAllPermissionsInActiveGroup.length === 0)
      console.warn('[PermissionGuard] requiredAllPermissionsInActiveGroup is an empty array — treated as no requirement. Pass undefined to suppress this warning.');
  }

  const hasAccess = useMemo(() => {
    // A bootstrap error means permissions could not be resolved — deny conservatively.
    // This is intentionally separate from the access-denied path so callers can
    // distinguish a permission failure from an auth/context failure if needed.
    if (error) return false;

    // Empty arrays are treated as "no requirement" (same as undefined) to keep
    // hasAny and hasAll consistent — [].some() = false (deny) vs [].every() = true
    // (allow) would otherwise produce different outcomes for the same intent.
    if (requiredPermissions?.length && !hasAnyPermission(requiredPermissions)) return false;
    if (requiredAllPermissions?.length && !hasAllPermissions(requiredAllPermissions)) return false;
    if (
      requiredPermissionsInActiveGroup?.length &&
      !hasAnyPermissionInActiveGroup(requiredPermissionsInActiveGroup)
    )
      return false;
    if (
      requiredAllPermissionsInActiveGroup?.length &&
      !hasAllPermissionsInActiveGroup(requiredAllPermissionsInActiveGroup)
    )
      return false;

    return true;
  }, [
    error,
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

  // Auth/context bootstrap failed — show a distinct error state, not the
  // permission-denied message, so the user isn't confused about why they're blocked.
  if (error) {
    return (
      <InlineAccessDenied
        title="Something went wrong"
        message="Unable to verify your permissions. Please refresh the page."
      />
    );
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
