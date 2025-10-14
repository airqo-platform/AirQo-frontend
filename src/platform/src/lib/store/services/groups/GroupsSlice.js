import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getUserDetails, getGroupDetailsApi } from '@/core/apis/Account';
import logger from '@/lib/logger';

/**
 * Async thunk to fetch user details and groups
 * Implements safe data normalization following the pattern:
 * groups first, my_groups fallback, empty array otherwise
 */
export const fetchUserGroups = createAsyncThunk(
  'groups/fetchUserGroups',
  async (userID, { rejectWithValue }) => {
    let response;
    try {
      response = await getUserDetails(userID);
      if (!response?.success || !response?.users || response.users.length === 0) {
        throw new Error('Failed to fetch user details or user not found');
      }

      const user = response.users[0];

      const safeNetworks = Array.isArray(user.networks) ? user.networks : [];
      const safeClients = Array.isArray(user.clients) ? user.clients : [];

      const safeGroups = Array.isArray(user.groups)
        ? user.groups
        : Array.isArray(user.my_groups)
          ? user.my_groups
          : [];

      // Normalize groups to consistent structure
      const normalizedGroups = safeGroups.map((group) => ({
        _id: group._id,
        grp_title: group.grp_title,
        grp_profile_picture: group.grp_profile_picture || group.grp_image,
        organization_slug: group.organization_slug,
        grp_slug: group.grp_slug || group.organization_slug || group.slug,
        grp_country: group.grp_country,
        grp_industry: group.grp_industry,
        grp_timezone: group.grp_timezone,
        grp_website: group.grp_website,
        theme: group.theme,
        status: group.status,
        createdAt: group.createdAt,
        role: group.role,
        userType: group.userType,
      }));

      // Return normalized user data with only essential fields
      // FIX: Ensure all values are serializable (no objects, functions, dates)
      const normalizedUser = {
        _id: String(user._id || ''),
        firstName: String(user.firstName || ''),
        lastName: String(user.lastName || ''),
        email: String(user.email || ''),
        userName: String(user.userName || ''),
        organization: String(user.organization || ''),
        long_organization: String(user.long_organization || ''),
        privilege: user.privilege !== undefined && user.privilege !== null ? user.privilege : null,
        profilePicture: String(user.profilePicture || ''),
        networks: Array.isArray(safeNetworks)
          ? safeNetworks.map(n => typeof n === 'string' ? n : String(n._id || n))
          : [],
        clients: Array.isArray(safeClients)
          ? safeClients.map(c => typeof c === 'string' ? c : String(c._id || c))
          : [],
      };

      // FIX: Create plain JavaScript object with only serializable data
      const result = {
        user: normalizedUser,
        groups: normalizedGroups,
      };

      logger.info('Redux Thunk: fetchUserGroups returning successfully', {
        groupsCount: result.groups.length,
        userId: result.user._id,
        hasGroups: result.groups.length > 0,
        resultKeys: Object.keys(result),
        groupsLength: result.groups?.length,
      });

      // FIX: Ensure payload is serializable by JSON stringifying and parsing
      // This catches any non-serializable data
      const serializedResult = JSON.parse(JSON.stringify(result));

      logger.info('Redux Thunk: After serialization check', {
        groupsCount: serializedResult.groups?.length || 0,
        userExists: !!serializedResult.user,
        payloadType: typeof serializedResult,
        payloadKeys: Object.keys(serializedResult),
      });

      return serializedResult;
    } catch (error) {
      logger.error('Error fetching user groups:', { error, response });
      return rejectWithValue(error.message || 'Failed to fetch user groups');
    }
  },
);

/**
 * Async thunk to fetch specific group details
 * This replaces the old fetchGroupInfo from GroupInfoSlice
 */
export const fetchGroupDetails = createAsyncThunk(
  'groups/fetchGroupDetails',
  async (groupId, { rejectWithValue }) => {
    try {
      const response = await getGroupDetailsApi(groupId);
      return response.group;
    } catch (error) {
      logger.error('Error fetching group details:', error);
      return rejectWithValue(error.message || 'Failed to fetch group details');
    }
  },
);

/**
 * Legacy alias for fetchGroupDetails to maintain backward compatibility
 */
export const fetchGroupInfo = fetchGroupDetails;

const initialState = {
  // User's available groups (from UserGroupsSlice)
  userGroups: [],
  userGroupsLoading: false,
  userGroupsError: null,
  lastFetched: null,
  userInfo: null,

  // Currently active group (from ActiveGroupSlice)
  activeGroup: null,
  activeGroupLoading: false,
  activeGroupError: null,

  // Detailed group information (from GroupInfoSlice - for organization profile, settings, etc.)
  groupDetails: null,
  groupDetailsLoading: false,
  groupDetailsError: null,
};

const groupsSlice = createSlice({
  name: 'groups',
  initialState,
  reducers: {
    // Active Group Management (from ActiveGroupSlice)
    setActiveGroup: (state, action) => {
      const newGroup = action.payload;

      // Validate the group object
      if (!newGroup || !newGroup._id) {
        logger.warn('Redux: Attempted to set invalid active group:', newGroup);
        return;
      }

      logger.info('Redux: Setting active group:', {
        groupId: newGroup._id,
        groupName: newGroup.grp_title,
        previousGroup: state.activeGroup?.grp_title,
      });

      state.activeGroup = newGroup;
      state.activeGroupError = null;
    },
    setActiveGroupLoading: (state, action) => {
      state.activeGroupLoading = action.payload;
    },
    setActiveGroupError: (state, action) => {
      state.activeGroupError = action.payload;
      state.activeGroupLoading = false;
    },
    clearActiveGroup: (state) => {
      state.activeGroup = null;
      state.activeGroupError = null;
      state.activeGroupLoading = false;
    },

    // User Groups Management (from UserGroupsSlice)
    setUserGroups: (state, action) => {
      state.userGroups = action.payload;
      state.lastFetched = Date.now();
    },
    setGroups: (state, action) => {
      // Legacy alias for setUserGroups
      state.userGroups = action.payload;
      state.lastFetched = Date.now();
    },
    clearUserGroups: (state) => {
      state.userGroups = [];
      state.userInfo = null;
      state.userGroupsError = null;
      state.lastFetched = null;
    },

    // Group Details Management (from GroupInfoSlice)
    updateGroupDetails: (state, action) => {
      if (state.groupDetails) {
        state.groupDetails = { ...state.groupDetails, ...action.payload };
      }
    },
    updateGroupInfo: (state, action) => {
      // Legacy alias for updateGroupDetails
      if (state.groupDetails) {
        state.groupDetails = { ...state.groupDetails, ...action.payload };
      }
    },
    updateGroupLogo: (state, action) => {
      if (state.groupDetails) {
        state.groupDetails.grp_image = action.payload;
      }
    },
    clearGroupDetails: (state) => {
      state.groupDetails = null;
      state.groupDetailsError = null;
      state.groupDetailsLoading = false;
    },

    // Clear all data
    clearAllGroupData: (state) => {
      Object.assign(state, {
        userGroups: [],
        userGroupsLoading: false,
        userGroupsError: null,
        lastFetched: null,
        userInfo: null,
        activeGroup: null,
        activeGroupLoading: false,
        activeGroupError: null,
        groupDetails: null,
        groupDetailsLoading: false,
        groupDetailsError: null,
      });
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch User Groups
      .addCase(fetchUserGroups.pending, (state) => {
        state.userGroupsLoading = true;
        state.userGroupsError = null;
      })
      .addCase(fetchUserGroups.rejected, (state, action) => {
        logger.error('Redux Reducer: fetchUserGroups.rejected', {
          error: action.payload,
          errorType: typeof action.payload,
        });
        state.userGroupsLoading = false;
        state.userGroupsError = action.payload;
        if (!Array.isArray(state.userGroups)) {
          state.userGroups = [];
        }
      })
      .addCase(fetchUserGroups.fulfilled, (state, action) => {
        logger.info('Redux Reducer: fetchUserGroups.fulfilled - RAW PAYLOAD', {
          action: action,
          payload: action.payload,
          payloadType: typeof action.payload,
          payloadKeys: action.payload ? Object.keys(action.payload) : [],
          payloadUser: action.payload?.user,
          payloadGroups: action.payload?.groups,
          payloadGroupsLength: action.payload?.groups?.length,
          payloadGroupsIsArray: Array.isArray(action.payload?.groups),
        });

        state.userGroupsLoading = false;

        // FIX: Properly destructure with defensive checks
        let groups = [];
        let user = null;

        if (action.payload) {
          // Check if payload has groups directly
          if (Array.isArray(action.payload.groups)) {
            groups = action.payload.groups;
            user = action.payload.user || null;
          }
          // Fallback: check if entire payload is groups array (shouldn't happen, but be safe)
          else if (Array.isArray(action.payload)) {
            groups = action.payload;
          }
          // Fallback: if payload is an object but groups is missing
          else if (typeof action.payload === 'object') {
            user = action.payload.user || null;
            groups = action.payload.groups || [];
          }
        }

        state.userGroups = Array.isArray(groups) ? groups : [];
        state.userInfo = user;

        logger.info('Redux Reducer: State after update', {
          newGroupsInState: state.userGroups.length,
          newUserInState: !!state.userInfo,
          userGroupsArray: state.userGroups,
          userInfoObject: state.userInfo,
          finalGroupsIsArray: Array.isArray(state.userGroups),
        });

        state.lastFetched = Date.now();
        state.userGroupsError = null;
      })
      // Fetch Group Details
      .addCase(fetchGroupDetails.pending, (state) => {
        state.groupDetailsLoading = true;
        state.groupDetailsError = null;
      })
      .addCase(fetchGroupDetails.fulfilled, (state, action) => {
        state.groupDetailsLoading = false;
        state.groupDetails = action.payload;
        state.groupDetailsError = null;
      })
      .addCase(fetchGroupDetails.rejected, (state, action) => {
        state.groupDetailsLoading = false;
        state.groupDetailsError = action.payload;
      })

      // Handle logout actions
      .addCase({ type: 'RESET_APP' }, () => initialState)
      .addCase({ type: 'LOGOUT_USER' }, () => initialState);
  },
});

export const {
  // Active Group Actions
  setActiveGroup,
  setActiveGroupLoading,
  setActiveGroupError,
  clearActiveGroup,

  // User Groups Actions
  setUserGroups,
  setGroups, // Legacy alias
  clearUserGroups,

  // Group Details Actions
  updateGroupDetails,
  updateGroupInfo, // Legacy alias
  updateGroupLogo,
  clearGroupDetails,

  // Clear All
  clearAllGroupData,
} = groupsSlice.actions;

// Modern Selectors
export const selectActiveGroup = (state) => state.groups.activeGroup;
export const selectUserGroups = (state) => state.groups.userGroups;
export const selectGroupDetails = (state) => state.groups.groupDetails;
export const selectUserGroupsLoading = (state) =>
  state.groups.userGroupsLoading;
export const selectActiveGroupLoading = (state) =>
  state.groups.activeGroupLoading;
export const selectGroupDetailsLoading = (state) =>
  state.groups.groupDetailsLoading;
export const selectUserInfo = (state) => state.groups.userInfo;

// Legacy Selectors for backward compatibility
export const selectGroupInfo = selectGroupDetails;
export const selectGroups = selectUserGroups;

export default groupsSlice.reducer;
