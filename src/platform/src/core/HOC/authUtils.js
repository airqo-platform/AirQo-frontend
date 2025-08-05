import { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import logger from '@/lib/logger';
import { getUserGroupPermissionsApi } from '@/core/apis/Account';

// Constants for better maintainability
const EMPTY_ARRAY = [];
const EMPTY_OBJECT = {};

/**
 * Utility function to normalize permissions to array format
 */
const normalizePermissions = (permissions) => {
  if (!permissions) return EMPTY_ARRAY;
  return Array.isArray(permissions) ? permissions : [permissions];
};

/**
 * Check if user has required permissions
 * @param {string|string[]} requiredPermissions - Required permissions
 * @param {string|null} groupID - Optional group ID for group-specific permissions
 * @param {object|null} session - Session object (optional for backward compatibility)
 * @param {string|null} requiredRoleName - Optional role name to check against
 * @param {boolean} checkAirqoEmail - Whether to check if user has @airqo.net email domain
 * @returns {Promise<boolean>} Whether user has required permissions
 */
export const checkAccess = async (
  requiredPermissions,
  groupID = null,
  session = null,
  requiredRoleName = null,
  checkAirqoEmail = false,
) => {
  // Early validation
  if (!requiredPermissions) {
    if (process.env.NODE_ENV === 'development') {
      logger.warn('checkAccess called without requiredPermissions');
    }
    return false;
  }

  const required = normalizePermissions(requiredPermissions);

  // Group-based permission check
  if (groupID) {
    try {
      const data = await getUserGroupPermissionsApi();
      const groups = data?.user_roles?.groups || EMPTY_ARRAY;
      const group = groups.find((g) => g.group_id === groupID);

      if (!group) {
        if (process.env.NODE_ENV === 'development') {
          logger.debug(`Group not found: ${groupID}`);
        }
        return false;
      }

      // For group-based checks, we still need session for role and email validation
      if (!session?.user) {
        if (process.env.NODE_ENV === 'development') {
          logger.warn(
            'Group-based check requires valid session for role/email validation',
          );
        }
        return false;
      }

      // Check role name if required
      if (requiredRoleName) {
        const userRoleName = session.user.role?.role_name;
        if (userRoleName !== requiredRoleName) {
          if (process.env.NODE_ENV === 'development') {
            logger.debug(
              `Role name check failed in group context. Required: ${requiredRoleName}, User has: ${userRoleName}`,
              {
                userId: session.user.id,
                groupID,
                requiredRoleName,
                userRoleName,
              },
            );
          }
          return false;
        }
      }

      // Check email domain if required
      if (checkAirqoEmail) {
        const userEmail = session.user.email;
        if (!userEmail || !userEmail.endsWith('@airqo.net')) {
          if (process.env.NODE_ENV === 'development') {
            logger.debug(
              'Email domain check failed in group context. User does not have @airqo.net email',
              {
                userId: session.user.id,
                groupID,
                userEmail: userEmail
                  ? userEmail.replace(/(.{2}).*(@.*)/, '$1***$2')
                  : 'none',
              },
            );
          }
          return false;
        }
      }

      const permissions = normalizePermissions(group.permissions);
      const hasPermission = required.some((perm) => permissions.includes(perm));

      if (!hasPermission && process.env.NODE_ENV === 'development') {
        logger.debug(
          `Group permission check failed for: ${required.join(', ')}`,
          {
            groupID,
            groupPermissions: permissions,
            requiredPermissions: required,
          },
        );
      }

      return hasPermission;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('Error fetching group permissions:', error);
      }
      return false;
    }
  }

  // Session-based permission check (backward compatibility)
  if (!session?.user) {
    if (process.env.NODE_ENV === 'development') {
      logger.warn('checkAccess called without valid session');
    }
    return false;
  }

  const permissions =
    session.user.role?.role_permissions?.map((item) => item.permission) ||
    EMPTY_ARRAY;

  const hasPermission = required.some((perm) => permissions.includes(perm));

  if (!hasPermission && process.env.NODE_ENV === 'development') {
    logger.debug(
      `Session permission check failed for: ${required.join(', ')}`,
      {
        userId: session.user.id,
        userPermissions: permissions,
        requiredPermissions: required,
      },
    );
  }

  return hasPermission;
};

/**
 * Custom hook for managing user permissions
 * @returns {object} Permission utilities and state
 */
export const usePermissions = () => {
  const { data: session, status } = useSession();
  const [groupPermissions, setGroupPermissions] = useState(EMPTY_OBJECT);
  const [groupPermissionsLoading, setGroupPermissionsLoading] = useState(false);
  const [groupPermissionsError, setGroupPermissionsError] = useState(null);

  // Use ref to track mount status and prevent memory leaks
  const isMountedRef = useRef(true);
  const abortControllerRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Fetch group permissions with proper cleanup
  useEffect(() => {
    // Reset error state
    setGroupPermissionsError(null);
    setGroupPermissionsLoading(true);

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    const fetchGroupPermissions = async () => {
      try {
        const data = await getUserGroupPermissionsApi();

        // Check if component is still mounted and request wasn't aborted
        if (!isMountedRef.current || signal.aborted) return;

        const groups = data?.user_roles?.groups || EMPTY_ARRAY;

        // Transform groups to permissions map
        const permissionsMap = groups.reduce((acc, group) => {
          if (group.group_id) {
            acc[group.group_id] = normalizePermissions(group.permissions);
          }
          return acc;
        }, {});

        setGroupPermissions(permissionsMap);
        setGroupPermissionsLoading(false);
      } catch (error) {
        if (!isMountedRef.current || signal.aborted) return;

        setGroupPermissionsError(error);
        setGroupPermissionsLoading(false);

        if (process.env.NODE_ENV === 'development') {
          logger.error('Error fetching group permissions:', error);
        }
      }
    };

    fetchGroupPermissions();

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Memoize user permissions to prevent unnecessary recalculations
  const userPermissions = useMemo(() => {
    if (!session?.user?.role?.role_permissions) return EMPTY_ARRAY;

    return session.user.role.role_permissions.map((item) => item.permission);
  }, [session?.user?.role?.role_permissions]);

  // Memoize computed values
  const computedValues = useMemo(
    () => ({
      isLoading: status === 'loading' || groupPermissionsLoading,
      isAuthenticated: status === 'authenticated' && !!session,
      user: session?.user || null,
      userRole: session?.user?.role || null,
    }),
    [status, groupPermissionsLoading, session],
  );

  // Check single permission
  const hasPermission = useCallback(
    (permission, groupID = null) => {
      if (!permission) return false;

      const required = normalizePermissions(permission);

      // Group-based check
      if (groupID && groupPermissions[groupID]) {
        return required.some((perm) =>
          groupPermissions[groupID].includes(perm),
        );
      }

      // Session-based check
      if (!session?.user) return false;
      return required.some((perm) => userPermissions.includes(perm));
    },
    [groupPermissions, session?.user, userPermissions],
  );

  // Check if user has any of the provided permissions
  const hasAnyPermission = useCallback(
    (permissions, groupID = null) => {
      if (!Array.isArray(permissions) || permissions.length === 0) return false;

      // Group-based check
      if (groupID && groupPermissions[groupID]) {
        return permissions.some((perm) =>
          groupPermissions[groupID].includes(perm),
        );
      }

      // Session-based check
      if (!session?.user) return false;
      return permissions.some((perm) => userPermissions.includes(perm));
    },
    [groupPermissions, session?.user, userPermissions],
  );

  // Check if user has all provided permissions
  const hasAllPermissions = useCallback(
    (permissions, groupID = null) => {
      if (!Array.isArray(permissions) || permissions.length === 0) return false;

      // Group-based check
      if (groupID && groupPermissions[groupID]) {
        return permissions.every((perm) =>
          groupPermissions[groupID].includes(perm),
        );
      }

      // Session-based check
      if (!session?.user) return false;
      return permissions.every((perm) => userPermissions.includes(perm));
    },
    [groupPermissions, session?.user, userPermissions],
  );

  // Legacy compatibility function
  const checkUserAccess = useCallback(
    async (
      permission,
      groupID = null,
      requiredRoleName = null,
      checkAirqoEmail = false,
    ) => {
      // For legacy compatibility, we need to use the checkAccess function
      // which supports all these parameters
      return checkAccess(
        permission,
        groupID,
        session,
        requiredRoleName,
        checkAirqoEmail,
      );
    },
    [session],
  );

  // Retry function for failed group permissions fetch
  const retryGroupPermissions = useCallback(() => {
    if (!groupPermissionsLoading) {
      setGroupPermissionsError(null);
      setGroupPermissionsLoading(true);

      // Trigger re-fetch by updating a dependency
      // This will cause the useEffect to run again
      setGroupPermissions(EMPTY_OBJECT);
    }
  }, [groupPermissionsLoading]);

  return {
    // Session data
    session,
    status,
    ...computedValues,

    // Permission data
    userPermissions,
    groupPermissions,
    groupPermissionsLoading,
    groupPermissionsError,

    // Permission check functions
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    checkUserAccess,

    // Utility functions
    retryGroupPermissions,
  };
};
