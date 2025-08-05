import { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import logger from '@/lib/logger';
import { getUserGroupPermissionsApi } from '@/core/apis/Account';

// Constants
const EMPTY_ARRAY = [];
const AIRQO_EMAIL_DOMAIN = '@airqo.net';
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000;

/**
 * Normalize permissions to array format
 */
const normalizePermissions = (permissions) => {
  if (!permissions) return EMPTY_ARRAY;
  return Array.isArray(permissions) ? permissions : [permissions];
};

/**
 * Validate email domain
 */
const isValidAirqoEmail = (email) => {
  return (
    email && typeof email === 'string' && email.endsWith(AIRQO_EMAIL_DOMAIN)
  );
};

/**
 * Find user's role data for a specific group/network
 */
const findRoleData = (apiData, groupID, requiredRoleName = null) => {
  if (!apiData?.user_roles || !groupID) return null;

  const { groups = [], networks = [] } = apiData.user_roles;

  // Find all matches in groups and networks
  const allMatches = [
    ...groups.filter((g) => g.group_id === groupID),
    ...networks.filter((n) => n.network_id === groupID),
  ];

  if (allMatches.length === 0) return null;

  // If specific role required, find exact match
  if (requiredRoleName) {
    return (
      allMatches.find((item) => item.role_name === requiredRoleName) || null
    );
  }

  // Return role with most permissions
  return allMatches.sort(
    (a, b) =>
      normalizePermissions(b.permissions).length -
      normalizePermissions(a.permissions).length,
  )[0];
};

/**
 * Validate user context for permission check
 */
const validateContext = (
  session,
  checkAirqoEmail,
  roleData,
  requiredRoleName,
) => {
  // Session required
  if (!session?.user) return false;

  // Email validation
  if (checkAirqoEmail && !isValidAirqoEmail(session.user.email)) {
    return false;
  }

  // Role validation for group-based checks
  if (roleData && requiredRoleName && roleData.role_name !== requiredRoleName) {
    return false;
  }

  return true;
};

/**
 * Check permissions with enhanced security
 */
export const checkAccess = async (
  requiredPermissions,
  groupID = null,
  session = null,
  requiredRoleName = null,
  checkAirqoEmail = false,
) => {
  if (!requiredPermissions || !session?.user) return false;

  const required = normalizePermissions(requiredPermissions);

  try {
    if (groupID) {
      // Group-based check
      const apiData = await getUserGroupPermissionsApi();
      const roleData = findRoleData(apiData, groupID, requiredRoleName);

      if (
        !roleData ||
        !validateContext(session, checkAirqoEmail, roleData, requiredRoleName)
      ) {
        return false;
      }

      const permissions = normalizePermissions(roleData.permissions);
      return required.some((perm) => permissions.includes(perm));
    } else {
      // Session-based check
      if (!validateContext(session, checkAirqoEmail, null, null)) return false;

      if (
        requiredRoleName &&
        session.user.role?.role_name !== requiredRoleName
      ) {
        return false;
      }

      const permissions =
        session.user.role?.role_permissions?.map((item) => item.permission) ||
        EMPTY_ARRAY;
      return required.some((perm) => permissions.includes(perm));
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      logger.error('Permission check failed:', error);
    }
    return false;
  }
};

/**
 * Enhanced permissions hook
 */
export const usePermissions = () => {
  const { data: session, status } = useSession();
  const [permissionsData, setPermissionsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const isMountedRef = useRef(true);
  const abortControllerRef = useRef(null);

  // Cleanup
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      abortControllerRef.current?.abort();
    };
  }, []);

  // Fetch permissions
  const fetchPermissions = useCallback(async (attempt = 0) => {
    if (!isMountedRef.current) return;

    setError(null);
    setLoading(true);

    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    try {
      const data = await getUserGroupPermissionsApi();
      if (!isMountedRef.current) return;

      setPermissionsData(data);
      setLoading(false);
      setRetryCount(0);
    } catch (err) {
      if (!isMountedRef.current) return;

      const isNetworkError =
        err.name === 'NetworkError' || err.code === 'NETWORK_ERROR';
      const shouldRetry = isNetworkError && attempt < MAX_RETRY_ATTEMPTS;

      if (shouldRetry) {
        setTimeout(
          () => {
            if (isMountedRef.current) {
              setRetryCount(attempt + 1);
              fetchPermissions(attempt + 1);
            }
          },
          RETRY_DELAY * Math.pow(2, attempt),
        );
      } else {
        setError(err);
        setLoading(false);
        setRetryCount(attempt);
      }
    }
  }, []);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  // Memoized values
  const userPermissions = useMemo(() => {
    return (
      session?.user?.role?.role_permissions?.map((item) => item.permission) ||
      EMPTY_ARRAY
    );
  }, [session?.user?.role?.role_permissions]);

  const isAuthenticated = status === 'authenticated' && !!session;
  const isLoading = status === 'loading' || loading;

  // Core permission check function
  const checkPermission = useCallback(
    (
      permissions,
      groupID = null,
      requiredRoleName = null,
      checkAirqoEmail = false,
      mode = 'any', // 'any', 'all', 'single'
    ) => {
      if (!session?.user) return false;

      // Email validation
      if (checkAirqoEmail && !isValidAirqoEmail(session.user.email)) {
        return false;
      }

      const required = normalizePermissions(permissions);
      if (required.length === 0) return false;

      if (groupID && permissionsData) {
        // Group-based check
        const roleData = findRoleData(
          permissionsData,
          groupID,
          requiredRoleName,
        );
        if (!roleData) return false;

        const rolePermissions = normalizePermissions(roleData.permissions);

        switch (mode) {
          case 'all':
            return required.every((perm) => rolePermissions.includes(perm));
          case 'single':
          case 'any':
          default:
            return required.some((perm) => rolePermissions.includes(perm));
        }
      } else {
        // Session-based check
        if (
          requiredRoleName &&
          session.user.role?.role_name !== requiredRoleName
        ) {
          return false;
        }

        switch (mode) {
          case 'all':
            return required.every((perm) => userPermissions.includes(perm));
          case 'single':
          case 'any':
          default:
            return required.some((perm) => userPermissions.includes(perm));
        }
      }
    },
    [session, permissionsData, userPermissions],
  );

  // Permission check methods
  const hasPermission = useCallback(
    (permission, groupID, requiredRoleName, checkAirqoEmail) =>
      checkPermission(
        permission,
        groupID,
        requiredRoleName,
        checkAirqoEmail,
        'single',
      ),
    [checkPermission],
  );

  const hasAnyPermission = useCallback(
    (permissions, groupID, requiredRoleName, checkAirqoEmail) =>
      checkPermission(
        permissions,
        groupID,
        requiredRoleName,
        checkAirqoEmail,
        'any',
      ),
    [checkPermission],
  );

  const hasAllPermissions = useCallback(
    (permissions, groupID, requiredRoleName, checkAirqoEmail) =>
      checkPermission(
        permissions,
        groupID,
        requiredRoleName,
        checkAirqoEmail,
        'all',
      ),
    [checkPermission],
  );

  const checkUserAccess = useCallback(
    async (permission, groupID, requiredRoleName, checkAirqoEmail) =>
      checkAccess(
        permission,
        groupID,
        session,
        requiredRoleName,
        checkAirqoEmail,
      ),
    [session],
  );

  const retryPermissions = useCallback(() => {
    if (!loading && isMountedRef.current) {
      fetchPermissions(0);
    }
  }, [loading, fetchPermissions]);

  return {
    // State
    session,
    status,
    isLoading,
    isAuthenticated,
    user: session?.user || null,
    userRole: session?.user?.role || null,
    userPermissions,
    error,
    retryCount,

    // Methods
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    checkUserAccess,
    retryPermissions,

    // Utils
    isValidAirqoEmail,
  };
};
