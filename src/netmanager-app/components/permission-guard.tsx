import { ReactNode } from "react";
import { usePermissions } from "@/core/hooks/usePermissions";

interface PermissionGuardProps {
  children: ReactNode;
  permission: string | string[];
  requireAll?: boolean;
  fallback?: ReactNode;
}

export const PermissionGuard = ({
  children,
  permission,
  requireAll = false,
  fallback = null,
}: PermissionGuardProps) => {
  const { hasPermission, hasAllPermissions, hasAnyPermission } =
    usePermissions();

  const hasAccess = Array.isArray(permission)
    ? requireAll
      ? hasAllPermissions(permission)
      : hasAnyPermission(permission)
    : hasPermission(permission);

  if (!hasAccess) {
    return fallback;
  }

  return <>{children}</>;
};
