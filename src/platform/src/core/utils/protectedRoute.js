import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { useSession } from 'next-auth/react';
import LogoutUser from '@/core/utils/LogoutUser';
import logger from '../../lib/logger';

export default function withAuth(Component) {
  return function WithAuthComponent(props) {
    const dispatch = useDispatch();
    const router = useRouter();
    const { data: session, status } = useSession();
    const userCredentials = useSelector((state) => state.login);

    useEffect(() => {
      if (typeof window !== 'undefined' && status !== 'loading') {
        const storedUserGroup = localStorage.getItem('activeGroup');

        // Primary check: NextAuth session (since middleware relies on this)
        if (status === 'unauthenticated' || !session) {
          logger.info('No NextAuth session, redirecting to login');
          router.push('/account/login');
          return;
        }

        // Secondary check: Redux state (for backward compatibility)
        if (!userCredentials.success && status === 'authenticated') {
          // If NextAuth says authenticated but Redux doesn't, sync the state
          logger.info(
            'Syncing authentication state between NextAuth and Redux',
          );
          // The AuthSync component should handle this, but we can redirect as fallback
        }

        // Check for required user group in localStorage
        if (!storedUserGroup && session) {
          logger.info('No active group found, logging out');
          LogoutUser(dispatch, router);
        }
      }
    }, [userCredentials, dispatch, router, session, status]);

    // Show loading while session is being checked
    if (status === 'loading') {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    // Render the component if the user is authenticated
    // Use NextAuth session as primary source of truth since middleware depends on it
    return status === 'authenticated' && session ? (
      <Component {...props} />
    ) : null;
  };
}

export const withPermission = (Component, requiredPermission) => {
  return function WithPermission(props) {
    const router = useRouter();

    useEffect(() => {
      if (typeof window !== 'undefined') {
        const storedUserGroup = localStorage.getItem('activeGroup');
        let parsedUserGroup = {};

        if (storedUserGroup) {
          try {
            parsedUserGroup = JSON.parse(storedUserGroup);
          } catch (error) {
            logger.error(
              'Error parsing "activeGroup" from localStorage:',
              error,
            );
          }
        }

        const currentRole = parsedUserGroup?.role;
        const hasPermission = currentRole?.role_permissions?.some(
          (permission) => permission.permission === requiredPermission,
        );

        if (!hasPermission) {
          router.push('/permission-denied');
        }
      }
    }, [requiredPermission, router]);

    return <Component {...props} />;
  };
};

export const checkAccess = (requiredPermission) => {
  if (requiredPermission && typeof window !== 'undefined') {
    const storedGroupObj = localStorage.getItem('activeGroup');
    let currentRole = null;

    if (storedGroupObj) {
      try {
        const parsedGroup = JSON.parse(storedGroupObj);
        currentRole = parsedGroup?.role || null;
      } catch (error) {
        logger.error('Error parsing "activeGroup" from localStorage:', error);
      }
    }

    const permissions = currentRole?.role_permissions?.map(
      (item) => item.permission,
    );
    return permissions?.includes(requiredPermission) ?? false;
  }

  return false;
};
