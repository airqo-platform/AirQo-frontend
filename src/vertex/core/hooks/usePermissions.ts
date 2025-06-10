import { useAppSelector } from "@/core/redux/hooks";

export const usePermissions = () => {
  const currentRole = useAppSelector((state) => state.user.currentRole);

  const hasPermission = (requiredPermission: string) => {
    return currentRole?.permissions.includes(requiredPermission) ?? false;
  };

  const hasAnyPermission = (requiredPermissions: string[]) => {
    return requiredPermissions.some((permission) => hasPermission(permission));
  };

  const hasAllPermissions = (requiredPermissions: string[]) => {
    return requiredPermissions.every((permission) => hasPermission(permission));
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
};
