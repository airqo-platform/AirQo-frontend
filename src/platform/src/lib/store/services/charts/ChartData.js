import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  data: null,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    // Resets analytics state to initial values
    resetAnalyticsData: (state) => {
      state.data = null;
      state.status = 'idle';
      state.error = null;
    },
    // Sets analytics data and updates status to succeeded
    setAnalyticsData: (state, action) => {
      state.data = action.payload;
      state.status = 'succeeded';
      state.error = null;
    },
    // Sets analytics state to loading
    setAnalyticsLoading: (state) => {
      state.status = 'loading';
      state.error = null;
    },
    // Sets an error message and updates status to failed
    setAnalyticsError: (state, action) => {
      state.error = action.payload;
      state.status = 'failed';
    },
  },
});

export const {
  resetAnalyticsData,
  setAnalyticsData,
  setAnalyticsLoading,
  setAnalyticsError,
} = analyticsSlice.actions;
export default analyticsSlice.reducer;
