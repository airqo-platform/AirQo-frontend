import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { isEmpty } from 'underscore';
import { getAllCareersApi, getAllDepartmentsApi } from '../../apis';
import { transformArray } from '../utils';

// Async thunk for loading careers listing data
export const loadCareersListingData = createAsyncThunk(
  'careersData/loadCareersListingData',
  async (_, { getState, rejectWithValue }) => {
    const lang = getState().eventsNavTab.languageTab;
    try {
      const resData = await getAllCareersApi(lang);
      if (isEmpty(resData || [])) return;
      return transformArray(resData, 'unique_title');
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Async thunk for loading careers departments data
export const loadCareersDepartmentsData = createAsyncThunk(
  'careersData/loadCareersDepartmentsData',
  async (_, { getState, rejectWithValue }) => {
    const lang = getState().eventsNavTab.languageTab;
    try {
      const resData = await getAllDepartmentsApi(lang);
      if (isEmpty(resData || [])) return;
      return resData;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const careersDataSlice = createSlice({
  name: 'careersData',
  initialState: {
    loading: false,
    listing: {},
    departments: [],
    error: null
  },
  reducers: {
    updateCareersLoader: (state, action) => {
      state.loading = action.payload.loading;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadCareersListingData.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadCareersListingData.fulfilled, (state, action) => {
        state.listing = action.payload;
        state.loading = false;
      })
      .addCase(loadCareersListingData.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      .addCase(loadCareersDepartmentsData.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadCareersDepartmentsData.fulfilled, (state, action) => {
        state.departments = action.payload;
        state.loading = false;
      })
      .addCase(loadCareersDepartmentsData.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      });
  }
});

export const { updateCareersLoader } = careersDataSlice.actions;

export default careersDataSlice.reducer;
