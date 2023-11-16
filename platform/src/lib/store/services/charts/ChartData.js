import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getAnalyticsData } from '@/core/apis/DeviceRegistry';

export const fetchAnalyticsData = createAsyncThunk('analytics/fetchData', async (body) => {
  const response = await getAnalyticsData(body);
  return response.data;
});

const initialState = {
  data: null,
  status: 'idle',
  error: null,
};

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnalyticsData.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAnalyticsData.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(fetchAnalyticsData.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export default analyticsSlice.reducer;
