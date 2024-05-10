import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getSiteSummaryDetails, getGridLocationDetails } from '@/core/apis/DeviceRegistry';

const initialState = {
  gridLocationDetails: {},
  sitesSummary: [],
  success: false,
  errors: null,
  selectedLocations: [],
  gridsSummary: [],
};

export const getGridLocation = createAsyncThunk('/get/grid', async (gridID) => {
  const response = await getGridLocationDetails(gridID);
  return response;
});

export const getSitesSummary = createAsyncThunk('/get/sites-summary', async () => {
  const response = await getSiteSummaryDetails();
  return response;
});

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
      });
  },
});

export const { setSelectedLocations, setGridsSummary } = gridsSlice.actions;
export default gridsSlice.reducer;
