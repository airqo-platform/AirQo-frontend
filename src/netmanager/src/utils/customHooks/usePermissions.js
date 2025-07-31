import { useSelector } from 'react-redux';
import { useMemo } from 'react';
import { 
  hasPermission, 
  hasAnyPermission, 
  hasAllPermissions, 
  isAdmin, 
  canManageDevices, 
  canViewAnalytics,
  getPermissionsByCategory
} from '../permissions';

/**
 * Custom hook for checking user permissions
 * @returns {Object} Permission checking utilities
 */
export const usePermissions = () => {
  const currentRole = useSelector((state) => state.accessControl.currentRole);
  
  // Get permissions from role or localStorage as fallback
  const userPermissions = useMemo(() => {
    if (currentRole && currentRole.role_permissions) {
      return currentRole.role_permissions;
    }
    
    const storedRole = JSON.parse(localStorage.getItem('currentUserRole'));
    return storedRole && storedRole.role_permissions ? storedRole.role_permissions : [];
  }, [currentRole]);

  // Memoize permission checking functions for performance
  const permissionCheckers = useMemo(() => ({
    /**
     * Check if user has a specific permission
     * @param {string} permission - Permission to check
     * @returns {boolean}
     */
    hasPermission: (permission) => hasPermission(userPermissions, permission),

    /**
     * Check if user has any of the specified permissions
     * @param {Array} permissions - Array of permissions to check
     * @returns {boolean}
     */
    hasAnyPermission: (permissions) => hasAnyPermission(userPermissions, permissions),

    /**
     * Check if user has all of the specified permissions
     * @param {Array} permissions - Array of permissions to check
     * @returns {boolean}
     */
    hasAllPermissions: (permissions) => hasAllPermissions(userPermissions, permissions),

    /**
     * Check if user is an admin
     * @returns {boolean}
     */
    isAdmin: () => isAdmin(userPermissions),

    /**
     * Check if user can manage devices
     * @returns {boolean}
     */
    canManageDevices: () => canManageDevices(userPermissions),

    /**
     * Check if user can view analytics
     * @returns {boolean}
     */
    canViewAnalytics: () => canViewAnalytics(userPermissions),

    /**
     * Get permissions grouped by category
     * @returns {Object}
     */
    getPermissionsByCategory: () => getPermissionsByCategory(userPermissions),

    /**
     * Get raw user permissions
     * @returns {Array}
     */
    getUserPermissions: () => userPermissions
  }), [userPermissions]);

  return permissionCheckers;
};

/**
 * Higher-order component for conditional rendering based on permissions
 * @param {React.Component} Component - Component to render
 * @param {string|Array} requiredPermissions - Required permission(s)
 * @param {React.Component} fallback - Component to render if no permission
 * @returns {React.Component}
 */
export const withPermissions = (Component, requiredPermissions, fallback = null) => {
  return (props) => {
    const { hasPermission, hasAnyPermission } = usePermissions();
    
    const hasAccess = Array.isArray(requiredPermissions) 
      ? hasAnyPermission(requiredPermissions)
      : hasPermission(requiredPermissions);

    if (!hasAccess) {
      return fallback;
    }

    return <Component {...props} />;
  };
};

export default usePermissions;
