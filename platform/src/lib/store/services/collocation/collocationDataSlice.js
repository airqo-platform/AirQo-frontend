import { createSlice } from '@reduxjs/toolkit';
import { collocateDevices } from '.';

const collocationDataSlice = createSlice({
  name: 'collocationData',
  initialState: {
    collocationData: null,
    deviceStatusSummary: null,
    collocationResults: null,
    activeSelectedDeviceReport: null,
    activeSelectedDeviceCollocationReportData: null,
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
    addActiveSelectedDeviceReport(state, action) {
      state.activeSelectedDeviceReport = action.payload;
    },
    addActiveSelectedDeviceCollocationReportData(state, action) {
      state.activeSelectedDeviceCollocationReportData = action.payload;
    },
    removeActiveSelectedDeviceCollocationReportData(state) {
      state.activeSelectedDeviceCollocationReportData = null;
    },
    removeActiveSelectedDeviceReport(state) {
      state.activeSelectedDeviceReport = null;
    },
  },
});

export const {
  addCollocationData,
  addDeviceStatusSummary,
  addActiveSelectedDeviceCollocationReportData,
  addActiveSelectedDeviceReport,
  removeActiveSelectedDeviceCollocationReportData,
  removeActiveSelectedDeviceReport,
} = collocationDataSlice.actions;

export default collocationDataSlice.reducer;
