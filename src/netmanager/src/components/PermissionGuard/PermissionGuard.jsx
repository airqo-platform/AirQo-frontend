import React from 'react';
import PropTypes from 'prop-types';
import { usePermissions } from '../../utils/customHooks/usePermissions';

/**
 * PermissionGuard component for conditional rendering based on permissions
 * 
 * Use cases:
 * - Hide/show buttons based on user permissions
 * - Conditionally render sections of a page
 * - Display different content for different permission levels
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content to render if permission is granted
 * @param {string|Array} props.permission - Required permission(s)
 * @param {React.ReactNode} props.fallback - Content to render if permission is denied
 * @param {boolean} props.requireAll - If true, requires all permissions when permission is an array
 * @returns {React.ReactNode}
 * 
 * @example
 * // Hide delete button if user can't delete devices
 * <PermissionGuard permission={PERMISSIONS.DEVICE.DELETE}>
 *   <Button onClick={handleDelete}>Delete Device</Button>
 * </PermissionGuard>
 * 
 * @example
 * // Show different content based on permissions
 * <PermissionGuard 
 *   permission={PERMISSIONS.ANALYTICS.ANALYTICS_VIEW}
 *   fallback={<div>Basic analytics only</div>}
 * >
 *   <AdvancedAnalytics />
 * </PermissionGuard>
 * 
 * @example
 * // Require multiple permissions (any one of them)
 * <PermissionGuard permission={[PERMISSIONS.DEVICE.UPDATE, PERMISSIONS.DEVICE.DELETE]}>
 *   <DeviceActions />
 * </PermissionGuard>
 * 
 * @example
 * // Require all permissions
 * <PermissionGuard 
 *   permission={[PERMISSIONS.DEVICE.VIEW, PERMISSIONS.DEVICE.UPDATE]} 
 *   requireAll={true}
 * >
 *   <EditDeviceForm />
 * </PermissionGuard>
 */
const PermissionGuard = ({ 
  children, 
  permission, 
  fallback = null, 
  requireAll = false 
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

  // If no permission is specified, render children
  if (!permission) {
    return children;
  }

  let hasAccess = false;

  if (Array.isArray(permission)) {
    hasAccess = requireAll 
      ? hasAllPermissions(permission)
      : hasAnyPermission(permission);
  } else {
    hasAccess = hasPermission(permission);
  }

  return hasAccess ? children : fallback;
};

PermissionGuard.propTypes = {
  children: PropTypes.node.isRequired,
  permission: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string)
  ]),
  fallback: PropTypes.node,
  requireAll: PropTypes.bool
};

export default PermissionGuard;
