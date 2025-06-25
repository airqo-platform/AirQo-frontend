import { useMemo } from 'react';
import { useSession } from 'next-auth/react';
import logger from '@/lib/logger';

/**
 * Utility function to check if a user has a specific permission.
 *
 * @param {string} requiredPermission - The permission to check for
 * @param {object|null} session - Optional session object. If not provided, returns false
 * @returns {boolean} True if user has the permission, false otherwise
 */
export const checkAccess = (requiredPermission, session = null) => {
  if (!requiredPermission) {
    // Only log in development to reduce noise
    if (process.env.NODE_ENV === 'development') {
      logger.warn('checkAccess called without requiredPermission');
    }
    return false;
  }

  if (!session) {
    // Only log in development - suppress in staging/production
    if (process.env.NODE_ENV === 'development') {
      logger.warn(
        'checkAccess called without session. Consider using withPermission HOC or useSession hook.',
      );
    }
    return false;
  }

  if (!session.user) {
    // Only log in development to reduce noise
    if (process.env.NODE_ENV === 'development') {
      logger.warn('checkAccess called with session but no user data');
    }
    return false;
  }

  const currentRole = session.user.role;
  const permissions = currentRole?.role_permissions?.map(
    (item) => item.permission,
  );

  const hasPermission = permissions?.includes(requiredPermission) ?? false;

  if (!hasPermission) {
    logger.debug(`Permission check failed for: ${requiredPermission}`, {
      userId: session.user.id,
      userPermissions: permissions,
    });
  }

  return hasPermission;
};

/**
 * Custom hook for permission management using Next.js session data.
 * Provides utilities for checking permissions and accessing user data.
 *
 * @returns {object} Object containing permission utilities and user data
 */
export const usePermissions = () => {
  const { data: session, status } = useSession();

  const userPermissions = useMemo(() => {
    if (!session?.user?.role?.role_permissions) return [];
    return session.user.role.role_permissions.map((item) => item.permission);
  }, [session]);

  const hasPermission = useMemo(() => {
    return (permission) => {
      if (!permission || !session) return false;
      return checkAccess(permission, session);
    };
  }, [session]);

  const hasAnyPermission = useMemo(() => {
    return (permissions) => {
      if (!Array.isArray(permissions) || !session) return false;
      return permissions.some((permission) => checkAccess(permission, session));
    };
  }, [session]);

  const hasAllPermissions = useMemo(() => {
    return (permissions) => {
      if (!Array.isArray(permissions) || !session) return false;
      return permissions.every((permission) =>
        checkAccess(permission, session),
      );
    };
  }, [session]);

  return {
    // Session state
    session,
    status,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated' && !!session,

    // User data
    user: session?.user || null,
    userRole: session?.user?.role || null,
    userPermissions,

    // Permission checking functions
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,

    // Utility for checking access with current session
    checkUserAccess: (permission) => checkAccess(permission, session),
  };
};
