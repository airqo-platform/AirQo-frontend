import { ReactNode } from "react";
import { usePermissions } from "@/core/hooks/usePermissions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { useAppSelector } from "@/core/redux/hooks";
import { Loader2 } from "lucide-react";

interface RouteGuardProps {
  children: ReactNode;
  permission: string | string[];
  requireAll?: boolean;
}

export const RouteGuard = ({
  children,
  permission,
  requireAll = false,
}: RouteGuardProps) => {
  const { hasPermission, hasAllPermissions, hasAnyPermission } =
    usePermissions();
  const isInitialized = useAppSelector((state) => state.user.isInitialized);

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const hasAccess = Array.isArray(permission)
    ? requireAll
      ? hasAllPermissions(permission)
      : hasAnyPermission(permission)
    : hasPermission(permission);

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Alert variant="destructive" className="max-w-md">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You don&apos;t have permission to access this page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
};
