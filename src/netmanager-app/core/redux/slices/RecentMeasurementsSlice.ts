import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getRecentMeasurements } from '@/core/apis/DeviceRegistry';

// Define types for measurements
interface Measurement {
  // Define the structure of a measurement object
  id: string;
  value: number;
  timestamp: string;
  // Add any other properties if available
}

interface RecentMeasurementsState {
  measurements: Measurement[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

// Initial state with types
const initialState: RecentMeasurementsState = {
  measurements: [],
  status: 'idle',
  error: null,
};

// Define the parameter type for fetchRecentMeasurementsData
interface FetchMeasurementsParams {
  [key: string]: any; // Define more specific keys if available
}

// Async thunk for fetching recent measurements
export const fetchRecentMeasurementsData = createAsyncThunk<Measurement[], FetchMeasurementsParams>(
  '/get/measurements/recent',
  async (params, { signal }) => {
    const response = await getRecentMeasurements({ ...params, signal });
    console.log("RESULTS HERE : ",response)
    return response.measurements
  }
);

// Create the slice
export const recentMeasurementsSlice = createSlice({
  name: 'recentMeasurements',
  initialState,
  reducers: {
    setRecentMeasurementsData: (state, action: PayloadAction<Measurement[]>) => {
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
      .addCase(fetchRecentMeasurementsData.fulfilled, (state, action: PayloadAction<Measurement[]>) => {
        state.status = 'succeeded';
        state.measurements = action.payload;
      })
      .addCase(fetchRecentMeasurementsData.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Unknown error';
      });
  },
});

// Export actions
export const { setRecentMeasurementsData, clearMeasurementsData } = recentMeasurementsSlice.actions;

// Export reducer
export default recentMeasurementsSlice.reducer;
