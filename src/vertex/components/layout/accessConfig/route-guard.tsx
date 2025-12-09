"use client";

import React from "react";
import { usePermission, usePermissionCheck, useUserRole } from "@/core/hooks/usePermissions";
import { Permission, RoleName } from "@/core/permissions/constants";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ForbiddenError } from "@/components/ui/forbidden-error";
import { useUserContext } from "@/core/hooks/useUserContext";
import { UserContext } from "@/core/redux/slices/userSlice";

interface RouteGuardProps {
  permission?: Permission;
  role?: RoleName;
  roles?: RoleName[];
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
  role,
  roles,
  children,
  redirectTo = "/unauthorized",
  showError = true,
  allowedContexts,
  resourceContext,
}) => {
  const router = useRouter();
  const { userContext, isLoading } = useUserContext();
  const hasPermission = usePermission(permission || '' as Permission, { resourceContext });
  const permissionCheck = usePermissionCheck(permission || '' as Permission, { resourceContext });
  const userRole = useUserRole(resourceContext?.organizationId);

  // Validate that at least one access control method is specified
  if (!permission && !role && !roles) {
    throw new Error('RouteGuard requires either permission, role, or roles prop');
  }

  // Check role-based access
  const hasRoleAccess = React.useMemo(() => {
    if (!role && !roles) return false;
    if (!userRole) return false;

    if (role) {
      return userRole === role;
    }

    if (roles && roles.length > 0) {
      return roles.includes(userRole as RoleName);
    }

    return false;
  }, [role, roles, userRole]);

  // Check permission-based access
  const hasPermissionAccess = permission ? hasPermission : false;

  const hasValidContext = !allowedContexts || (userContext !== null && allowedContexts.includes(userContext));

  const hasAccess = hasValidContext && (hasPermissionAccess || hasRoleAccess);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!hasAccess && !showError) {
      router.push(redirectTo);
    }
  }, [hasAccess, isLoading, router, redirectTo, showError]);

  if (isLoading) {
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

// Higher-order component for route-level role protection
export const withRouteRole = (
  role: RoleName,
  redirectTo?: string,
  organizationId?: string
) => {
  return <P extends object>(Component: React.ComponentType<P>) => {
    const WrappedComponent = (props: P) => {
      const userRole = useUserRole(organizationId);
      const router = useRouter();

      useEffect(() => {
        if (userRole !== role) {
          router.push(redirectTo || "/unauthorized");
        }
      }, [userRole, router]);

      if (userRole !== role) {
        return null;
      }

      return <Component {...props} />;
    };

    WrappedComponent.displayName = `withRouteRole(${Component.displayName || Component.name})`;
    return WrappedComponent;
  };
};

