import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  measurements: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

const recentMeasurementsSlice = createSlice({
  name: 'recentMeasurements',
  initialState,
  reducers: {
    setRecentMeasurementsData: (state, action) => {
      state.measurements = action.payload;
      state.status = 'succeeded';
      state.error = null;
    },
    clearMeasurementsData: (state) => {
      state.measurements = [];
      state.status = 'idle';
      state.error = null;
    },
    // Optionally, you can add actions to update status or error if needed.
    setRecentMeasurementsLoading: (state) => {
      state.status = 'loading';
      state.error = null;
    },
    setRecentMeasurementsError: (state, action) => {
      state.error = action.payload;
      state.status = 'failed';
    },
  },
});

export const {
  setRecentMeasurementsData,
  clearMeasurementsData,
  setRecentMeasurementsLoading,
  setRecentMeasurementsError,
} = recentMeasurementsSlice.actions;
export default recentMeasurementsSlice.reducer;
