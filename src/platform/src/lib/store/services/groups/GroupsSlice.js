import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getUserDetails, getGroupDetailsApi } from '@/core/apis/Account';
import logger from '@/lib/logger';

/**
 * Async thunk to fetch user details and groups
 */
export const fetchUserGroups = createAsyncThunk(
  'groups/fetchUserGroups',
  async (userID, { rejectWithValue }) => {
    try {
      const response = await getUserDetails(userID);

      if (!response.success || !response.users || response.users.length === 0) {
        throw new Error('Failed to fetch user details or user not found');
      }

      const user = response.users[0];
      return {
        user,
        groups: user.groups || [],
      };
    } catch (error) {
      logger.error('Error fetching user groups:', error);
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
      state.activeGroup = action.payload;
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
      .addCase(fetchUserGroups.fulfilled, (state, action) => {
        state.userGroupsLoading = false;
        state.userGroups = action.payload.groups;
        state.userInfo = action.payload.user;
        state.lastFetched = Date.now();
        state.userGroupsError = null;
      })
      .addCase(fetchUserGroups.rejected, (state, action) => {
        state.userGroupsLoading = false;
        state.userGroupsError = action.payload;
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
      });
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
