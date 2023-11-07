import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getEventsData } from '@/core/apis/DeviceRegistry';

const initialState = {
  eventsData: [],
  status: 'idle',
  error: null,
};

export const fetchEventsData = createAsyncThunk('/get/events', async () => {
  try {
    const response = await getEventsData();
    return response.data;
  } catch (error) {
    throw error;
  }
});

export const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    setEventsData: (state, action) => {
      state.eventsData = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEventsData.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchEventsData.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.eventsData = action.payload;
      })
      .addCase(fetchEventsData.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error;
      });
  },
});

export const { setEventsData } = eventsSlice.actions;
export default eventsSlice.reducer;
