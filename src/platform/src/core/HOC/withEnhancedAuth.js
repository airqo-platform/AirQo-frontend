'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setUserInfo } from '@/lib/store/services/account/LoginSlice';
import { setActiveGroup } from '@/lib/store/services/activeGroup/ActiveGroupSlice';
import { checkAccess } from './authUtils';
import {
  validateClientSession,
  logSessionValidation,
  SESSION_TYPES,
} from '@/core/utils/sessionUtils';
import logger from '@/lib/logger';

/**
 * Loading component for authentication checks
 */
const AuthLoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="SecondaryMainloader" aria-label="Loading"></div>
  </div>
);

/**
 * Enhanced HOC for protecting user routes using professional session utilities
 * @param {React.Component} Component - The component to wrap
 * @param {Object} options - Configuration options
 * @param {string|string[]} options.permissions - Required permissions
 * @param {boolean} options.strictSession - Whether to enforce strict session validation
 * @returns {React.Component} The wrapped component with enhanced authentication
 */
export const withEnhancedUserAuth = (Component, options = {}) => {
  const { permissions = [], strictSession = true } = options;

  return function WithEnhancedUserAuth(props) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const dispatch = useDispatch();
    const [isValidating, setIsValidating] = useState(true);

    useEffect(() => {
      const validateAndRedirect = async () => {
        try {
          if (status === 'loading') return;

          // Use professional session validation
          const validation = await validateClientSession(session, pathname);

          // Log validation for debugging
          logSessionValidation(validation, 'Enhanced User Auth Validation');

          // Check if validation failed
          if (!validation.isValid) {
            if (validation.redirectPath) {
              logger.warn(`User auth validation failed: ${validation.reason}`);
              router.replace(validation.redirectPath);
              return;
            }
          }

          // Verify session type for user routes
          if (strictSession && validation.sessionType !== SESSION_TYPES.USER) {
            logger.warn('Invalid session type for user route');
            router.replace('/user/login');
            return;
          }

          // Check permissions if specified
          if (permissions.length > 0 && session?.user) {
            const permissionArray = Array.isArray(permissions)
              ? permissions
              : [permissions];
            const hasAllPermissions = permissionArray.every((permission) =>
              checkAccess(permission, session),
            );

            if (!hasAllPermissions) {
              logger.warn(
                `User lacks required permissions: ${permissionArray.join(', ')}`,
              );
              router.replace('/permission-denied');
              return;
            }
          }

          // Update Redux store with validated session data
          if (session?.user && validation.isValid) {
            try {
              dispatch(setUserInfo(session.user));
              if (session.user.activeGroup) {
                dispatch(setActiveGroup(session.user.activeGroup));
              }
              logger.debug('User session data synchronized with Redux');
            } catch (error) {
              logger.error('Error updating Redux store:', error);
            }
          }

          setIsValidating(false);
        } catch (error) {
          logger.error('Enhanced user auth validation error:', error);
          router.replace('/user/login');
        }
      };

      validateAndRedirect();
    }, [session, status, pathname, router, dispatch, strictSession]);

    // Show loading during validation
    if (status === 'loading' || isValidating) {
      return <AuthLoadingSpinner />;
    }

    // Render component only when fully validated
    return <Component {...props} />;
  };
};

/**
 * Enhanced HOC for protecting organization routes using professional session utilities
 * @param {React.Component} Component - The component to wrap
 * @param {Object} options - Configuration options
 * @param {string|string[]} options.permissions - Required permissions
 * @param {boolean} options.strictSession - Whether to enforce strict session validation
 * @returns {React.Component} The wrapped component with enhanced authentication
 */
export const withEnhancedOrgAuth = (Component, options = {}) => {
  const { permissions = [], strictSession = true } = options;

  return function WithEnhancedOrgAuth(props) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const dispatch = useDispatch();
    const [isValidating, setIsValidating] = useState(true);

    useEffect(() => {
      const validateAndRedirect = async () => {
        try {
          if (status === 'loading') return;

          // Use professional session validation
          const validation = await validateClientSession(session, pathname);

          // Log validation for debugging
          logSessionValidation(validation, 'Enhanced Org Auth Validation');

          // Check if validation failed
          if (!validation.isValid) {
            if (validation.redirectPath) {
              logger.warn(`Org auth validation failed: ${validation.reason}`);
              router.replace(validation.redirectPath);
              return;
            }
          }

          // Verify session type for organization routes
          if (
            strictSession &&
            validation.sessionType !== SESSION_TYPES.ORGANIZATION
          ) {
            logger.warn('Invalid session type for organization route');
            const orgSlug = validation.orgSlug || 'airqo';
            router.replace(`/org/${orgSlug}/login`);
            return;
          }

          // Check permissions if specified
          if (permissions.length > 0 && session?.user) {
            const permissionArray = Array.isArray(permissions)
              ? permissions
              : [permissions];
            const userPermissions = session.user.role?.role_permissions || [];

            const hasAllPermissions = permissionArray.every((permission) => {
              return userPermissions.some((p) => p.permission === permission);
            });

            if (!hasAllPermissions) {
              logger.warn(
                `User lacks required org permissions: ${permissionArray.join(', ')}`,
              );
              router.replace('/permission-denied');
              return;
            }
          }

          // Update Redux store with validated session data
          if (session?.user && validation.isValid) {
            try {
              dispatch(setUserInfo(session.user));

              // Set organization as active group
              if (session.user.organization) {
                const orgGroup = {
                  _id: session.user.organization,
                  organization: session.user.organization,
                  long_organization: session.user.long_organization,
                  role: session.user.role || null,
                  orgSlug: validation.orgSlug,
                };
                dispatch(setActiveGroup(orgGroup));
              }

              logger.debug('Organization session data synchronized with Redux');
            } catch (error) {
              logger.error('Error updating Redux store:', error);
            }
          }

          setIsValidating(false);
        } catch (error) {
          logger.error('Enhanced org auth validation error:', error);
          const orgSlug = pathname.match(/^\/org\/([^/]+)/)?.[1] || 'airqo';
          router.replace(`/org/${orgSlug}/login`);
        }
      };

      validateAndRedirect();
    }, [session, status, pathname, router, dispatch, strictSession]);

    // Show loading during validation
    if (status === 'loading' || isValidating) {
      return <AuthLoadingSpinner />;
    }

    // Render component only when fully validated
    return <Component {...props} />;
  };
};

/**
 * Enhanced HOC for auth routes (login/register pages) using professional session utilities
 * Redirects to appropriate dashboard if user is already authenticated
 * @param {React.Component} Component - The component to wrap
 * @param {string} routeType - 'user' or 'organization'
 * @returns {React.Component} The wrapped component with enhanced auth route protection
 */
export const withEnhancedAuthRoute = (Component, routeType = 'user') => {
  return function WithEnhancedAuthRoute(props) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const [isValidating, setIsValidating] = useState(true);

    useEffect(() => {
      const validateAndRedirect = async () => {
        try {
          if (status === 'loading') return;

          // If user is authenticated, redirect to appropriate dashboard
          if (status === 'authenticated' && session?.user) {
            const validation = await validateClientSession(session, pathname);

            logSessionValidation(validation, 'Enhanced Auth Route Validation');

            const sessionType = validation.sessionType;

            // Redirect authenticated users to their appropriate dashboard
            if (routeType === 'user' && sessionType === SESSION_TYPES.USER) {
              logger.info(
                'User already authenticated, redirecting to dashboard',
              );
              router.replace('/user/Home');
              return;
            } else if (
              routeType === 'organization' &&
              sessionType === SESSION_TYPES.ORGANIZATION
            ) {
              const orgSlug = validation.orgSlug || 'airqo';
              logger.info(
                'Organization user already authenticated, redirecting to dashboard',
              );
              router.replace(`/org/${orgSlug}/dashboard`);
              return;
            }
          }

          setIsValidating(false);
        } catch (error) {
          logger.error('Enhanced auth route validation error:', error);
          setIsValidating(false);
        }
      };

      validateAndRedirect();
    }, [session, status, pathname, router, routeType]);

    // Show loading during validation
    if (status === 'loading' || isValidating) {
      return <AuthLoadingSpinner />;
    }

    // Render component for unauthenticated users or different session types
    return <Component {...props} />;
  };
};

/**
 * Utility function to create enhanced HOCs with specific configurations
 */
export const createEnhancedAuthHOC = (type, options = {}) => {
  switch (type) {
    case 'user':
      return (Component) => withEnhancedUserAuth(Component, options);
    case 'organization':
      return (Component) => withEnhancedOrgAuth(Component, options);
    case 'userAuthRoute':
      return (Component) => withEnhancedAuthRoute(Component, 'user');
    case 'orgAuthRoute':
      return (Component) => withEnhancedAuthRoute(Component, 'organization');
    default:
      throw new Error(`Unknown enhanced auth HOC type: ${type}`);
  }
};

// Export individual HOCs for backward compatibility
export default withEnhancedUserAuth;
