import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getAllDevicesApi } from '../../views/apis/deviceRegistry';

export const getOrgDevices = createAsyncThunk('/getOrgDevices', async (networkName) => {
  const response = await getAllDevicesApi(networkName);
  return response;
});

export const overviewSlice = createSlice({
  name: 'deviceOverview',
  initialState: {
    devices: [],
    device: {},
    errorMessage: ''
  },
  reducers: {
    updateDeviceDetails: (state, action) => {
      state.device = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getOrgDevices.fulfilled, (state, action) => {
        state.devices = action.payload.devices;
      })
      .addCase(getOrgDevices.rejected, (state, action) => {
        state.errorMessage = action.error.message;
      });
  }
});

export const { updateDeviceDetails } = overviewSlice.actions;

export default overviewSlice.reducer;
