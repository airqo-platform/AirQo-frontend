import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setUserInfo } from '@/lib/store/services/account/LoginSlice';
import { setActiveGroup } from '@/lib/store/services/activeGroup/ActiveGroupSlice';
import logger from '@/lib/logger';

/**
 * Higher-order component for protecting organization routes
 * Ensures user is authenticated via organization session and redirects to org login if not
 * @param {React.Component} Component - The component to wrap
 * @returns {React.Component} The wrapped component with organization authentication
 */
export default function withOrgAuth(Component) {
  return function WithOrgAuthComponent(props) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const dispatch = useDispatch();

    useEffect(() => {
      if (status === 'loading') return; // Still loading

      if (status === 'unauthenticated' || !session?.user) {
        // User is not authenticated, redirect to org login
        const currentPath =
          typeof window !== 'undefined' ? window.location.pathname : '';
        const orgSlugMatch = currentPath.match(/^\/org\/([^/]+)/);
        const orgSlug = orgSlugMatch ? orgSlugMatch[1] : 'airqo';

        logger.info('User unauthenticated, redirecting to organization login');
        router.replace(`/org/${orgSlug}/login`);
        return;
      }

      // Verify this is an organization session (not user session)
      if (session.user.sessionType !== 'organization') {
        const currentPath =
          typeof window !== 'undefined' ? window.location.pathname : '';
        const orgSlugMatch = currentPath.match(/^\/org\/([^/]+)/);
        const orgSlug = orgSlugMatch ? orgSlugMatch[1] : 'airqo';

        logger.warn(
          'Invalid session type for organization route, redirecting to org login',
        );
        router.replace(`/org/${orgSlug}/login`);
        return;
      }

      // Verify user has access to the specific organization
      const currentPath =
        typeof window !== 'undefined' ? window.location.pathname : '';
      const orgSlugMatch = currentPath.match(/^\/org\/([^/]+)/);
      const currentOrgSlug = orgSlugMatch ? orgSlugMatch[1] : null;

      if (currentOrgSlug && session.user.orgSlug !== currentOrgSlug) {
        logger.warn(
          `User doesn't have access to organization: ${currentOrgSlug}`,
        );
        router.replace(`/org/${currentOrgSlug}/login`);
        return;
      }

      // Update Redux store with session data
      try {
        dispatch(setUserInfo(session.user));

        // Set organization as active group
        if (session.user.organization) {
          const orgGroup = {
            _id: session.user.organization,
            organization: session.user.organization,
            long_organization: session.user.long_organization,
            role: session.user.role || null,
          };
          dispatch(setActiveGroup(orgGroup));
        }

        logger.info('Organization session validated and Redux updated');
      } catch (error) {
        logger.error(
          'Error updating Redux store with organization session data',
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
      session?.user?.sessionType !== 'organization'
    ) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="SecondaryMainloader" aria-label="Loading"></div>
        </div>
      );
    }

    // Verify organization access and show loading if access doesn't match
    const currentPath =
      typeof window !== 'undefined' ? window.location.pathname : '';
    const orgSlugMatch = currentPath.match(/^\/org\/([^/]+)/);
    const currentOrgSlug = orgSlugMatch ? orgSlugMatch[1] : null;

    if (currentOrgSlug && session.user.orgSlug !== currentOrgSlug) {
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
 * HOC for organization routes that require specific permissions
 * @param {React.Component} Component - Component to wrap
 * @param {string} requiredPermission - Permission required to access the component
 * @returns {React.Component} Wrapped component with permission checking
 */
export const withOrgPermission = (Component, requiredPermission) => {
  return function WithOrgPermission(props) {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
      if (status === 'loading') return;

      if (status === 'unauthenticated' || !session?.user) {
        const currentPath =
          typeof window !== 'undefined' ? window.location.pathname : '';
        const orgSlugMatch = currentPath.match(/^\/org\/([^/]+)/);
        const orgSlug = orgSlugMatch ? orgSlugMatch[1] : 'airqo';
        router.replace(`/org/${orgSlug}/login`);
        return;
      }

      if (session.user.sessionType !== 'organization') {
        const currentPath =
          typeof window !== 'undefined' ? window.location.pathname : '';
        const orgSlugMatch = currentPath.match(/^\/org\/([^/]+)/);
        const orgSlug = orgSlugMatch ? orgSlugMatch[1] : 'airqo';
        router.replace(`/org/${orgSlug}/login`);
        return;
      }

      // Check organization permissions
      const userPermissions = session.user.role?.role_permissions || [];
      const hasPermission = userPermissions.some(
        (permission) => permission.permission === requiredPermission,
      );

      if (!hasPermission) {
        logger.warn(
          `User lacks required organization permission: ${requiredPermission}`,
        );
        router.replace('/permission-denied');
      }
    }, [session, status, router]);

    // Show loading while checking authentication and permissions
    if (
      status === 'loading' ||
      status === 'unauthenticated' ||
      !session?.user ||
      session?.user?.sessionType !== 'organization'
    ) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="SecondaryMainloader" aria-label="Loading"></div>
        </div>
      );
    }

    // Check organization permissions after authentication is confirmed
    const userPermissions = session.user.role?.role_permissions || [];
    const hasPermission = userPermissions.some(
      (permission) => permission.permission === requiredPermission,
    );

    if (!hasPermission) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="SecondaryMainloader" aria-label="Loading"></div>
        </div>
      );
    }

    // Only render component when fully authenticated and authorized
    return <Component {...props} />;
  };
};
