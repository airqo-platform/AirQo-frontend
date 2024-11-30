import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getAnalyticsData } from '@/core/apis/DeviceRegistry';

// Thunk to fetch analytics data
export const fetchChartAnalyticsData = createAsyncThunk(
  'analytics/fetchData',
  async (body, { signal, rejectWithValue }) => {
    try {
      const response = await getAnalyticsData({ body, signal });
      return response.data; // Assuming response.data is the array
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch analytics data');
    }
  },
);

// Initial state
const initialState = {
  data: null,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

// Create slice
const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    // Reducer to reset analytics data
    resetAnalyticsData: (state) => {
      state.data = null;
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChartAnalyticsData.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchChartAnalyticsData.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(fetchChartAnalyticsData.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'An error occurred while fetching data';
      });
  },
});

// Export actions and reducer
export const { resetAnalyticsData } = analyticsSlice.actions;
export default analyticsSlice.reducer;
