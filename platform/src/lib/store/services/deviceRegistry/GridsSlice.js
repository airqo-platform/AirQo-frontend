import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getSiteSummaryDetails, getGridLocationDetails } from '@/core/apis/DeviceRegistry';

const initialState = {
  gridLocationDetails: {},
  sitesSummary: [],
  success: false,
  errors: null,
  selectedLocations: [],
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
  },
  extraReducers: (builder) => {
    builder
      .addCase(getSitesSummary.fulfilled, (state, action) => {
        state.sitesSummary = action.payload;
        state.success = action.payload.success;
      })
      .addCase(getSitesSummary.pending, (state) => {
        state.success = false;
      })
      .addCase(getSitesSummary.rejected, (state, action) => {
        state.errors = action.payload;
        state.success = false;
      })
      .addCase(getGridLocation.fulfilled, (state, action) => {
        state.gridLocationDetails = action.payload;
        state.success = action.payload.success;
      })
      .addCase(getGridLocation.pending, (state) => {
        state.success = false;
      })
      .addCase(getGridLocation.rejected, (state, action) => {
        state.errors = action.payload;
        state.success = false;
      });
  },
});

export const { setSelectedLocations } = gridsSlice.actions;
export default gridsSlice.reducer;
