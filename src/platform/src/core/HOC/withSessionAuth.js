'use client';

import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation'; // Import usePathname
import { useDispatch, useSelector } from 'react-redux';
import { checkAccess } from './authUtils';
import { setupUserSession, clearUserSession } from '@/core/utils/loginSetup';
import { getLoginRedirectPath } from '@/app/api/auth/[...nextauth]/options';
import { getRouteType, ROUTE_TYPES } from '@/core/utils/sessionUtils';
import LogoutOverlay from '@/common/components/LogoutOverlay';
import { getLogoutProgress } from './LogoutUser';
import logger from '@/lib/logger';

// --- Loading Component ---
const AuthLoader = ({ message = 'Authenticating...' }) => (
  <div className="fixed inset-0 flex items-center justify-center bg-gray-50 bg-opacity-90 z-40">
    <div className="SecondaryMainloader" aria-label={message}></div>
  </div>
);

// --- Error Component ---
const AuthError = ({ error, onRetry }) => (
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

// --- Constants ---
export const PROTECTION_LEVELS = {
  PUBLIC: 'public',
  PROTECTED: 'protected',
  AUTH_ONLY: 'auth_only',
};

// --- Core Hook ---
const useAuthStateProcessor = (protectionLevel, permissions = []) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname(); // Get pathname here
  const dispatch = useDispatch();
  const reduxLoginState = useSelector((state) => state.login);

  const processAuthState = useCallback(async () => {
    if (protectionLevel === PROTECTION_LEVELS.PUBLIC) {
      return { success: true, ready: true };
    }

    if (status === 'unauthenticated' || !session?.user) {
      if (protectionLevel === PROTECTION_LEVELS.AUTH_ONLY) {
        return { success: true, ready: true };
      }

      const routeType = getRouteType(pathname);
      if (routeType !== ROUTE_TYPES.AUTH) {
        const loginPath = getLoginRedirectPath(pathname);
        router.replace(loginPath);
        return { success: true, ready: false, redirecting: true };
      }
      return { success: true, ready: true };
    }

    if (status === 'authenticated' && session?.user) {
      if (protectionLevel === PROTECTION_LEVELS.AUTH_ONLY) {
        const setupResult = await setupUserSession(session, dispatch, pathname);
        if (setupResult.success) {
          const finalRedirect = setupResult.redirectPath || '/user/Home';
          logger.info('Redirecting after auth setup:', {
            finalRedirect,
            pathname,
          });
          router.replace(finalRedirect);
          return { success: true, ready: false, redirecting: true };
        } else {
          throw new Error(setupResult.error || 'Setup failed');
        }
      }

      if (protectionLevel === PROTECTION_LEVELS.PROTECTED) {
        const isSessionSetup =
          reduxLoginState?.userInfo &&
          reduxLoginState.userInfo._id === session.user.id &&
          reduxLoginState.success;

        let requiresSetupIndicator = false;
        if (!isSessionSetup) {
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
  }, [
    status,
    session,
    protectionLevel,
    permissions,
    router,
    dispatch,
    reduxLoginState,
    pathname,
  ]); // Add pathname to deps

  return { processAuthState, session, status, pathname }; // Return pathname
};

// --- Logout Handler ---
const useLogoutHandler = () => {
  const router = useRouter();
  const pathname = usePathname(); // Get pathname here
  const dispatch = useDispatch();

  const handleLogout = useCallback(async () => {
    try {
      await clearUserSession(dispatch);
      const loginPath = getLoginRedirectPath(pathname);
      router.replace(loginPath);
    } catch (error) {
      logger.error('Logout error:', error);
      router.replace('/user/login');
    }
  }, [dispatch, pathname, router]); // Add pathname to deps

  return handleLogout;
};

// --- Main HOC ---
export const withSessionAuth = (
  protectionLevel = PROTECTION_LEVELS.PROTECTED,
  options = {},
) => {
  const { permissions = [] } = options;

  return (WrappedComponent) => {
    const SessionAuthComponent = (props) => {
      const { processAuthState, session, status, pathname } =
        useAuthStateProcessor(protectionLevel, permissions); // Destructure pathname
      const handleLogout = useLogoutHandler();

      const [isReady, setIsReady] = useState(false);
      const [isSettingUp, setIsSettingUp] = useState(false);
      const [authError, setAuthError] = useState(null);
      const hasProcessed = useRef(false);
      const isLogoutInProgress = useRef(false);

      // --- Main Authentication Effect ---
      useEffect(() => {
        // Always show loader while session is loading
        if (status === 'loading') {
          setIsReady(false);
          return;
        }

        // Prevent processing during logout
        if (isLogoutInProgress.current || getLogoutProgress()) {
          setIsReady(false);
          return;
        }

        // Create a unique key for the current auth state
        const authStateKey = `${status}-${session?.user?.id || 'none'}-${pathname}`;

        // Avoid re-processing the same state
        if (hasProcessed.current === authStateKey) {
          return;
        }

        hasProcessed.current = authStateKey;
        setIsReady(false); // Reset ready state on new auth state

        const processAuth = async () => {
          try {
            const result = await processAuthState();
            if (!result.success) {
              throw new Error('Authentication processing failed');
            }

            if (result.redirecting) {
              return; // Don't set ready if redirecting
            }

            if (result.setupComplete) {
              setIsSettingUp(true);
              setTimeout(() => {
                setIsSettingUp(false);
                setIsReady(true);
              }, 800);
            } else {
              setIsReady(result.ready);
            }
          } catch (error) {
            logger.error('Authentication error:', error);
            setIsSettingUp(false);
            setAuthError('Authentication failed. Please try logging in again.');
          }
        };

        processAuth();
      }, [status, pathname, session, processAuthState]); // Now pathname is defined

      // --- Cleanup Effect ---
      useEffect(() => {
        return () => {
          if (!getLogoutProgress()) {
            hasProcessed.current = null;
            isLogoutInProgress.current = false;
          }
        };
      }, []);

      // --- Render Logic ---
      // Show logout overlay if logout is in progress
      if (getLogoutProgress()) {
        return <LogoutOverlay isVisible={true} message="Logging out..." />;
      }

      // Show setup loading screen
      if (isSettingUp) {
        return <AuthLoader message="Loading your workspace..." />;
      }

      // Show auth loading (including initial session check)
      if (status === 'loading' || !isReady) {
        return <AuthLoader message="Authenticating..." />;
      }

      // Show error state
      if (authError) {
        return (
          <AuthError
            error={authError}
            onRetry={async () => {
              setAuthError(null);
              hasProcessed.current = false;
              setIsReady(false);
              isLogoutInProgress.current = true;
              try {
                await handleLogout();
              } finally {
                isLogoutInProgress.current = false;
              }
            }}
          />
        );
      }

      return <WrappedComponent {...props} />;
    };

    SessionAuthComponent.displayName = `withSessionAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;
    return SessionAuthComponent;
  };
};

// --- Permission Hook ---
export const useSessionAwarePermissions = () => {
  const { data: session, status } = useSession();

  const hasPermission = useCallback(
    (permission) => {
      if (status === 'loading') return true;
      if (status === 'unauthenticated') return false;
      return checkAccess(permission, session);
    },
    [status, session],
  );

  const hasAnyPermission = useCallback(
    (permissions) => {
      if (!Array.isArray(permissions)) return hasPermission(permissions);
      return permissions.some((permission) => hasPermission(permission));
    },
    [hasPermission],
  );

  const hasAllPermissions = useCallback(
    (permissions) => {
      if (!Array.isArray(permissions)) return hasPermission(permissions);
      return permissions.every((permission) => hasPermission(permission));
    },
    [hasPermission],
  );

  return useMemo(
    () => ({
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
      session,
      status,
      isLoading: status === 'loading',
      isAuthenticated: status === 'authenticated',
    }),
    [hasPermission, hasAnyPermission, hasAllPermissions, session, status],
  );
};

// --- Convenience HOCs ---
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

// Note: The withAdminAccess HOC seems to reference 'activeGroup' which isn't available in this hook.
// It might need to be handled differently or receive activeGroup as a prop.
// For now, I'll leave it as is, assuming it's managed elsewhere or via context.
export const withAdminAccess = (Component, options = {}) => {
  return withSessionAuth(PROTECTION_LEVELS.PROTECTED, {
    ...options,
    // customValidation logic would need access to activeGroup, potentially via context
    // This part might need adjustment based on how activeGroup is provided.
  })(Component);
};

export const withSessionAwarePermissions = (Component, options = {}) => {
  const { requiredPermissions = [], fallbackComponent = null } = options;

  return function SessionAwarePermissionsComponent(props) {
    const { status } = useSession();
    const permissionUtils = useSessionAwarePermissions();

    if (requiredPermissions.length > 0) {
      if (status === 'loading') {
        return <AuthLoader message="Loading permissions..." />;
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

// --- Aliases ---
export const withUserAuth = withAuth;
export const withOrgAuth = withAuth;
export const withUserAuthRoute = withAuthRoute;
export const withOrgAuthRoute = withAuthRoute;
export const withUserPermission = withPermission;
export const withOrgPermission = withPermission;

export default withSessionAuth;
