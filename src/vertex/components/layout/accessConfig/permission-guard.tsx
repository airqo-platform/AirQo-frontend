"use client";

import React from "react";
import { usePermission, usePermissionCheck } from "@/core/hooks/usePermissions";
import { Permission } from "@/core/permissions/constants";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, AlertTriangle } from "lucide-react";

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
  const hasPermission = usePermission(permission, { resourceContext });
  const permissionCheck = usePermissionCheck(permission, { resourceContext });

  if (hasPermission) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (showError) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Access denied. {permissionCheck.reason}
          {permissionCheck.role && ` (Current role: ${permissionCheck.role})`}
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};

// Higher-order component for permission-based rendering
export const withPermission = (
  permission: Permission,
  fallback?: React.ComponentType<Record<string, unknown>>,
  resourceContext?: PermissionGuardProps["resourceContext"]
) => {
  return <P extends object>(Component: React.ComponentType<P>) => {
    const WrappedComponent = (props: P) => {
      const hasPermission = usePermission(permission, { resourceContext });

      if (!hasPermission) {
        return fallback ? <fallback {...props} /> : null;
      }

      return <Component {...props} />;
    };

    WrappedComponent.displayName = `withPermission(${Component.displayName || Component.name})`;
    return WrappedComponent;
  };
};

// Component for showing permission requirements
export const PermissionRequirement: React.FC<{
  permission: Permission;
  title?: string;
  description?: string;
}> = ({ permission, title = "Permission Required", description }) => {
  const permissionCheck = usePermissionCheck(permission);

  return (
    <Alert>
      <Shield className="h-4 w-4" />
      <AlertDescription>
        <div className="space-y-2">
          <div className="font-medium">{title}</div>
          <div className="text-sm text-muted-foreground">
            {description || `This action requires the "${permission}" permission.`}
          </div>
          {permissionCheck.role && (
            <div className="text-xs text-muted-foreground">
              Current role: {permissionCheck.role}
            </div>
          )}
          {permissionCheck.reason && (
            <div className="text-xs text-muted-foreground">
              Reason: {permissionCheck.reason}
            </div>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
};
