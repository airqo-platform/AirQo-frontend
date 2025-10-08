import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useMemo } from 'react';
import logger from '@/lib/logger';
import {
  selectPermissions,
  selectUserRoles,
  selectGroupPermissions,
  selectNetworkPermissions,
  selectPermissionsLoading,
  selectPermissionsError,
  selectIsCacheValid,
  setPermissionsLoading,
  setPermissionsData,
  setPermissionsError,
} from '@/lib/store/services/permissions/PermissionsSlice';
import { getUserGroupPermissionsApi } from '@/core/apis/Account';

/**
 * Centralized Permission Management Utilities
 *
 * This module provides a unified approach to permission checking
 * using Redux state instead of multiple API calls.
 *
 * Features:
 * - Permission checking from centralized Redux state
 * - Automatic cache management
 * - Fallback to API calls when needed
 * - Performance optimized with memoization
 */

/**
 * Main hook for permission management
 * Provides all permission-related functionality
 */
export const usePermissions = () => {
  const dispatch = useDispatch();
  const permissions = useSelector(selectPermissions);
  const userRoles = useSelector(selectUserRoles);
  const groupPermissions = useSelector(selectGroupPermissions);
  const networkPermissions = useSelector(selectNetworkPermissions);
  const isLoading = useSelector(selectPermissionsLoading);
  const error = useSelector(selectPermissionsError);
  const isCacheValid = useSelector(selectIsCacheValid);

  /**
   * Fetch permissions from API and store in Redux
   * This replaces multiple API calls throughout the app
   */
  const fetchPermissions = useCallback(
    async (force = false) => {
      // Skip if already loading
      if (isLoading) {
        logger.info('Permissions already loading, skipping fetch');
        return;
      }

      // Skip if cache is valid and not forced
      if (!force && isCacheValid && userRoles) {
        logger.info('Using cached permissions data');
        return;
      }

      try {
        dispatch(setPermissionsLoading(true));
        logger.info('Fetching user permissions from API');

        const response = await getUserGroupPermissionsApi();

        if (!response || !response.success) {
          throw new Error(response?.message || 'Failed to fetch permissions');
        }

        dispatch(setPermissionsData(response));
        logger.info('Permissions fetched and stored successfully');
      } catch (error) {
        logger.error('Error fetching permissions:', error);
        dispatch(
          setPermissionsError(error.message || 'Failed to fetch permissions'),
        );
        throw error;
      }
    },
    [dispatch, isLoading, isCacheValid, userRoles],
  );

  /**
   * Check if user has a specific permission
   * @param {string} permission - Permission to check
   * @param {string} groupId - Optional group ID to check permission for
   * @returns {boolean} - True if user has permission
   */
  const hasPermission = useCallback(
    (permission, groupId = null) => {
      if (!permission) {
        logger.warn('Permission check called with empty permission');
        return false;
      }

      // If no data is available, try to fetch it
      if (!userRoles) {
        logger.info('No permissions data available, fetching...');
        fetchPermissions().catch(() => {
          // Error already logged in fetchPermissions
        });
        return false;
      }

      // Use the selector properly with current state
      const permissionData = permissions[permission];
      if (!permissionData || !Array.isArray(permissionData)) return false;

      // If no specific group is required, check if permission exists in any group
      if (!groupId) {
        return permissionData.length > 0;
      }

      // Check if permission exists for specific group
      return permissionData.includes(groupId);
    },
    [permissions, userRoles, fetchPermissions],
  );

  /**
   * Check if user has any of the specified permissions
   * @param {string[]} permissionsList - Array of permissions to check
   * @param {string} groupId - Optional group ID to check permissions for
   * @returns {boolean} - True if user has any of the permissions
   */
  const hasAnyPermission = useCallback(
    (permissionsList, groupId = null) => {
      if (!Array.isArray(permissionsList) || permissionsList.length === 0) {
        logger.warn('hasAnyPermission called with invalid permissions list');
        return false;
      }

      return permissionsList.some((permission) =>
        hasPermission(permission, groupId),
      );
    },
    [hasPermission],
  );

  /**
   * Check if user has all of the specified permissions
   * @param {string[]} permissionsList - Array of permissions to check
   * @param {string} groupId - Optional group ID to check permissions for
   * @returns {boolean} - True if user has all permissions
   */
  const hasAllPermissions = useCallback(
    (permissionsList, groupId = null) => {
      if (!Array.isArray(permissionsList) || permissionsList.length === 0) {
        logger.warn('hasAllPermissions called with invalid permissions list');
        return false;
      }

      return permissionsList.every((permission) =>
        hasPermission(permission, groupId),
      );
    },
    [hasPermission],
  );

  /**
   * Get all permissions for a specific group
   * @param {string} groupId - Group ID to get permissions for
   * @returns {string[]} - Array of permissions for the group
   */
  const getGroupPermissions = useCallback(
    (groupId) => {
      if (!groupId || !groupPermissions) {
        return [];
      }

      const groupData = groupPermissions[groupId];
      return groupData ? groupData.permissions : [];
    },
    [groupPermissions],
  );

  /**
   * Get all permissions for a specific network
   * @param {string} networkId - Network ID to get permissions for
   * @returns {string[]} - Array of permissions for the network
   */
  const getNetworkPermissions = useCallback(
    (networkId) => {
      if (!networkId || !networkPermissions) {
        return [];
      }

      const networkData = networkPermissions[networkId];
      return networkData ? networkData.permissions : [];
    },
    [networkPermissions],
  );

  /**
   * Check if user has access to a specific group
   * @param {string} groupId - Group ID to check access for
   * @returns {boolean} - True if user has access to the group
   */
  const hasGroupAccess = useCallback(
    (groupId) => {
      if (!groupId || !userRoles) {
        return false;
      }

      // Check if user has any role in the specified group
      const groups = userRoles.user_roles?.groups || [];
      return groups.some((group) => group.group_id === groupId);
    },
    [userRoles],
  );

  /**
   * Check if user has access to a specific network
   * @param {string} networkId - Network ID to check access for
   * @returns {boolean} - True if user has access to the network
   */
  const hasNetworkAccess = useCallback(
    (networkId) => {
      if (!networkId || !userRoles) {
        return false;
      }

      // Check if user has any role in the specified network
      const networks = userRoles.user_roles?.networks || [];
      return networks.some((network) => network.network_id === networkId);
    },
    [userRoles],
  );

  /**
   * Get user's role in a specific group
   * @param {string} groupId - Group ID to get role for
   * @returns {string|null} - Role name or null if not found
   */
  const getUserRoleInGroup = useCallback(
    (groupId) => {
      if (!groupId || !userRoles) {
        return null;
      }

      const groups = userRoles.user_roles?.groups || [];
      const group = groups.find((g) => g.group_id === groupId);
      return group ? group.role_name : null;
    },
    [userRoles],
  );

  /**
   * Get user's role in a specific network
   * @param {string} networkId - Network ID to get role for
   * @returns {string|null} - Role name or null if not found
   */
  const getUserRoleInNetwork = useCallback(
    (networkId) => {
      if (!networkId || !userRoles) {
        return null;
      }

      const networks = userRoles.user_roles?.networks || [];
      const network = networks.find((n) => n.network_id === networkId);
      return network ? network.role_name : null;
    },
    [userRoles],
  );

  /**
   * Get all groups user has access to
   * @returns {Array} - Array of group objects
   */
  const getUserGroups = useCallback(() => {
    if (!userRoles) {
      return [];
    }

    return userRoles.user_roles?.groups || [];
  }, [userRoles]);

  /**
   * Get all networks user has access to
   * @returns {Array} - Array of network objects
   */
  const getUserNetworks = useCallback(() => {
    if (!userRoles) {
      return [];
    }

    return userRoles.user_roles?.networks || [];
  }, [userRoles]);

  return {
    // Data
    permissions,
    userRoles,

    // States
    isLoading,
    error,
    isCacheValid,

    // Actions
    fetchPermissions,

    // Permission checks
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,

    // Group/Network access
    hasGroupAccess,
    hasNetworkAccess,
    getGroupPermissions,
    getNetworkPermissions,
    getUserRoleInGroup,
    getUserRoleInNetwork,
    getUserGroups,
    getUserNetworks,
  };
};

/**
 * Hook for checking a single permission
 * @param {string} permission - Permission to check
 * @param {string} groupId - Optional group ID
 * @returns {boolean} - True if user has permission
 */
export const usePermission = (permission, groupId = null) => {
  const { hasPermission } = usePermissions();

  return useMemo(() => {
    return hasPermission(permission, groupId);
  }, [hasPermission, permission, groupId]);
};

/**
 * Hook for checking group permissions
 * @param {string} groupId - Group ID to check permissions for
 * @returns {Object} - Object containing group permission functions
 */
export const useGroupPermissions = (groupId) => {
  const {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getGroupPermissions,
    hasGroupAccess,
    getUserRoleInGroup,
  } = usePermissions();

  return useMemo(
    () => ({
      hasPermission: (permission) => hasPermission(permission, groupId),
      hasAnyPermission: (permissionsList) =>
        hasAnyPermission(permissionsList, groupId),
      hasAllPermissions: (permissionsList) =>
        hasAllPermissions(permissionsList, groupId),
      getPermissions: () => getGroupPermissions(groupId),
      hasAccess: () => hasGroupAccess(groupId),
      getUserRole: () => getUserRoleInGroup(groupId),
    }),
    [
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
      getGroupPermissions,
      hasGroupAccess,
      getUserRoleInGroup,
      groupId,
    ],
  );
};

/**
 * Legacy compatibility function for existing code
 * @deprecated Use usePermissions hook instead
 */
export const checkAccess = (...args) => {
  logger.warn('checkAccess is deprecated, use usePermissions hook instead');

  // Backward-compat mode: checkAccess(permission, session)
  if (
    typeof args[0] === 'string' &&
    args[1] &&
    typeof args[1] === 'object' &&
    args[1].user
  ) {
    const permission = args[0];
    const session = args[1];
    const rolePerms =
      session.user?.role?.role_permissions?.map((p) => p.permission) || [];
    return rolePerms.includes(permission);
  }

  // New mode: checkAccess(userPermissions, requiredPermissions, mode='some')
  const [userPermissions, requiredPermissions, mode = 'some'] = args;
  if (!userPermissions || !requiredPermissions) return false;

  const permissions = Array.isArray(userPermissions)
    ? userPermissions
    : [userPermissions].filter(Boolean);
  const required = Array.isArray(requiredPermissions)
    ? requiredPermissions
    : [requiredPermissions].filter(Boolean);

  if (required.length === 0 || permissions.length === 0) return false;

  return mode === 'every'
    ? required.every((perm) => permissions.includes(perm))
    : required.some((perm) => permissions.includes(perm));
};

/**
 * Permission Guard Component
 * Renders children only if user has required permissions
 */
export const PermissionGuard = ({
  children,
  permission,
  permissions,
  groupId = null,
  mode = 'some',
  fallback = null,
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } =
    usePermissions();

  const hasAccess = useMemo(() => {
    if (permission) {
      return hasPermission(permission, groupId);
    }

    if (permissions) {
      return mode === 'every'
        ? hasAllPermissions(permissions, groupId)
        : hasAnyPermission(permissions, groupId);
    }

    return false;
  }, [
    permission,
    permissions,
    groupId,
    mode,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  ]);

  return hasAccess ? children : fallback;
};

/**
 * Higher-Order Component for permission-based rendering
 * @param {React.Component} Component - Component to wrap
 * @param {Object} permissionConfig - Permission configuration
 * @returns {React.Component} - Wrapped component
 */
export const withPermissions = (Component, permissionConfig = {}) => {
  return function PermissionWrappedComponent(props) {
    const { hasPermission, hasAnyPermission, hasAllPermissions } =
      usePermissions();

    const hasAccess = useMemo(() => {
      const {
        permission,
        permissions,
        groupId,
        mode = 'some',
      } = permissionConfig;

      if (permission) {
        return hasPermission(permission, groupId);
      }

      if (permissions) {
        return mode === 'every'
          ? hasAllPermissions(permissions, groupId)
          : hasAnyPermission(permissions, groupId);
      }

      return true; // No permissions specified, allow access
    }, [hasPermission, hasAnyPermission, hasAllPermissions]);

    if (!hasAccess) {
      return permissionConfig.fallback || null;
    }

    return <Component {...props} />;
  };
};

export default usePermissions;
