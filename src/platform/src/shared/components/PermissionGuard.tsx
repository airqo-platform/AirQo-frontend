'use client';

import React, { useMemo } from 'react';
import { useRBAC } from '@/shared/hooks';
import { AccessDenied } from './AccessDenied';
import { LoadingSpinner } from '@/shared/components/ui/loading-spinner';

interface PermissionGuardProps {
  children: React.ReactNode;

  // Permission requirements (user must have ANY of these permissions)
  requiredPermissions?: string[];

  // Permission requirements (user must have ALL of these permissions)
  requiredAllPermissions?: string[];

  // Permission requirements in ACTIVE GROUP (user must have ANY of these permissions)
  requiredPermissionsInActiveGroup?: string[];

  // Permission requirements in ACTIVE GROUP (user must have ALL of these permissions)
  requiredAllPermissionsInActiveGroup?: string[];

  // Role requirements (user must have ANY of these roles)
  requiredRoles?: string[];

  // Role requirements (user must have ALL of these roles)
  requiredAllRoles?: string[];

  // Role requirements in ACTIVE GROUP
  requiredRolesInActiveGroup?: string[];

  // Special check for AIRQO admin (role + email domain)
  requireAirQoAdmin?: boolean;

  // Special check for AIRQO SUPER ADMIN (role + email domain)
  requireAirQoSuperAdmin?: boolean;

  // Custom access check function
  customCheck?: () => boolean;

  // Loading component to show while checking permissions
  loadingComponent?: React.ReactNode;

  // Access denied props
  accessDeniedTitle?: string;
  accessDeniedMessage?: string;
}

/**
 * PermissionGuard component that checks user permissions before rendering children
 * Prevents flickering by checking permissions before rendering any content
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  requiredPermissions,
  requiredAllPermissions,
  requiredPermissionsInActiveGroup,
  requiredAllPermissionsInActiveGroup,
  requiredRoles,
  requiredAllRoles,
  requiredRolesInActiveGroup,
  requireAirQoAdmin = false,
  requireAirQoSuperAdmin = false,
  customCheck,
  loadingComponent,
  accessDeniedTitle,
  accessDeniedMessage,
}) => {
  const {
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    hasAnyPermissionInActiveGroup,
    hasAllPermissionsInActiveGroup,
    hasRoleInActiveGroup,
    canAccessAdminPanel,
    isAirQoSuperAdminWithEmail,
    isLoading,
    error,
  } = useRBAC();

  // Check if user has access
  const hasAccess = useMemo(() => {
    // If there's an error loading permissions, deny access
    if (error) return false;

    // Custom check takes precedence
    if (customCheck) {
      return customCheck();
    }

    // Check AIRQO admin requirement
    if (requireAirQoAdmin && !canAccessAdminPanel()) {
      return false;
    }

    // Check AIRQO SUPER ADMIN requirement
    if (requireAirQoSuperAdmin && !isAirQoSuperAdminWithEmail()) {
      return false;
    }

    // Check required permissions (ANY)
    if (requiredPermissions && !hasAnyPermission(requiredPermissions)) {
      return false;
    }

    // Check required permissions (ALL)
    if (requiredAllPermissions && !hasAllPermissions(requiredAllPermissions)) {
      return false;
    }

    // Check required permissions in active group (ANY)
    if (
      requiredPermissionsInActiveGroup &&
      !hasAnyPermissionInActiveGroup(requiredPermissionsInActiveGroup)
    ) {
      return false;
    }

    // Check required permissions in active group (ALL)
    if (
      requiredAllPermissionsInActiveGroup &&
      !hasAllPermissionsInActiveGroup(requiredAllPermissionsInActiveGroup)
    ) {
      return false;
    }

    // Check required roles (ANY)
    if (requiredRoles && !hasAnyRole(requiredRoles)) {
      return false;
    }

    // Check required roles (ALL) - not implemented in useRBAC yet, so check individually
    if (requiredAllRoles && !requiredAllRoles.every(role => hasRole(role))) {
      return false;
    }

    // Check required roles in active group
    if (
      requiredRolesInActiveGroup &&
      !requiredRolesInActiveGroup.every(role => hasRoleInActiveGroup(role))
    ) {
      return false;
    }

    // If no specific requirements, allow access
    return true;
  }, [
    error,
    customCheck,
    requireAirQoAdmin,
    requireAirQoSuperAdmin,
    requiredPermissions,
    requiredAllPermissions,
    requiredPermissionsInActiveGroup,
    requiredAllPermissionsInActiveGroup,
    requiredRoles,
    requiredAllRoles,
    requiredRolesInActiveGroup,
    hasAnyPermission,
    hasAllPermissions,
    hasAnyPermissionInActiveGroup,
    hasAllPermissionsInActiveGroup,
    hasAnyRole,
    hasRole,
    hasRoleInActiveGroup,
    canAccessAdminPanel,
    isAirQoSuperAdminWithEmail,
  ]);

  // Show loading state while checking permissions
  if (isLoading) {
    return (
      loadingComponent || (
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner />
        </div>
      )
    );
  }

  // Show access denied if user doesn't have required permissions
  if (!hasAccess) {
    return (
      <AccessDenied title={accessDeniedTitle} message={accessDeniedMessage} />
    );
  }

  // Render protected content
  return <>{children}</>;
};

// Convenience wrapper for admin pages
export const AdminPageGuard: React.FC<{
  children: React.ReactNode;
  requireAirQoAdmin?: boolean;
  requireAirQoSuperAdmin?: boolean;
  requiredPermissions?: string[];
  requiredPermissionsInActiveGroup?: string[];
  requiredAllPermissionsInActiveGroup?: string[];
  requiredRoles?: string[];
  requiredRolesInActiveGroup?: string[];
  loadingComponent?: React.ReactNode;
}> = ({
  children,
  requireAirQoAdmin = false, // Default to not requiring AIRQO admin for admin pages
  requireAirQoSuperAdmin = false,
  requiredPermissions,
  requiredPermissionsInActiveGroup,
  requiredAllPermissionsInActiveGroup,
  requiredRoles,
  requiredRolesInActiveGroup,
  loadingComponent,
}) => {
  return (
    <PermissionGuard
      requireAirQoAdmin={requireAirQoAdmin}
      requireAirQoSuperAdmin={requireAirQoSuperAdmin}
      requiredPermissions={requiredPermissions}
      requiredPermissionsInActiveGroup={requiredPermissionsInActiveGroup}
      requiredAllPermissionsInActiveGroup={requiredAllPermissionsInActiveGroup}
      requiredRoles={requiredRoles}
      requiredRolesInActiveGroup={requiredRolesInActiveGroup}
      loadingComponent={loadingComponent}
      accessDeniedTitle="Access Denied"
      accessDeniedMessage="You do not have the required permissions to access this page."
    >
      {children}
    </PermissionGuard>
  );
};
