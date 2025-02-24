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
      if (!resData || isEmpty(resData.grids)) {
        return rejectWithValue('No data found.');
      }
      return transformArray(resData.grids, 'long_name');
    } catch (err) {
      console.log(err);
      return rejectWithValue(err.message || 'An unknown error occurred.');
    }
  }
);

const initialState = {
  summary: {},
  currentAirqloud: 'Uganda',
  error: null
};

const airqloudsSlice = createSlice({
  name: 'airqlouds',
  initialState,
  reducers: {
    setCurrentAirQloudData: (state, action) => {
      state.currentAirqloud = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadAirQloudSummaryData.pending, (state) => {
        state.error = null;
      })
      .addCase(loadAirQloudSummaryData.fulfilled, (state, action) => {
        if (action.payload) {
          state.summary = action.payload;
        } else {
          state.summary = {};
        }
      })
      .addCase(loadAirQloudSummaryData.rejected, (state, action) => {
        state.error = action.payload || 'Failed to load AirQloud summary data.';
      });
  }
});

export const { setCurrentAirQloudData, clearError } = airqloudsSlice.actions;

export default airqloudsSlice.reducer;
