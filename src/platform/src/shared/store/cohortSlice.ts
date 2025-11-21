import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CohortState {
  activeGroupCohorts: string[];
  isLoading: boolean;
  error: string | null;
  lastFetchedGroupId: string | null;
}

const initialState: CohortState = {
  activeGroupCohorts: [],
  isLoading: false,
  error: null,
  lastFetchedGroupId: null,
};

const cohortSlice = createSlice({
  name: 'cohorts',
  initialState,
  reducers: {
    setCohortsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setCohortsError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    setActiveGroupCohorts: (
      state,
      action: PayloadAction<{ groupId: string; cohortIds: string[] }>
    ) => {
      state.activeGroupCohorts = action.payload.cohortIds;
      state.lastFetchedGroupId = action.payload.groupId;
      state.error = null;
      state.isLoading = false;
    },
    clearCohorts: state => {
      state.activeGroupCohorts = [];
      state.lastFetchedGroupId = null;
      state.error = null;
      state.isLoading = false;
    },
  },
});

export const {
  setCohortsLoading,
  setCohortsError,
  setActiveGroupCohorts,
  clearCohorts,
} = cohortSlice.actions;

export default cohortSlice.reducer;
