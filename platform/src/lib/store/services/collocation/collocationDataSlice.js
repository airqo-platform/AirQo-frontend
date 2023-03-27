import { createSlice } from '@reduxjs/toolkit';
import { collocateDevices } from '.';

const collocationDataSlice = createSlice({
  name: 'collocationData',
  initialState: {
    collocationData: null,
    deviceStatusSummary: null,
  },
  reducers: {
    addCollocationData(state, action) {
      state.collocationData = action.payload;
    },
    addDeviceStatusSummary(state, action) {
      state.deviceStatusSummary = action.payload;
    },
  },
});

export const { addCollocationData, addDeviceStatusSummary } = collocationDataSlice.actions;

export default collocationDataSlice.reducer;
