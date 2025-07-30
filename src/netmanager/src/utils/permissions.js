import { PERMISSIONS } from '../constants/permissions';

// Legacy permission mapping to new permissions
export const LEGACY_PERMISSION_MAP = {
  // Old device permissions
  'DEPLOY_AIRQO_DEVICES': PERMISSIONS.DEVICE.DEPLOY,
  'CREATE_UPDATE_AND_DELETE_NETWORK_DEVICES': PERMISSIONS.DEVICE.VIEW,
  'RECALL_AIRQO_DEVICES': PERMISSIONS.DEVICE.RECALL,
  'MAINTAIN_AIRQO_DEVICES': PERMISSIONS.DEVICE.MAINTAIN,

  // Old site permissions
  'CREATE_UPDATE_AND_DELETE_NETWORK_SITES': PERMISSIONS.SITE.VIEW,
  'CREATE_SITES': PERMISSIONS.SITE.CREATE,
  'UPDATE_SITES': PERMISSIONS.SITE.UPDATE,
  'DELETE_SITES': PERMISSIONS.SITE.DELETE,

  // Old user management permissions
  'CREATE_UPDATE_AND_DELETE_NETWORK_USERS': PERMISSIONS.USER.VIEW,
  'CREATE_NETWORK_USERS': PERMISSIONS.USER.CREATE,
  'UPDATE_NETWORK_USERS': PERMISSIONS.USER.EDIT,
  'DELETE_NETWORK_USERS': PERMISSIONS.USER.DELETE,
  'INVITE_NETWORK_USERS': PERMISSIONS.USER.INVITE,

  // Old role permissions
  'CREATE_UPDATE_AND_DELETE_NETWORK_ROLES': PERMISSIONS.ROLE.VIEW,
  'CREATE_NETWORK_ROLES': PERMISSIONS.ROLE.CREATE,
  'UPDATE_NETWORK_ROLES': PERMISSIONS.ROLE.EDIT,
  'DELETE_NETWORK_ROLES': PERMISSIONS.ROLE.DELETE,
  'ASSIGN_NETWORK_ROLES': PERMISSIONS.ROLE.ASSIGNMENT,

  // Old airqloud/group permissions
  'CREATE_UPDATE_AND_DELETE_AIRQLOUDS': PERMISSIONS.GROUP.VIEW,
  'CREATE_AIRQLOUDS': PERMISSIONS.GROUP.CREATE,
  'UPDATE_AIRQLOUDS': PERMISSIONS.GROUP.EDIT,
  'DELETE_AIRQLOUDS': PERMISSIONS.GROUP.DELETE,

  // Old analytics permissions
  'VIEW_ANALYTICS': PERMISSIONS.ANALYTICS.ANALYTICS_VIEW,
  'EXPORT_DATA': PERMISSIONS.ANALYTICS.DATA_EXPORT,
  'VIEW_DASHBOARD': PERMISSIONS.ANALYTICS.DASHBOARD_VIEW,

  // Old organization permissions
  'CREATE_UPDATE_AND_DELETE_NETWORKS': PERMISSIONS.ORGANIZATION.VIEW,
  'CREATE_NETWORKS': PERMISSIONS.ORGANIZATION.CREATE,
  'UPDATE_NETWORKS': PERMISSIONS.ORGANIZATION.UPDATE,
  'DELETE_NETWORKS': PERMISSIONS.ORGANIZATION.DELETE
};

/**
 * Maps a legacy permission to its new equivalent
 * @param {string} legacyPermission - The old permission string
 * @returns {string} - The new permission string
 */
export const mapLegacyPermission = (legacyPermission) => {
  return LEGACY_PERMISSION_MAP[legacyPermission] || legacyPermission;
};

/**
 * Maps an array of legacy permissions to new permissions
 * @param {Array} legacyPermissions - Array of old permission strings
 * @returns {Array} - Array of new permission strings
 */
export const mapLegacyPermissions = (legacyPermissions) => {
  if (!Array.isArray(legacyPermissions)) return [];
  return legacyPermissions.map(mapLegacyPermission);
};

/**
 * Checks if a user has a specific permission (supports both old and new formats)
 * @param {Array} userPermissions - User's current permissions
 * @param {string} requiredPermission - The permission to check for
 * @returns {boolean} - Whether the user has the permission
 */
export const hasPermission = (userPermissions, requiredPermission) => {
  if (!Array.isArray(userPermissions)) return false;
  
  // Extract permission strings from permission objects or use directly if string
  const permissionStrings = userPermissions.map(permission => 
    typeof permission === 'object' ? permission.permission : permission
  );
  
  // Check for direct match
  if (permissionStrings.includes(requiredPermission)) {
    return true;
  }
  
  // Check for legacy permission match
  const mappedPermission = mapLegacyPermission(requiredPermission);
  if (mappedPermission !== requiredPermission && permissionStrings.includes(mappedPermission)) {
    return true;
  }
  
  // Check if any legacy permissions map to the required permission
  for (const userPermission of permissionStrings) {
    if (mapLegacyPermission(userPermission) === requiredPermission) {
      return true;
    }
  }
  
  return false;
};

/**
 * Checks if a user has any of the specified permissions
 * @param {Array} userPermissions - User's current permissions
 * @param {Array} requiredPermissions - Array of permissions to check for
 * @returns {boolean} - Whether the user has any of the permissions
 */
export const hasAnyPermission = (userPermissions, requiredPermissions) => {
  if (!Array.isArray(requiredPermissions)) return false;
  return requiredPermissions.some(permission => hasPermission(userPermissions, permission));
};

/**
 * Checks if a user has all of the specified permissions
 * @param {Array} userPermissions - User's current permissions
 * @param {Array} requiredPermissions - Array of permissions to check for
 * @returns {boolean} - Whether the user has all permissions
 */
export const hasAllPermissions = (userPermissions, requiredPermissions) => {
  if (!Array.isArray(requiredPermissions)) return false;
  return requiredPermissions.every(permission => hasPermission(userPermissions, permission));
};

/**
 * Gets user permissions grouped by category
 * @param {Array} userPermissions - User's current permissions
 * @returns {Object} - Permissions grouped by category
 */
export const getPermissionsByCategory = (userPermissions) => {
  const permissionStrings = userPermissions.map(permission => 
    typeof permission === 'object' ? permission.permission : permission
  );
  
  const categorized = {};
  
  // Initialize categories
  Object.keys(PERMISSIONS).forEach(category => {
    categorized[category] = [];
  });
  
  // Categorize permissions
  permissionStrings.forEach(permission => {
    const mappedPermission = mapLegacyPermission(permission);
    
    // Find which category this permission belongs to
    Object.keys(PERMISSIONS).forEach(category => {
      const categoryPermissions = Object.values(PERMISSIONS[category]);
      if (categoryPermissions.includes(mappedPermission)) {
        categorized[category].push(mappedPermission);
      }
    });
  });
  
  return categorized;
};

/**
 * Checks if a user is an admin (has high-level permissions)
 * @param {Array} userPermissions - User's current permissions
 * @returns {boolean} - Whether the user is an admin
 */
export const isAdmin = (userPermissions) => {
  const adminPermissions = [
    PERMISSIONS.SYSTEM.SUPER_ADMIN,
    PERMISSIONS.SYSTEM.SYSTEM_ADMIN,
    PERMISSIONS.ORGANIZATION.CREATE,
    PERMISSIONS.ORGANIZATION.DELETE,
    PERMISSIONS.USER.DELETE,
    PERMISSIONS.ROLE.CREATE,
    PERMISSIONS.ROLE.DELETE
  ];
  
  return hasAnyPermission(userPermissions, adminPermissions);
};

/**
 * Checks if a user can manage devices
 * @param {Array} userPermissions - User's current permissions
 * @returns {boolean} - Whether the user can manage devices
 */
export const canManageDevices = (userPermissions) => {
  const deviceManagementPermissions = [
    PERMISSIONS.DEVICE.DEPLOY,
    PERMISSIONS.DEVICE.UPDATE,
    PERMISSIONS.DEVICE.DELETE,
    PERMISSIONS.DEVICE.MAINTAIN
  ];
  
  return hasAnyPermission(userPermissions, deviceManagementPermissions);
};

/**
 * Checks if a user can view analytics
 * @param {Array} userPermissions - User's current permissions
 * @returns {boolean} - Whether the user can view analytics
 */
export const canViewAnalytics = (userPermissions) => {
  const analyticsPermissions = [
    PERMISSIONS.ANALYTICS.DASHBOARD_VIEW,
    PERMISSIONS.ANALYTICS.ANALYTICS_VIEW,
    PERMISSIONS.ANALYTICS.DATA_VIEW
  ];
  
  return hasAnyPermission(userPermissions, analyticsPermissions);
};
