import { createSlice } from '@reduxjs/toolkit';

const startDate = new Date();
startDate.setDate(startDate.getDate() - 7);

const defaultChartSites = [
  '64a7b5637d31df001e6b7dae',
  '64a5755320511a001d1b4a3e',
  '64a2737f682da700297f9d5c',
  '64a0f81beb6f7700296cfeff',
];

const initialState = {
  chartType: 'line',
  timeFrame: 'Daily',
  chartDataRange: {
    startDate: startDate,
    endDate: new Date(),
    label: 'Last 7 days',
  },
  chartSites: defaultChartSites,
  chartTab: 0,
};

export const chartSlice = createSlice({
  name: 'chart',
  initialState,
  reducers: {
    setChartType: (state, action) => {
      state.chartType = action.payload;
    },
    setChartTab: (state, action) => {
      state.chartTab = action.payload;
    },
    setTimeFrame: (state, action) => {
      state.timeFrame = action.payload;
    },
    setChartDataRange: (state, action) => {
      state.chartDataRange = action.payload;
    },
    setChartSites: (state, action) => {
      state.chartSites = action.payload;
    },
    resetChartStore: (state) => {
      state.chartType = 'line';
      state.timeFrame = 'Daily';
      state.chartDataRange = {
        startDate: startDate,
        endDate: new Date(),
        label: 'Last 7 days',
      };
      state.chartSites = defaultChartSites;
    },
  },
});

export const {
  setChartType,
  setChartTab,
  setTimeFrame,
  setChartDataRange,
  setChartSites,
  resetChartStore,
} = chartSlice.actions;

export default chartSlice.reducer;
