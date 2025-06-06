import React, { useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setUserInfo } from '@/lib/store/services/account/LoginSlice';
import { setActiveGroup } from '@/lib/store/services/activeGroup/ActiveGroupSlice';
import logger from '@/lib/logger';

/**
 * Higher-order component that ensures the wrapped component is only rendered
 * when the user is authenticated via NextAuth.
 *
 * @param {React.Component} Component - The component to wrap
 * @returns {React.Component} The wrapped component with authentication
 */
export default function withNextAuth(Component) {
  return function WithNextAuthComponent(props) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const dispatch = useDispatch();

    useEffect(() => {
      if (status === 'loading') return; // Still loading

      if (status === 'unauthenticated') {
        // User is not authenticated, redirect to login
        logger.info('User unauthenticated, redirecting to login');
        router.push('/user/login');
        return;
      }

      if (session?.user) {
        try {
          // Update Redux store with session data
          dispatch(setUserInfo(session.user));
          logger.info('User info updated in Redux store');

          // Set active group from session data in Redux instead of localStorage
          if (session.user.organization) {
            const activeGroup = {
              _id: session.user.organization,
              organization: session.user.organization,
              long_organization: session.user.long_organization,
              role: session.user.role || null,
            };
            dispatch(setActiveGroup(activeGroup));
            logger.info('Active group set in Redux store', {
              organization: session.user.organization,
            });
          }
        } catch (error) {
          logger.error('Error updating Redux store with session data', error);
        }
      }
    }, [session, status, dispatch, router]);

    // Show loading state while checking authentication
    if (status === 'loading') {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    // Render the component if the user is authenticated
    return status === 'authenticated' && session ? (
      <Component {...props} />
    ) : null;
  };
}

/**
 * Higher-order component that wraps a component with permission checking.
 * Only renders the component if the user has the required permission.
 *
 * @param {React.Component} Component - The component to wrap
 * @param {string} requiredPermission - The permission string required to access the component
 * @returns {React.Component} The wrapped component with permission checking
 */
export const withPermission = (Component, requiredPermission) => {
  return function WithPermission(props) {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
      if (status === 'loading') return; // Still loading

      // Check if user is authenticated first
      if (status === 'unauthenticated' || !session?.user) {
        logger.warn('User not authenticated, redirecting to login');
        router.push('/user/login');
        return;
      }

      // Get user role and permissions from session instead of localStorage
      const currentRole = session.user.role;
      const hasPermission = currentRole?.role_permissions?.some(
        (permission) => permission.permission === requiredPermission,
      );

      if (!hasPermission) {
        logger.warn(
          `User does not have required permission: ${requiredPermission}`,
          {
            userId: session.user.id,
            userPermissions: currentRole?.role_permissions?.map(
              (p) => p.permission,
            ),
          },
        );
        router.push('/permission-denied');
      }
    }, [requiredPermission, router, session, status]);

    // Show loading while checking authentication and permissions
    if (status === 'loading') {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    return <Component {...props} />;
  };
};

/**
 * Utility function to check if a user has a specific permission.
 *
 * @param {string} requiredPermission - The permission to check for
 * @param {object|null} session - Optional session object. If not provided, returns false
 * @returns {boolean} True if user has the permission, false otherwise
 */
export const checkAccess = (requiredPermission, session = null) => {
  if (!requiredPermission) {
    logger.warn('checkAccess called without requiredPermission');
    return false;
  }

  if (!session) {
    logger.warn(
      'checkAccess called without session. Consider using withPermission HOC or useSession hook.',
    );
    return false;
  }

  if (!session.user) {
    logger.warn('checkAccess called with session but no user data');
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
