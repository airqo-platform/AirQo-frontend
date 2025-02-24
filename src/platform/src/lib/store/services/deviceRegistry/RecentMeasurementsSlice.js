import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getRecentMeasurements } from '@/core/apis/DeviceRegistry';

const initialState = {
  measurements: [],
  status: 'idle',
  error: null,
};

export const fetchRecentMeasurementsData = createAsyncThunk(
  '/get/measurements/recent',
  async (params, { signal }) => {
    const response = await getRecentMeasurements({ ...params, signal });
    return response.measurements;
  },
);

export const recentMeasurementsSlice = createSlice({
  name: 'recentMeasurements',
  initialState,
  reducers: {
    setRecentMeasurementsData: (state, action) => {
      state.measurements = action.payload;
    },
    clearMeasurementsData: (state) => {
      state.measurements = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRecentMeasurementsData.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchRecentMeasurementsData.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.measurements = action.payload;
      })
      .addCase(fetchRecentMeasurementsData.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error;
      });
  },
});

export const { setRecentMeasurementsData, clearMeasurementsData } =
  recentMeasurementsSlice.actions;
export default recentMeasurementsSlice.reducer;
