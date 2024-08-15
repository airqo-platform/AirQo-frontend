import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  getSiteSummaryDetails,
  getGridLocationDetails,
  getGirdsSummaryDetails,
} from '@/core/apis/DeviceRegistry';

const initialState = {
  gridLocationDetails: {},
  sitesSummary: [],
  success: false,
  errors: null,
  selectedLocations: [],
  gridsSummary: [],
  gridsDataSummary: [],
};

export const getGridLocation = createAsyncThunk('/get/grid', async (gridID) => {
  const response = await getGridLocationDetails(gridID);
  return response;
});

export const getSitesSummary = createAsyncThunk(
  '/get/sites-summary',
  async () => {
    const response = await getSiteSummaryDetails();
    return response;
  }
);

// New async thunk for getting grids data summary
export const getGridsDataSummary = createAsyncThunk(
  '/get/grids-data-summary',
  async () => {
    const response = await getGirdsSummaryDetails();
    return response;
  }
);

export const gridsSlice = createSlice({
  name: 'grids',
  initialState,
  reducers: {
    setSelectedLocations: (state, action) => {
      state.selectedLocations = action.payload;
    },
    setGridsSummary: (state, action) => {
      state.gridsSummary = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getSitesSummary.pending, (state) => {
        state.success = false;
        state.errors = null;
        state.sitesSummary = [];
      })
      .addCase(getSitesSummary.fulfilled, (state, action) => {
        state.sitesSummary = action.payload;
        state.success = action.payload.success;
      })
      .addCase(getSitesSummary.rejected, (state, action) => {
        state.errors = action.error.message;
        state.success = false;
      })
      .addCase(getGridLocation.pending, (state) => {
        state.success = false;
        state.errors = null;
        state.gridLocationDetails = {};
      })
      .addCase(getGridLocation.fulfilled, (state, action) => {
        state.gridLocationDetails = action.payload;
        state.success = action.payload.success;
      })
      .addCase(getGridLocation.rejected, (state, action) => {
        state.errors = action.error.message;
        state.success = false;
      })
      // New cases for handling getGridsDataSummary actions
      .addCase(getGridsDataSummary.pending, (state) => {
        state.success = false;
        state.errors = null;
        state.gridsDataSummary = [];
      })
      .addCase(getGridsDataSummary.fulfilled, (state, action) => {
        state.gridsDataSummary = action.payload;
        state.success = action.payload.success;
      })
      .addCase(getGridsDataSummary.rejected, (state, action) => {
        state.errors = action.error.message;
        state.success = false;
      });
  },
});

export const { setSelectedLocations, setGridsSummary } = gridsSlice.actions;
export default gridsSlice.reducer;
