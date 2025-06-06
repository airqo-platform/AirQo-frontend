import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setUserInfo } from '@/lib/store/services/account/LoginSlice';
import logger from '../../lib/logger';

export default function withNextAuth(Component) {
  return function WithNextAuthComponent(props) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const dispatch = useDispatch();
    useEffect(() => {
      if (status === 'loading') return; // Still loading

      if (status === 'unauthenticated') {
        // User is not authenticated, redirect to login
        router.push('/user/login');
        return;
      }

      if (session?.user) {
        // Update Redux store with session data
        dispatch(setUserInfo(session.user));

        // Store session data in localStorage for compatibility
        localStorage.setItem('loggedUser', JSON.stringify(session.user));

        // Create activeGroup from session data
        const activeGroup = {
          _id: session.user.organization,
          organization: session.user.organization,
          long_organization: session.user.long_organization,
        };
        localStorage.setItem('activeGroup', JSON.stringify(activeGroup));
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
