/**
 * Groups Module - Centralized Redux slice for all group-related state management
 *
 * This module consolidates:
 * - ActiveGroupSlice: Managing the currently active group
 * - UserGroupsSlice: Managing user's available groups
 * - GroupInfoSlice: Managing detailed group information
 *
 * Export everything from the main GroupsSlice for easy importing
 */

export {
  // Async Thunks
  fetchUserGroups,
  fetchGroupDetails,
  fetchGroupInfo, // Legacy alias

  // Action Creators
  setActiveGroup,
  setActiveGroupLoading,
  setActiveGroupError,
  clearActiveGroup,
  setUserGroups,
  setGroups, // Legacy alias
  clearUserGroups,
  updateGroupDetails,
  updateGroupInfo, // Legacy alias
  updateGroupLogo,
  clearGroupDetails,
  clearAllGroupData,

  // Selectors
  selectActiveGroup,
  selectUserGroups,
  selectGroupDetails,
  selectUserGroupsLoading,
  selectActiveGroupLoading,
  selectGroupDetailsLoading,
  selectUserInfo,
  selectGroupInfo, // Legacy alias
  selectGroups, // Legacy alias

  // Default export (reducer)
  default,
} from './GroupsSlice';
