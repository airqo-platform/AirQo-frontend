"use client";

import React from "react";
import { useAppSelector } from "@/core/redux/hooks";
import { useHasAnyPermission } from "@/core/hooks/usePermissions";
import { Permission } from "@/core/permissions/constants";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ForbiddenError } from "@/components/ui/forbidden-error";
import { useUserContext } from "@/core/hooks/useUserContext";
import { UserContext } from "@/core/redux/slices/userSlice";

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

  if (!permission && !permissions?.length) {
    throw new Error('RouteGuard requires either a permission or permissions prop');
  }

  // Merge both props into a single array so one hook call handles both cases,
  // avoiding the empty-string workaround previously needed for the singular prop.
  const effectivePermissions = [
    ...(permission ? [permission] : []),
    ...(permissions ?? []),
  ];

  const hasPermissionAccess = useHasAnyPermission(effectivePermissions, { resourceContext });

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
