'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { checkAccess } from './authUtils';
import { setupUserSession, clearUserSession } from '@/core/utils/loginSetup';
import {
  extractOrgSlug,
  getRouteType,
  ROUTE_TYPES,
} from '@/core/utils/sessionUtils';
import LogoutOverlay from '@/common/components/LogoutOverlay';
import logger from '@/lib/logger';

/**
 * Setup loading spinner component - optimized for login setup
 */
const SetupLoadingSpinner = ({ message = 'Setting up your account...' }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-50 bg-opacity-95 backdrop-blur-sm">
    <div className="text-center p-8 bg-white rounded-lg shadow-lg border border-gray-200">
      <div
        className="SecondaryMainloader mb-4 mx-auto"
        aria-label="Loading..."
      ></div>
      <p className="text-gray-700 text-lg font-medium">{message}</p>
      <p className="text-gray-500 text-sm mt-2">Please wait...</p>
    </div>
  </div>
);

/**
 * Minimal loading spinner for auth checks
 */
const AuthLoadingSpinner = () => (
  <div className="fixed inset-0 z-40 flex items-center justify-center bg-gray-50 bg-opacity-90">
    <div className="SecondaryMainloader" aria-label="Loading..."></div>
  </div>
);

/**
 * Protection levels for different route types
 */
export const PROTECTION_LEVELS = {
  PUBLIC: 'public',
  PROTECTED: 'protected',
  AUTH_ONLY: 'auth_only',
};

/**
 * Session-aware authentication HOC with unified login setup
 */
export const withSessionAuth = (
  protectionLevel = PROTECTION_LEVELS.PROTECTED,
  options = {},
) => {
  const { permissions = [], redirectPath = null } = options;

  return (WrappedComponent) => {
    const SessionAuthComponent = (props) => {
      const { data: session, status } = useSession();
      const router = useRouter();
      const pathname = usePathname();
      const dispatch = useDispatch();
      const reduxLoginState = useSelector((state) => state.login);

      const [isReady, setIsReady] = useState(false);
      const [isSettingUp, setIsSettingUp] = useState(false);
      const [isLoggingOut, setIsLoggingOut] = useState(false);
      const [setupMessage, setSetupMessage] = useState(
        'Setting up your account...',
      );
      const [authError, setAuthError] = useState(null);
      const hasProcessed = useRef(false);

      useEffect(() => {
        // Skip if NextAuth is still loading
        if (status === 'loading') {
          return;
        }

        // Create a unique key for this auth state to detect changes
        const authStateKey = `${status}-${session?.user?.id || 'none'}-${pathname}`;

        // Prevent duplicate processing for the same auth state
        if (hasProcessed.current === authStateKey) {
          return;
        }

        hasProcessed.current = authStateKey;

        const processAuth = async () => {
          try {
            // 1. PUBLIC routes - always allow
            if (protectionLevel === PROTECTION_LEVELS.PUBLIC) {
              setIsReady(true);
              return;
            }

            // 2. UNAUTHENTICATED users
            if (status === 'unauthenticated' || !session?.user) {
              // Allow auth pages for unauthenticated users
              if (protectionLevel === PROTECTION_LEVELS.AUTH_ONLY) {
                setIsReady(true);
                return;
              }

              // Redirect to login for protected routes
              const routeType = getRouteType(pathname);
              const loginPath =
                routeType === ROUTE_TYPES.ORGANIZATION
                  ? `/org/${extractOrgSlug(pathname) || 'airqo'}/login`
                  : '/user/login';

              router.replace(loginPath);
              return;
            }

            // 3. AUTHENTICATED users
            if (status === 'authenticated' && session?.user) {
              // Redirect authenticated users away from auth pages
              if (protectionLevel === PROTECTION_LEVELS.AUTH_ONLY) {
                // Start setup process for authenticated users on auth pages
                setIsSettingUp(true);
                setSetupMessage('Setting up your workspace...');

                const setupResult = await setupUserSession(
                  session,
                  dispatch,
                  pathname,
                );

                if (setupResult.success) {
                  // Smart redirect logic - prioritize organization flow
                  let smartRedirect = redirectPath || setupResult.redirectPath;

                  // If no redirect path is set, determine based on session context and current route
                  if (!smartRedirect) {
                    const routeType = getRouteType(pathname);
                    const isOrgLogin =
                      session.isOrgLogin || session.user.isOrgLogin;
                    const sessionOrgSlug =
                      session.orgSlug || session.user.requestedOrgSlug;

                    if (isOrgLogin || routeType === ROUTE_TYPES.ORGANIZATION) {
                      // For organization logins or organization routes, redirect to org dashboard
                      const pathOrgSlug =
                        pathname.match(/\/org\/([^/]+)/)?.[1] || sessionOrgSlug;
                      if (pathOrgSlug) {
                        smartRedirect = `/org/${pathOrgSlug}/dashboard`;
                      } else {
                        smartRedirect = '/user/Home';
                      }
                    } else {
                      smartRedirect = '/user/Home';
                    }
                  }

                  router.replace(smartRedirect);
                } else {
                  throw new Error(setupResult.error || 'Setup failed');
                }
                return;
              }

              // For protected routes, do setup and validation
              if (protectionLevel === PROTECTION_LEVELS.PROTECTED) {
                // Check if we need to do setup (first time or user changed)
                const needsSetup =
                  !reduxLoginState?.userInfo ||
                  reduxLoginState.userInfo._id !== session.user.id ||
                  !reduxLoginState.success;

                if (needsSetup) {
                  setIsSettingUp(true);
                  setSetupMessage('Loading your workspace...');

                  // Run unified setup
                  const setupResult = await setupUserSession(
                    session,
                    dispatch,
                    pathname,
                  );

                  if (!setupResult.success) {
                    throw new Error(
                      setupResult.error || 'Failed to setup user session',
                    );
                  }

                  // If setup suggests a redirect, follow it
                  if (
                    setupResult.redirectPath &&
                    setupResult.redirectPath !== pathname
                  ) {
                    router.replace(setupResult.redirectPath);
                    return;
                  }
                }

                // Check permissions if required
                if (permissions.length > 0) {
                  const permissionArray = Array.isArray(permissions)
                    ? permissions
                    : [permissions];
                  const hasPermissions = permissionArray.every((permission) =>
                    checkAccess(permission, session),
                  );

                  if (!hasPermissions) {
                    router.replace('/permission-denied');
                    return;
                  }
                }

                setIsSettingUp(false);
                setIsReady(true);
              }
            }
          } catch (error) {
            logger.error('Authentication error:', error);
            setIsSettingUp(false);
            setAuthError('Authentication failed. Please try logging in again.');
          }
        };

        processAuth();
      }, [
        status,
        pathname,
        protectionLevel,
        session,
        dispatch,
        permissions,
        redirectPath,
        router,
        reduxLoginState?.success,
        reduxLoginState?.userInfo?._id,
      ]);

      // Reset processing flag when pathname changes
      useEffect(() => {
        hasProcessed.current = null; // Reset to null instead of false
        setIsReady(false);
        setIsSettingUp(false);
      }, [pathname]);

      // Reset processing flag on unmount
      useEffect(() => {
        return () => {
          hasProcessed.current = null;
        };
      }, []);

      // Show setup loading screen ONLY during actual setup operations
      if (isSettingUp) {
        return <SetupLoadingSpinner message={setupMessage} />;
      }

      // Show minimal auth loading ONLY when NextAuth is loading or initial checks
      if (status === 'loading' && !isReady) {
        return <AuthLoadingSpinner />;
      }

      // Show error state
      if (authError) {
        return (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <p className="text-red-600 mb-4">{authError}</p>
              <button
                onClick={async () => {
                  setAuthError(null);
                  hasProcessed.current = false;
                  setIsReady(false);
                  setIsLoggingOut(true);

                  try {
                    // Clear session and redirect to login
                    await clearUserSession(dispatch);
                    router.replace('/user/login');
                  } finally {
                    setIsLoggingOut(false);
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Login Again
              </button>
            </div>
          </div>
        );
      }

      return (
        <>
          <LogoutOverlay isVisible={isLoggingOut} message="Logging out..." />
          <WrappedComponent {...props} />
        </>
      );
    };

    SessionAuthComponent.displayName = `withSessionAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

    return SessionAuthComponent;
  };
};

// Convenience HOCs for common use cases
export const withAuth = (Component, options = {}) =>
  withSessionAuth(PROTECTION_LEVELS.PROTECTED, options)(Component);

export const withAuthRoute = (Component, options = {}) =>
  withSessionAuth(PROTECTION_LEVELS.AUTH_ONLY, options)(Component);

export const withPublicRoute = (Component, options = {}) =>
  withSessionAuth(PROTECTION_LEVELS.PUBLIC, options)(Component);

export const withPermission = (Component, requiredPermissions, options = {}) =>
  withSessionAuth(PROTECTION_LEVELS.PROTECTED, {
    ...options,
    permissions: requiredPermissions,
  })(Component);

// Backward compatibility aliases
export const withUserAuth = withAuth;
export const withOrgAuth = withAuth;
export const withUserAuthRoute = withAuthRoute;
export const withOrgAuthRoute = withAuthRoute;
export const withUserPermission = withPermission;
export const withOrgPermission = withPermission;

// Default export
export default withSessionAuth;
