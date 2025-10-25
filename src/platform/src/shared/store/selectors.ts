import type { RootState } from './index';

// User selectors
export const selectUser = (state: RootState) => state.user.user;
export const selectGroups = (state: RootState) => state.user.groups;
export const selectActiveGroup = (state: RootState) => state.user.activeGroup;
export const selectUserLoading = (state: RootState) => state.user.isLoading;
export const selectUserError = (state: RootState) => state.user.error;

// Insights selectors
export const selectDialogStack = (state: RootState) =>
  state.insights.dialogStack;
export const selectTopDialog = (state: RootState) =>
  state.insights.dialogStack[state.insights.dialogStack.length - 1];
export const selectIsDialogOpen = (dialogId: string) => (state: RootState) =>
  state.insights.dialogStack.some(item => item.id === dialogId);
export const selectSelectedSites = (state: RootState) =>
  state.insights.selectedSites;
export const selectInsightsLoading = (state: RootState) =>
  state.insights.isLoading;
export const selectInsightsError = (state: RootState) => state.insights.error;

// Cohort selectors
export const selectActiveGroupCohorts = (state: RootState) =>
  state.cohorts.activeGroupCohorts;
export const selectCohortsLoading = (state: RootState) =>
  state.cohorts.isLoading;
export const selectCohortsError = (state: RootState) => state.cohorts.error;
export const selectLastFetchedGroupId = (state: RootState) =>
  state.cohorts.lastFetchedGroupId;
