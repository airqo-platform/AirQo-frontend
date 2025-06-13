'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setUserInfo } from '@/lib/store/services/account/LoginSlice';
import { setActiveGroup } from '@/lib/store/services/groups';
import { checkAccess } from './authUtils';
import {
  validateClientSession,
  logSessionValidation,
  extractOrgSlug,
  getRoutePathForGroup,
} from '@/core/utils/sessionUtils';
import logger from '@/lib/logger';

const AuthLoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="SecondaryMainloader" aria-label="Loading"></div>
  </div>
);

export const withAuth = (Component, options = {}) => {
  const { type = 'user', permissions = [] } = options;

  return function WithAuthComponent(props) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const dispatch = useDispatch();
    const [isValidating, setIsValidating] = useState(true);

    useEffect(() => {
      const validateAndRedirect = async () => {
        try {
          if (status === 'loading') return;

          const validation = validateClientSession(session, pathname);
          logSessionValidation(validation, `WithAuth ${type} validation`);

          if (type === 'userAuth' || type === 'orgAuth') {
            if (status === 'authenticated' && session?.user) {
              // Determine route based on active group
              const activeGroup = session?.user?.activeGroup;
              const groupTitle = activeGroup?.grp_title || 'airqo';

              if (type === 'userAuth') {
                const appropriateRoute = getRoutePathForGroup(
                  groupTitle,
                  '/user/Home',
                );
                router.replace(appropriateRoute);
                return;
              } else if (type === 'orgAuth') {
                const appropriateRoute = getRoutePathForGroup(
                  groupTitle,
                  '/org/airqo/dashboard',
                );
                router.replace(appropriateRoute);
                return;
              }
            }
            setIsValidating(false);
            return;
          }

          if (!validation.isValid) {
            if (validation.redirectPath) {
              router.replace(validation.redirectPath);
              return;
            }
          }

          if (permissions.length > 0 && session?.user) {
            const permissionArray = Array.isArray(permissions)
              ? permissions
              : [permissions];
            const hasAllPermissions = permissionArray.every((permission) =>
              checkAccess(permission, session),
            );

            if (!hasAllPermissions) {
              router.replace('/permission-denied');
              return;
            }
          }

          if (session?.user && validation.isValid) {
            try {
              dispatch(setUserInfo(session.user));

              if (type === 'organization' && session.user.organization) {
                const orgSlug = extractOrgSlug(pathname) || 'airqo';
                const orgGroup = {
                  _id: session.user.organization,
                  organization: session.user.organization,
                  long_organization: session.user.long_organization,
                  role: session.user.privilege || null,
                  orgSlug: orgSlug,
                };
                dispatch(setActiveGroup(orgGroup));
              } else if (session.user.activeGroup) {
                dispatch(setActiveGroup(session.user.activeGroup));
              }
            } catch (error) {
              logger.error('Error updating Redux store:', error);
            }
          }

          setIsValidating(false);
        } catch (error) {
          logger.error('Auth validation error:', error);
          if (type === 'organization') {
            const orgSlug = extractOrgSlug(pathname) || 'airqo';
            router.replace(`/org/${orgSlug}/login`);
          } else {
            router.replace('/user/login');
          }
        }
      };

      validateAndRedirect();
    }, [session, status, pathname, router, dispatch, type]);

    if (status === 'loading' || isValidating) {
      return <AuthLoadingSpinner />;
    }

    return <Component {...props} />;
  };
};

export const withUserAuth = (Component, options = {}) => {
  return withAuth(Component, { ...options, type: 'user' });
};

export const withOrgAuth = (Component, options = {}) => {
  return withAuth(Component, { ...options, type: 'organization' });
};

export const withUserAuthRoute = (Component) => {
  return withAuth(Component, { type: 'userAuth' });
};

export const withOrgAuthRoute = (Component) => {
  return withAuth(Component, { type: 'orgAuth' });
};

export const withPermission = (
  Component,
  requiredPermissions,
  options = {},
) => {
  return withAuth(Component, {
    ...options,
    permissions: requiredPermissions,
  });
};

export const withUserPermission = (Component, requiredPermissions) => {
  return withAuth(Component, {
    type: 'user',
    permissions: requiredPermissions,
  });
};

export const withOrgPermission = (Component, requiredPermissions) => {
  return withAuth(Component, {
    type: 'organization',
    permissions: requiredPermissions,
  });
};

export default withAuth;
