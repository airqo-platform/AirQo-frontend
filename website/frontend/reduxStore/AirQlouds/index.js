import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { isEmpty } from 'underscore';
import { getAirQloudSummaryApi } from '../../apis';
import { transformArray } from '../utils';

// Async thunk for loading AirQloud summary data
export const loadAirQloudSummaryData = createAsyncThunk(
  'airqlouds/loadAirQloudSummaryData',
  async (_, { rejectWithValue }) => {
    try {
      const resData = await getAirQloudSummaryApi();
      if (isEmpty(resData.grids || [])) return;
      return transformArray(resData.grids, 'long_name');
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const airqloudsSlice = createSlice({
  name: 'airqlouds',
  initialState: {
    summary: {},
    currentAirqloud: 'Uganda',
    error: null
  },
  reducers: {
    setCurrentAirQloudData: (state, action) => {
      state.currentAirqloud = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadAirQloudSummaryData.fulfilled, (state, action) => {
        state.summary = action.payload;
      })
      .addCase(loadAirQloudSummaryData.rejected, (state, action) => {
        state.error = action.payload;
      });
  }
});

export const { setCurrentAirQloudData } = airqloudsSlice.actions;

export default airqloudsSlice.reducer;
