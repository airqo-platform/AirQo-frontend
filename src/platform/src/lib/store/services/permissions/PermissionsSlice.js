import { createSlice } from '@reduxjs/toolkit';
import logger from '@/lib/logger';

/**
 * Permissions Redux Slice
 *
 * Centralized state management for user permissions and groups to reduce
 * redundant API calls and improve performance.
 *
 * Features:
 * - Stores permissions from roles-simplified endpoint
 * - Caches group permissions and roles
 * - Tracks loading states and errors
 * - Supports refresh functionality
 */

const initialState = {
  // Core permission data
  userRoles: null, // Full API response data from roles-simplified
  permissions: {}, // Flattened permissions map for fast lookup
  groupPermissions: {}, // Permissions organized by group ID
  networkPermissions: {}, // Permissions organized by network ID

  // Loading states
  isLoading: false,
  isRefreshing: false,
  lastFetched: null,

  // Error handling
  error: null,
  retryCount: 0,

  // Cache management
  cacheTimestamp: null,
  cacheExpiry: 30 * 60 * 1000, // 30 minutes in milliseconds
};

/**
 * Helper function to normalize permission data from roles-simplified API
 * Based on the actual API response structure:
 * {
 *   "user_roles": {
 *     "user_id": "...",
 *     "groups": [...],
 *     "networks": [...]
 *   }
 * }
 */
const normalizePermissions = (apiResponse) => {
  if (!apiResponse || !apiResponse.user_roles) {
    logger.warn('Invalid API response structure:', apiResponse);
    return {
      permissions: {},
      groupPermissions: {},
      networkPermissions: {},
    };
  }

  const { groups = [], networks = [] } = apiResponse.user_roles;
  const permissions = {};
  const groupPermissions = {};
  const networkPermissions = {};

  // Process groups
  groups.forEach((group) => {
    const groupId = group.group_id;
    const groupName = group.group_name;
    const roleName = group.role_name;
    const groupPermissionsList = group.permissions || [];

    if (!groupId) {
      logger.warn('Group found without group_id:', group);
      return;
    }

    // Store group data
    groupPermissions[groupId] = {
      groupId,
      groupName,
      roleName,
      permissions: groupPermissionsList,
    };

    // Add permissions to global lookup
    groupPermissionsList.forEach((permission) => {
      if (permission) {
        if (!permissions[permission]) {
          permissions[permission] = [];
        }
        permissions[permission].push(groupId);
      }
    });
  });

  // Process networks
  networks.forEach((network) => {
    const networkId = network.network_id;
    const networkName = network.network_name;
    const roleName = network.role_name;
    const networkPermissionsList = network.permissions || [];

    if (!networkId) {
      logger.warn('Network found without network_id:', network);
      return;
    }

    // Store network data
    networkPermissions[networkId] = {
      networkId,
      networkName,
      roleName,
      permissions: networkPermissionsList,
    };

    // Add permissions to global lookup
    networkPermissionsList.forEach((permission) => {
      if (permission) {
        if (!permissions[permission]) {
          permissions[permission] = [];
        }
        permissions[permission].push(`network_${networkId}`);
      }
    });
  });

  return {
    permissions,
    groupPermissions,
    networkPermissions,
  };
};

const permissionsSlice = createSlice({
  name: 'permissions',
  initialState,
  reducers: {
    // Start loading permissions
    setPermissionsLoading: (state, action) => {
      state.isLoading = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },

    // Start refreshing permissions
    setPermissionsRefreshing: (state, action) => {
      state.isRefreshing = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },

    // Set permissions data from API
    setPermissionsData: (state, action) => {
      try {
        const apiResponse = action.payload;

        if (!apiResponse || !apiResponse.success) {
          throw new Error('Invalid API response');
        }

        // Store the full API response
        state.userRoles = apiResponse;

        // Normalize and store structured data
        const normalized = normalizePermissions(apiResponse);
        state.permissions = normalized.permissions;
        state.groupPermissions = normalized.groupPermissions;
        state.networkPermissions = normalized.networkPermissions;

        // Update metadata
        state.lastFetched = Date.now();
        state.cacheTimestamp = Date.now();
        state.isLoading = false;
        state.isRefreshing = false;
        state.error = null;
        state.retryCount = 0;

        logger.info('Permissions data updated successfully', {
          groupsCount: Object.keys(state.groupPermissions).length,
          networksCount: Object.keys(state.networkPermissions).length,
          totalPermissions: Object.keys(state.permissions).length,
        });
      } catch (error) {
        logger.error('Error setting permissions data:', error);
        state.error = error.message;
        state.isLoading = false;
        state.isRefreshing = false;
      }
    },

    // Set error state
    setPermissionsError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
      state.isRefreshing = false;
      state.retryCount += 1;
    },

    // Clear permissions data
    clearPermissions: (state) => {
      state.userRoles = null;
      state.permissions = {};
      state.groupPermissions = {};
      state.networkPermissions = {};
      state.lastFetched = null;
      state.cacheTimestamp = null;
      state.error = null;
      state.retryCount = 0;
      state.isLoading = false;
      state.isRefreshing = false;
    },

    // Reset retry count
    resetRetryCount: (state) => {
      state.retryCount = 0;
    },
  },
});

// Export actions
export const {
  setPermissionsLoading,
  setPermissionsRefreshing,
  setPermissionsData,
  setPermissionsError,
  clearPermissions,
  resetRetryCount,
} = permissionsSlice.actions;

// Selectors
export const selectPermissionsState = (state) =>
  state.permissions || initialState;

export const selectUserRoles = (state) => {
  const permissionsState = selectPermissionsState(state);
  return permissionsState.userRoles;
};

export const selectPermissions = (state) => {
  const permissionsState = selectPermissionsState(state);
  return permissionsState.permissions || {};
};

export const selectGroupPermissions = (state) => {
  const permissionsState = selectPermissionsState(state);
  return permissionsState.groupPermissions || {};
};

export const selectNetworkPermissions = (state) => {
  const permissionsState = selectPermissionsState(state);
  return permissionsState.networkPermissions || {};
};

export const selectPermissionsLoading = (state) => {
  const permissionsState = selectPermissionsState(state);
  return permissionsState.isLoading;
};

export const selectPermissionsRefreshing = (state) => {
  const permissionsState = selectPermissionsState(state);
  return permissionsState.isRefreshing;
};

export const selectPermissionsError = (state) => {
  const permissionsState = selectPermissionsState(state);
  return permissionsState.error;
};

export const selectLastFetched = (state) => {
  const permissionsState = selectPermissionsState(state);
  return permissionsState.lastFetched;
};

// Permission checking selectors
export const selectHasPermission = (state, permission, groupId = null) => {
  if (!permission) return false;

  const permissionsState = selectPermissionsState(state);
  const permissions = permissionsState.permissions || {};

  const permissionData = permissions[permission];
  if (!permissionData || !Array.isArray(permissionData)) return false;

  // If no specific group is required, check if permission exists in any group
  if (!groupId) {
    return permissionData.length > 0;
  }

  // Check if permission exists for specific group
  return permissionData.includes(groupId);
};

export const selectPermissionsByGroup = (state, groupId) => {
  if (!groupId) return [];

  const permissionsState = selectPermissionsState(state);
  const groupPermissions = permissionsState.groupPermissions || {};

  const groupData = groupPermissions[groupId];
  return groupData ? groupData.permissions : [];
};

export const selectPermissionsByNetwork = (state, networkId) => {
  if (!networkId) return [];

  const permissionsState = selectPermissionsState(state);
  const networkPermissions = permissionsState.networkPermissions || {};

  const networkData = networkPermissions[networkId];
  return networkData ? networkData.permissions : [];
};

export const selectHasAnyPermission = (
  state,
  permissionsList,
  groupId = null,
) => {
  if (!Array.isArray(permissionsList) || permissionsList.length === 0)
    return false;

  return permissionsList.some((permission) =>
    selectHasPermission(state, permission, groupId),
  );
};

export const selectHasAllPermissions = (
  state,
  permissionsList,
  groupId = null,
) => {
  if (!Array.isArray(permissionsList) || permissionsList.length === 0)
    return false;

  return permissionsList.every((permission) =>
    selectHasPermission(state, permission, groupId),
  );
};

export const selectIsCacheValid = (state) => {
  const permissionsState = selectPermissionsState(state);
  const { cacheTimestamp, cacheExpiry } = permissionsState;

  if (!cacheTimestamp) return false;

  return Date.now() - cacheTimestamp < cacheExpiry;
};

// Export reducer
export default permissionsSlice.reducer;
