import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setUserInfo } from '@/lib/store/services/account/LoginSlice';
import { setActiveGroup } from '@/lib/store/services/activeGroup/ActiveGroupSlice';
import { checkAccess } from './authUtils';
import logger from '@/lib/logger';

/**
 * Higher-order component for protecting individual user routes
 * Ensures user is authenticated via user session and redirects to user login if not
 * @param {React.Component} Component - The component to wrap
 * @returns {React.Component} The wrapped component with user authentication
 */
export default function withUserAuth(Component) {
  return function WithUserAuthComponent(props) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const dispatch = useDispatch();

    useEffect(() => {
      if (status === 'loading') return; // Still loading

      if (status === 'unauthenticated' || !session?.user) {
        // User is not authenticated, redirect to user login
        logger.info('User unauthenticated, redirecting to user login');
        router.replace('/user/login');
        return;
      }

      // Verify this is a user session (not organization session)
      if (session.user.sessionType !== 'user') {
        logger.warn(
          'Invalid session type for user route, redirecting to user login',
        );
        router.replace('/user/login');
        return;
      }

      // Update Redux store with session data
      try {
        dispatch(setUserInfo(session.user));
        // Set active group from user's groups
        if (session.user.activeGroup) {
          dispatch(setActiveGroup(session.user.activeGroup));
        }
        logger.info('User session validated and Redux updated');
      } catch (error) {
        logger.error(
          'Error updating Redux store with user session data',
          error,
        );
      }
    }, [session, status, dispatch, router]);

    // Show loading state during authentication check or redirect
    // This ensures the page doesn't flash before proper authentication
    if (
      status === 'loading' ||
      status === 'unauthenticated' ||
      !session?.user ||
      session?.user?.sessionType !== 'user'
    ) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="SecondaryMainloader" aria-label="Loading"></div>
        </div>
      );
    }

    // Only render component when fully authenticated and authorized
    return <Component {...props} />;
  };
}

/**
 * Higher-order component that wraps a component with permission checking for user routes.
 * Only renders the component if the user has the required permission.
 *
 * @param {React.Component} Component - The component to wrap
 * @param {string|string[]} requiredPermissions - The permission(s) required to access the component
 * @returns {React.Component} The wrapped component with permission checking
 */
export const withPermission = (Component, requiredPermissions) => {
  return function WithPermission(props) {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
      if (status === 'loading') return; // Still loading

      // Check if user is authenticated first
      if (status === 'unauthenticated' || !session?.user) {
        logger.warn('User not authenticated, redirecting to login');
        router.replace('/user/login');
        return;
      }

      // Verify this is a user session
      if (session.user.sessionType !== 'user') {
        logger.warn(
          'Invalid session type for user route, redirecting to user login',
        );
        router.replace('/user/login');
        return;
      }

      // Check permissions
      const permissions = Array.isArray(requiredPermissions)
        ? requiredPermissions
        : [requiredPermissions];

      const hasAllPermissions = permissions.every((permission) =>
        checkAccess(permission, session),
      );

      if (!hasAllPermissions) {
        logger.warn(
          `User does not have required permissions: ${permissions.join(', ')}`,
          {
            userId: session.user.id,
            userPermissions: session.user.role?.role_permissions?.map(
              (p) => p.permission,
            ),
          },
        );
        router.replace('/permission-denied');
        return;
      }
    }, [requiredPermissions, router, session, status]); // Show loading while checking authentication and permissions
    if (
      status === 'loading' ||
      status === 'unauthenticated' ||
      !session?.user ||
      session?.user?.sessionType !== 'user'
    ) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="SecondaryMainloader" aria-label="loading"></div>
        </div>
      );
    }

    // Check permissions after authentication is confirmed
    const permissions = Array.isArray(requiredPermissions)
      ? requiredPermissions
      : [requiredPermissions];

    const hasAllPermissions = permissions.every((permission) =>
      checkAccess(permission, session),
    );

    if (!hasAllPermissions) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="SecondaryMainloader" aria-label="loading"></div>
        </div>
      );
    }

    // Only render component when fully authenticated and authorized
    return <Component {...props} />;
  };
};

/**
 * Alias for withPermission for backward compatibility
 */
export const withUserPermission = withPermission;
