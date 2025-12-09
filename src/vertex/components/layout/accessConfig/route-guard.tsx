"use client";

import React from "react";
import { usePermission, usePermissionCheck, useUserRole } from "@/core/hooks/usePermissions";
import { Permission, RoleName } from "@/core/permissions/constants";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Lock } from "lucide-react";
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
        <div className="container mx-auto p-6 max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Lock className="h-5 w-5" />
                Access Denied
              </CardTitle>
              <CardDescription>
                {!hasValidContext
                  ? "This page is not available in your current context"
                  : "You don't have the required permission or role to access this page"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    {!hasValidContext && (
                      <div>
                        <strong>Required Context:</strong> {allowedContexts?.join(', ')}
                        <br />
                        <strong>Current Context:</strong> {userContext}
                      </div>
                    )}
                    {permission && !hasPermissionAccess && (
                      <>
                        <div>
                          <strong>Required Permission:</strong> {permission}
                        </div>
                        <div>
                          <strong>Reason:</strong> {permissionCheck.reason}
                        </div>
                      </>
                    )}
                    {(role || roles) && !hasRoleAccess && (
                      <>
                        <div>
                          <strong>Required Role:</strong> {role || roles?.join(', ')}
                        </div>
                        <div>
                          <strong>Your Current Role:</strong> {userRole || 'No role assigned'}
                        </div>
                      </>
                    )}
                    {permissionCheck.role && (
                      <div>
                        <strong>Current Role:</strong> {permissionCheck.role}
                      </div>
                    )}
                    {permissionCheck.organizationContext && (
                      <div>
                        <strong>Organization Context:</strong> {permissionCheck.organizationContext}
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>

              <div className="mt-4 p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">What you can do:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {!hasValidContext ? (
                    <>
                      <li>• Switch to an appropriate context using the organization picker</li>
                      <li>• Contact your administrator if you need access to this context</li>
                      <li>• Return to the dashboard to access available features</li>
                    </>
                  ) : (
                    <>
                      <li>• Contact your organization administrator to request access</li>
                      <li>• Switch to an organization where you have the required permissions</li>
                      <li>• Return to the dashboard to access available features</li>
                    </>
                  )}
                </ul>
              </div>
            </CardContent>
          </Card>
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

