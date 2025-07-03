"use client";

import React from "react";
import { usePermission, usePermissionCheck } from "@/core/hooks/usePermissions";
import { Permission } from "@/core/permissions/constants";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Lock } from "lucide-react";

interface RouteGuardProps {
  permission: Permission;
  children: React.ReactNode;
  redirectTo?: string;
  showError?: boolean;
  resourceContext?: {
    organizationId?: string;
    deviceId?: string;
    siteId?: string;
    userId?: string;
  };
}

export const RouteGuard: React.FC<RouteGuardProps> = ({
  permission,
  children,
  redirectTo = "/unauthorized",
  showError = true,
  resourceContext,
}) => {
  const router = useRouter();
  const hasPermission = usePermission(permission, { resourceContext });
  const permissionCheck = usePermissionCheck(permission, { resourceContext });

  useEffect(() => {
    if (!hasPermission) {
      router.push(redirectTo);
    }
  }, [hasPermission, router, redirectTo]);

  if (!hasPermission) {
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
                You don&apos;t have permission to access this page
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <div>
                      <strong>Required Permission:</strong> {permission}
                    </div>
                    <div>
                      <strong>Reason:</strong> {permissionCheck.reason}
                    </div>
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
                  <li>• Contact your organization administrator to request access</li>
                  <li>• Switch to an organization where you have the required permissions</li>
                  <li>• Return to the dashboard to access available features</li>
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
      }, [hasPermission, router, redirectTo]);

      if (!hasPermission) {
        return null;
      }

      return <Component {...props} />;
    };

    WrappedComponent.displayName = `withRoutePermission(${Component.displayName || Component.name})`;
    return WrappedComponent;
  };
};
