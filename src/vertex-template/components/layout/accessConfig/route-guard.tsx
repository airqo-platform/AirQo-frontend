"use client";

import React from "react";
import { useAppSelector } from "@/core/redux/hooks";
import { usePermission, useHasAnyPermission } from "@/core/hooks/usePermissions";
import { Permission } from "@/core/permissions/constants";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ForbiddenError } from "@/components/ui/forbidden-error";
import { useUserContext } from "@/core/hooks/useUserContext";
import { UserContext } from "@/core/redux/slices/userSlice";

/**
 * Access control is permission-based only. Roles are treated as data
 * (bundles of permissions assigned to users); guards never compare role
 * names. Gate features on the permission they require instead.
 */
interface RouteGuardProps {
  permission?: Permission;
  permissions?: Permission[];
  children: React.ReactNode;
  redirectTo?: string;
  showError?: boolean;
  allowedContexts?: UserContext[];
  resourceContext?: {
    organizationId?: string;
    deviceId?: string;
    siteId?: string;
    userId?: string;
  };
}

export const RouteGuard: React.FC<RouteGuardProps> = ({
  permission,
  permissions,
  children,
  redirectTo = "/unauthorized",
  showError = true,
  allowedContexts,
  resourceContext,
}) => {
  const router = useRouter();
  const { userContext, isLoading } = useUserContext();
  const isOrganizationSwitching = useAppSelector(
    (state) => state.user.organizationSwitching.isSwitching
  );
  const hasPermission = usePermission(permission || '' as Permission, { resourceContext });
  const hasAnyPermission = useHasAnyPermission(permissions || [], { resourceContext });

  // Validate that at least one access control method is specified
  if (!permission && !permissions) {
    throw new Error('RouteGuard requires either the permission or permissions prop');
  }

  const hasPermissionAccess = permission ? hasPermission : (permissions ? hasAnyPermission : false);

  const hasValidContext = !allowedContexts || (userContext !== null && allowedContexts.includes(userContext));

  const hasAccess = hasValidContext && hasPermissionAccess;

  useEffect(() => {
    if (isLoading || isOrganizationSwitching) {
      return;
    }

    if (!hasAccess && !showError) {
      router.push(redirectTo);
    }
  }, [hasAccess, isLoading, isOrganizationSwitching, router, redirectTo, showError]);

  if (isLoading || isOrganizationSwitching) {
    return null;
  }

  if (!hasAccess) {
    if (showError) {
      return (
        <div className="flex items-center justify-center min-h-[50vh]">
          <ForbiddenError />
        </div>
      );
    }

    return null;
  }

  return <>{children}</>;
};

// Higher-order component for route-level permission protection
export const withRoutePermission = (
  permission: Permission,
  redirectTo?: string,
  resourceContext?: RouteGuardProps["resourceContext"]
) => {
  return <P extends object>(Component: React.ComponentType<P>) => {
    const WrappedComponent = (props: P) => {
      const hasPermission = usePermission(permission, { resourceContext });
      const router = useRouter();

      useEffect(() => {
        if (!hasPermission) {
          router.push(redirectTo || "/unauthorized");
        }
      }, [hasPermission, router]);

      if (!hasPermission) {
        return null;
      }

      return <Component {...props} />;
    };

    WrappedComponent.displayName = `withRoutePermission(${Component.displayName || Component.name})`;
    return WrappedComponent;
  };
};
