"use client";

import React from "react";
import { usePermissionCheck } from "@/core/hooks/usePermissions";
import { Permission } from "@/core/permissions/constants";
import { ForbiddenError } from "@/components/ui/forbidden-error";

interface PermissionGuardProps {
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showError?: boolean;
  resourceContext?: {
    organizationId?: string;
    deviceId?: string;
    siteId?: string;
    userId?: string;
  };
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permission,
  children,
  fallback,
  showError = false,
  resourceContext,
}) => {
  // usePermissionCheck already returns hasPermission — no need for a second usePermission call.
  const permissionCheck = usePermissionCheck(permission, { resourceContext });

  if (permissionCheck.hasPermission) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (showError) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <ForbiddenError message={permissionCheck.reason || "You don't have access rights to this page."} />
      </div>
    );
  }

  return null;
};
