import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { updateCohortDetails } from '@/core/apis/DeviceRegistry';

export const updateCohort = createAsyncThunk(
  '/cohort/updateCohort',
  async ({ cohort, cohortID }) => {
    const response = await updateCohortDetails(cohort, cohortID);
    return response;
  }
);

const cohortSlice = createSlice({
  name: 'cohort',
  initialState: {
    selectedCohort: null,
    updateCohort: {
      loading: false,
      data: null,
      error: null,
      fulfilled: false,
      rejected: false,
    },
  },
  reducers: {
    addCohort: (state, action) => {
      state.selectedCohort = action.payload;
    },
  },
  extraReducers: {
    [updateCohort.pending]: (state) => {
      state.updateCohort.loading = true;
    },
    [updateCohort.fulfilled]: (state, action) => {
      state.updateCohort.loading = false;
      state.updateCohort.data = action.payload;
      state.updateCohort.fulfilled = true;
    },
    [updateCohort.rejected]: (state, action) => {
      state.updateCohort.loading = false;
      state.updateCohort.error = action.error;
      state.updateCohort.rejected = true;
    },
  },
});

export const { addCohort } = cohortSlice.actions;
export default cohortSlice.reducer;
