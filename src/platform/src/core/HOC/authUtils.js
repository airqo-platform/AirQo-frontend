import { useMemo } from 'react';
import { useSession } from 'next-auth/react';
import logger from '@/lib/logger';

export const checkAccess = (requiredPermission, session = null) => {
  if (!requiredPermission) {
    if (process.env.NODE_ENV === 'development') {
      logger.warn('checkAccess called without requiredPermission');
    }
    return false;
  }

  if (!session) {
    if (process.env.NODE_ENV === 'development') {
      logger.warn('checkAccess called without session');
    }
    return false;
  }

  if (!session.user) {
    if (process.env.NODE_ENV === 'development') {
      logger.warn('checkAccess called with session but no user data');
    }
    return false;
  }

  const permissions =
    session.user.role?.role_permissions?.map((item) => item.permission) || [];
  const hasPermission = permissions.includes(requiredPermission);

  if (!hasPermission && process.env.NODE_ENV === 'development') {
    logger.debug(`Permission check failed for: ${requiredPermission}`, {
      userId: session.user.id,
      userPermissions: permissions,
    });
  }

  return hasPermission;
};

export const usePermissions = () => {
  const { data: session, status } = useSession();

  const userPermissions = useMemo(() => {
    return (
      session?.user?.role?.role_permissions?.map((item) => item.permission) ||
      []
    );
  }, [session]);

  const hasPermission = useMemo(
    () => (permission) => {
      if (!permission || !session) return false;
      return checkAccess(permission, session);
    },
    [session],
  );

  const hasAnyPermission = useMemo(
    () => (permissions) => {
      if (!Array.isArray(permissions) || !session) return false;
      return permissions.some((permission) => checkAccess(permission, session));
    },
    [session],
  );

  const hasAllPermissions = useMemo(
    () => (permissions) => {
      if (!Array.isArray(permissions) || !session) return false;
      return permissions.every((permission) =>
        checkAccess(permission, session),
      );
    },
    [session],
  );

  return useMemo(
    () => ({
      session,
      status,
      isLoading: status === 'loading',
      isAuthenticated: status === 'authenticated' && !!session,
      user: session?.user || null,
      userRole: session?.user?.role || null,
      userPermissions,
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
      checkUserAccess: (permission) => checkAccess(permission, session),
    }),
    [
      session,
      status,
      userPermissions,
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
    ],
  );
};
