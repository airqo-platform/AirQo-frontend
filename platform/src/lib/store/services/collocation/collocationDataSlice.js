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
    overviewBatch: null,
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
    addOverviewBatch(state, action) {
      if (state.overviewBatch) state.overviewBatch = null;

      if (action.payload && Array.isArray(action.payload)) {
        state.overviewBatch = [...action.payload];
      }
    },
    removeOverviewBatch(state) {
      state.overviewBatch = null;
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
  addOverviewBatch,
  removeOverviewBatch,
  removeActiveSelectedDeviceCollocationReportData,
  removeActiveSelectedDeviceReport,
} = collocationDataSlice.actions;

export default collocationDataSlice.reducer;
