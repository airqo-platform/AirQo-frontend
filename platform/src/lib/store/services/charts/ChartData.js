import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getAnalyticsData } from '@/core/apis/DeviceRegistry';

// First, create the async thunk
export const fetchAnalyticsData = createAsyncThunk('analytics/fetchData', async (body) => {
  const response = await getAnalyticsData(body);
  return response.data;
});

// Then, create the slice
const analyticsSlice = createSlice({
  name: 'analytics',
  initialState: { data: [], status: 'idle', error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnalyticsData.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAnalyticsData.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Add any fetched data to the array
        state.data = state.data.concat(action.payload);
      })
      .addCase(fetchAnalyticsData.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export default analyticsSlice.reducer;
