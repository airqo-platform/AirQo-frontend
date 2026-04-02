'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ForbiddenError } from '@/components/ui/forbidden-error';
import { usePermissions } from '@/core/hooks/usePermissions';
import type { Permission, RoleName } from '@/core/permissions/constants';

interface RouteGuardProps {
  permission?: Permission;
  permissions?: Permission[];
  role?: RoleName;
  roles?: RoleName[];
  children: React.ReactNode;
  redirectTo?: string;
  showError?: boolean;
  requiresAirqoEmail?: boolean;
  resourceContext?: {
    organizationId?: string;
    deviceId?: string;
    siteId?: string;
    userId?: string;
  };
}

export function RouteGuard({
  permission,
  permissions,
  role,
  roles,
  children,
  redirectTo = '/unauthorized',
  showError = true,
  requiresAirqoEmail = false,
  resourceContext,
}: RouteGuardProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const { loading, userRoles, userRole, hasPermission, hasAnyPermission } = usePermissions({
    resourceContext,
  });

  if (!permission && !permissions && !role && !roles) {
    throw new Error('RouteGuard requires either permission, permissions, role, or roles prop');
  }

  const email =
    session?.user && 'email' in session.user ? session.user.email : undefined;
  const hasAirqoEmail =
    typeof email === 'string' && email.toLowerCase().endsWith('@airqo.net');

  const hasRoleAccess = useMemo(() => {
    if (!role && !roles) return false;

    if (role) {
      return userRole === role || userRoles.includes(role);
    }

    if (roles && roles.length > 0) {
      return roles.some(requiredRole => userRoles.includes(requiredRole));
    }

    return false;
  }, [role, roles, userRole, userRoles]);

  const hasPermissionAccess = permission
    ? hasPermission(permission)
    : permissions
      ? hasAnyPermission(permissions)
      : false;

  const hasEmailAccess = !requiresAirqoEmail || hasAirqoEmail;
  const hasAccess = hasEmailAccess && (hasPermissionAccess || hasRoleAccess);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!hasAccess && !showError) {
      router.push(redirectTo);
    }
  }, [hasAccess, loading, redirectTo, router, showError]);

  if (loading) {
    return null;
  }

  if (!hasAccess) {
    if (showError) {
      return (
        <div className="flex min-h-[50vh] items-center justify-center">
          <ForbiddenError />
        </div>
      );
    }

    return null;
  }

  return <>{children}</>;
}
