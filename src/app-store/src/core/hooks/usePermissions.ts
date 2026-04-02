'use client';

import { useMemo } from 'react';
import { permissionService } from '@/core/permissions/permissionService';
import { useUserAccess } from '@/core/hooks/useUserAccess';
import type { Permission, RoleName } from '@/core/permissions/constants';
import type { UserDetails } from '@/app/types/users';

export interface PermissionContext {
  resourceContext?: {
    organizationId?: string;
    deviceId?: string;
    siteId?: string;
    userId?: string;
  };
}

const getAllRoles = (userDetails: UserDetails | null): RoleName[] => {
  if (!userDetails) return [];

  const groupRoles =
    userDetails.groups?.map(group => group.role?.role_name).filter(Boolean) ?? [];
  const networkRoles =
    userDetails.networks?.map(network => network.role?.role_name).filter(Boolean) ?? [];

  return [...groupRoles, ...networkRoles] as RoleName[];
};

export const usePermissions = (context?: PermissionContext) => {
  const { userDetails, loading } = useUserAccess();

  const userRoles = useMemo(() => getAllRoles(userDetails), [userDetails]);

  const userRole = useMemo(() => {
    if (!userDetails) return undefined;
    const organizationId = context?.resourceContext?.organizationId;
    if (organizationId) {
      return permissionService.getUserRole(userDetails, organizationId) as RoleName | undefined;
    }
    return undefined;
  }, [context?.resourceContext?.organizationId, userDetails]);

  const hasPermission = useMemo(() => {
    return (permission: Permission) => {
      if (!userDetails || !permission) return false;
      return permissionService.hasPermission(userDetails, permission, {
        resourceContext: context?.resourceContext,
      });
    };
  }, [context?.resourceContext, userDetails]);

  const hasAnyPermission = useMemo(() => {
    return (permissions: Permission[]) => {
      if (!userDetails || !permissions?.length) return false;
      return permissions.some(permission =>
        permissionService.hasPermission(userDetails, permission, {
          resourceContext: context?.resourceContext,
        })
      );
    };
  }, [context?.resourceContext, userDetails]);

  return {
    loading,
    userDetails,
    userRoles,
    userRole,
    hasPermission,
    hasAnyPermission,
  };
};
