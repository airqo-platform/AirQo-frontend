'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { checkAccess } from './authUtils';
import { setupUserSession, clearUserSession } from '@/core/utils/loginSetup';
import { getLoginRedirectPath } from '@/app/api/auth/[...nextauth]/options'; // Import centralized logic
import { getRouteType, ROUTE_TYPES } from '@/core/utils/sessionUtils';
import LogoutOverlay from '@/common/components/LogoutOverlay';
import { getLogoutProgress } from './LogoutUser';
import logger from '@/lib/logger';

// Centralized loading components
const LoadingSpinner = ({ type = 'setup', message = 'Loading...' }) => {
  const isSetup = type === 'setup';
  const baseClasses = 'fixed inset-0 flex items-center justify-center';
  const zIndex = isSetup ? 'z-50' : 'z-40';
  const background = isSetup
    ? 'bg-gray-50 bg-opacity-95 backdrop-blur-sm'
    : 'bg-gray-50 bg-opacity-90';

  if (isSetup) {
    return (
      <div className={`${baseClasses} ${zIndex} ${background}`}>
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
  }

  return (
    <div className={`${baseClasses} ${zIndex} ${background}`}>
      <div className="SecondaryMainloader" aria-label="Loading..."></div>
    </div>
  );
};

// Centralized error component
const AuthErrorComponent = ({ error, onRetry }) => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <p className="text-red-600 mb-4">{error}</p>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Login Again
      </button>
    </div>
  </div>
);

// Protection levels
export const PROTECTION_LEVELS = {
  PUBLIC: 'public',
  PROTECTED: 'protected',
  AUTH_ONLY: 'auth_only',
};

// Centralized auth state processing
const useAuthStateProcessor = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const reduxLoginState = useSelector((state) => state.login);

  const processAuthState = async (protectionLevel, permissions = []) => {
    // 1. PUBLIC routes - always allow
    if (protectionLevel === PROTECTION_LEVELS.PUBLIC) {
      return { success: true, ready: true };
    }

    // 2. UNAUTHENTICATED users
    if (status === 'unauthenticated' || !session?.user) {
      // Allow auth pages for unauthenticated users
      if (protectionLevel === PROTECTION_LEVELS.AUTH_ONLY) {
        return { success: true, ready: true };
      }

      // Redirect to appropriate login for protected routes
      const routeType = getRouteType(pathname);
      if (routeType !== ROUTE_TYPES.AUTH) {
        const loginPath = getLoginRedirectPath(pathname);
        router.replace(loginPath);
        return { success: true, ready: false, redirecting: true };
      }

      return { success: true, ready: true };
    }

    // 3. AUTHENTICATED users
    if (status === 'authenticated' && session?.user) {
      // Redirect authenticated users away from auth pages
      if (protectionLevel === PROTECTION_LEVELS.AUTH_ONLY) {
        const setupResult = await setupUserSession(session, dispatch, pathname);

        if (setupResult.success) {
          const finalRedirect = setupResult.redirectPath || '/user/Home';
          logger.info('Redirecting after auth setup:', {
            setupRedirectPath: setupResult.redirectPath,
            finalRedirect,
            pathname,
          });
          router.replace(finalRedirect);
          return { success: true, ready: false, redirecting: true };
        } else {
          throw new Error(setupResult.error || 'Setup failed');
        }
      }

      // For protected routes, do setup and validation
      if (protectionLevel === PROTECTION_LEVELS.PROTECTED) {
        // Check if session is already properly set up
        const isSessionSetup =
          reduxLoginState?.userInfo &&
          reduxLoginState.userInfo._id === session.user.id &&
          reduxLoginState.success;

        // Only run setup if truly needed
        const needsSetup = !isSessionSetup;

        let requiresSetupIndicator = false;

        if (needsSetup) {
          requiresSetupIndicator = true;
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

          if (
            setupResult.redirectPath &&
            setupResult.redirectPath !== pathname
          ) {
            router.replace(setupResult.redirectPath);
            return { success: true, ready: false, redirecting: true };
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
            return { success: true, ready: false, redirecting: true };
          }
        }

        return {
          success: true,
          ready: true,
          setupComplete: requiresSetupIndicator,
        };
      }
    }

    return { success: true, ready: true };
  };

  return {
    processAuthState,
    session,
    status,
    pathname,
    dispatch,
    reduxLoginState,
  };
};

// Centralized logout handler
const useLogoutHandler = () => {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      await clearUserSession(dispatch);
      const loginPath = getLoginRedirectPath(pathname);
      router.replace(loginPath);
    } catch (error) {
      logger.error('Logout error:', error);
      // Fallback to user login
      router.replace('/user/login');
    }
  };

  return handleLogout;
};

// Main HOC
export const withSessionAuth = (
  protectionLevel = PROTECTION_LEVELS.PROTECTED,
  options = {},
) => {
  const { permissions = [] } = options;

  return (WrappedComponent) => {
    const SessionAuthComponent = (props) => {
      const { processAuthState, session, status, pathname } =
        useAuthStateProcessor();
      const handleLogout = useLogoutHandler();
      const [isReady, setIsReady] = useState(false);
      const [isSettingUp, setIsSettingUp] = useState(false);
      const [isLoggingOut, setIsLoggingOut] = useState(false);
      const [setupMessage, setSetupMessage] = useState(
        'Setting up your account...',
      );
      const [authError, setAuthError] = useState(null);
      const hasProcessed = useRef(false);
      const isLogoutInProgress = useRef(false);

      useEffect(() => {
        if (status === 'loading') return;
        if (isLogoutInProgress.current || getLogoutProgress()) return;

        const authStateKey = `${status}-${session?.user?.id || 'none'}-${pathname}`;
        if (hasProcessed.current === authStateKey) return;

        hasProcessed.current = authStateKey;

        const processAuth = async () => {
          try {
            const result = await processAuthState(protectionLevel, permissions);

            if (!result.success) {
              throw new Error('Authentication processing failed');
            }

            if (result.redirecting) {
              return; // Don't set ready if redirecting
            }

            // Only show setup loading if actually performing setup
            if (result.setupComplete) {
              setSetupMessage('Loading your workspace...');
              setIsSettingUp(true);
              // Brief delay to show setup message, then hide it
              setTimeout(() => {
                setIsSettingUp(false);
                setIsReady(true);
              }, 800);
            } else {
              // If no setup needed, immediately mark as ready
              setIsReady(result.ready);
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
        permissions,
        processAuthState,
      ]);

      // Reset processing flag when pathname changes (but preserve setup state)
      useEffect(() => {
        if (isLogoutInProgress.current || getLogoutProgress()) return;

        // Only reset if we're changing to a different route type or if not ready
        const currentRouteType = getRouteType(pathname);
        const prevRouteType = hasProcessed.current
          ? getRouteType(hasProcessed.current.split('-')[2])
          : null;

        if (currentRouteType !== prevRouteType || !isReady) {
          hasProcessed.current = null;
          setIsReady(false);
          // Don't reset setup state unnecessarily
          if (isSettingUp) {
            setIsSettingUp(false);
          }
        }
      }, [pathname, isReady, isSettingUp]);

      // Cleanup on unmount
      useEffect(() => {
        return () => {
          if (!getLogoutProgress()) {
            hasProcessed.current = null;
            isLogoutInProgress.current = false;
          }
        };
      }, []);

      // Show logout overlay if logout is in progress
      if (isLoggingOut || getLogoutProgress()) {
        return <LogoutOverlay isVisible={true} message="Logging out..." />;
      }

      // Show setup loading screen
      if (isSettingUp) {
        return <LoadingSpinner type="setup" message={setupMessage} />;
      }

      // Show auth loading
      if (status === 'loading' && !isReady) {
        return <LoadingSpinner type="auth" message="Authenticating..." />;
      }

      // Show error state
      if (authError) {
        return (
          <AuthErrorComponent
            error={authError}
            onRetry={async () => {
              setAuthError(null);
              hasProcessed.current = false;
              setIsReady(false);
              setIsLoggingOut(true);
              isLogoutInProgress.current = true;

              try {
                await handleLogout();
              } finally {
                setIsLoggingOut(false);
                isLogoutInProgress.current = false;
              }
            }}
          />
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

// Permission hook
export const useSessionAwarePermissions = () => {
  const { data: session, status } = useSession();

  const hasPermission = (permission) => {
    if (status === 'loading') return true;
    if (status === 'unauthenticated') return false;
    return checkAccess(permission, session);
  };

  const hasAnyPermission = (permissions) => {
    if (!Array.isArray(permissions)) return hasPermission(permissions);
    return permissions.some((permission) => hasPermission(permission));
  };

  const hasAllPermissions = (permissions) => {
    if (!Array.isArray(permissions)) return hasPermission(permissions);
    return permissions.every((permission) => hasPermission(permission));
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    session,
    status,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
  };
};

// Convenience HOCs
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

export const withAdminAccess = (Component, options = {}) => {
  return withSessionAuth(PROTECTION_LEVELS.PROTECTED, {
    ...options,
    customValidation: (session, activeGroup) => {
      if (!session?.user || !activeGroup) {
        return { isValid: false, redirectTo: '/account/login' };
      }

      const groupRole = activeGroup?.role?.role_name?.toLowerCase() || '';
      const isSuperAdmin =
        groupRole.includes('super_admin') || groupRole.includes('super admin');
      const isAirqoGroup = activeGroup?.grp_title?.toLowerCase() === 'airqo';

      if (!isSuperAdmin || !isAirqoGroup) {
        return { isValid: false, redirectTo: '/permission-denied' };
      }

      return { isValid: true };
    },
  })(Component);
};

export const withSessionAwarePermissions = (Component, options = {}) => {
  const { requiredPermissions = [], fallbackComponent = null } = options;

  return function SessionAwarePermissionsComponent(props) {
    const { status } = useSession();
    const permissionUtils = useSessionAwarePermissions();

    if (requiredPermissions.length > 0) {
      if (status === 'loading') {
        return <LoadingSpinner type="auth" message="Loading permissions..." />;
      }

      if (status === 'unauthenticated') {
        return fallbackComponent || null;
      }

      const hasRequiredPermissions = requiredPermissions.every((permission) =>
        permissionUtils.hasPermission(permission),
      );

      if (!hasRequiredPermissions) {
        return fallbackComponent || null;
      }
    }

    return <Component {...props} permissions={permissionUtils} />;
  };
};

// Backward compatibility aliases
export const withUserAuth = withAuth;
export const withOrgAuth = withAuth;
export const withUserAuthRoute = withAuthRoute;
export const withOrgAuthRoute = withAuthRoute;
export const withUserPermission = withPermission;
export const withOrgPermission = withPermission;

export default withSessionAuth;
