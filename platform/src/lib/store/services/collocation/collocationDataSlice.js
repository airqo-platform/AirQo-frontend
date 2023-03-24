import { createSlice } from '@reduxjs/toolkit';
import { collocateDevices } from '.';

const collocationDataSlice = createSlice({
  name: 'collocationData',
  initialState: {
    collocationData: null,
    deviceStatusSummary: null,
    collocationResults: null,
  },
  reducers: {
    addCollocationData(state, action) {
      state.collocationData = action.payload;
    },
    addDeviceStatusSummary(state, action) {
      state.deviceStatusSummary = action.payload;
    },
    addCollocationResults(state, action) {
      state.collocationResults = action.payload;
    },
  },
});

export const { addCollocationData, addDeviceStatusSummary } = collocationDataSlice.actions;

export default collocationDataSlice.reducer;
