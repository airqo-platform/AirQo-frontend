import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getAllEventsApi } from '../../apis';
import { isEmpty } from 'underscore';

// Async thunk for fetching all events
export const getAllEvents = createAsyncThunk(
  'getEvents/fetchAll',
  async (lang, { rejectWithValue }) => {
    try {
      const response = await getAllEventsApi(lang);
      return response;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const eventSlice = createSlice({
  name: 'getEvents',
  initialState: {
    loading: false,
    events: [],
    errorMessage: ''
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAllEvents.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.events = action.payload;
      })
      .addCase(getAllEvents.rejected, (state, action) => {
        state.loading = false;
        state.errorMessage = action.error.message;
      });
  }
});

export default eventSlice.reducer;
