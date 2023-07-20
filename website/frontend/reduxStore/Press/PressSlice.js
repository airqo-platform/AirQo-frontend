import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getAllPressApi } from '../../apis';

const initialState = {
  loading: false,
  pressData: [],
  error: null
};

export const loadPressData = createAsyncThunk('get/press', async () => {
  const response = await getAllPressApi();
  return response;
});

const pressSlice = createSlice({
  name: 'press',
  initialState,
  reducers: {
    getPressData: (state, action) => {
      state.pressData = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadPressData.fulfilled, (state, action) => {
        state.pressData = action.payload;
        state.loading = false;
      })
      .addCase(loadPressData.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadPressData.rejected, (state, action) => {
        state.error = action.error.message;
        state.loading = false;
      });
  },
});

export const { getPressData } = pressSlice.actions;

export default pressSlice.reducer;
