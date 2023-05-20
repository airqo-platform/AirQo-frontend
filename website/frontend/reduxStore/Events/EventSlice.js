import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getAllEventsApi } from '../../apis';

export const getAllEvents = createAsyncThunk('/getEvents', async () => {
  const response = await getAllEventsApi()
  return response;
});

export const eventSlice = createSlice({
  name: 'getEvents',
  initialState: {
    loading: false,
    events: [],
    errorMessage: ''
  },
  reducers: {
    isLoading: (state, action) => {
      state.loading = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllEvents.fulfilled, (state, action) => {
        state.events = action.payload;
        state.loading = false;
      })
      .addCase(getAllEvents.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllEvents.rejected, (state, action) => {
        state.errorMessage = action.error.message;
        state.loading = false;
      });
  }
});

export const { isLoading } = eventSlice.actions;

export default eventSlice.reducer;
