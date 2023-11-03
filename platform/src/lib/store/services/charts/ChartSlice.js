import { createSlice } from '@reduxjs/toolkit';

const defaultChartSites = [
  '64a7b5637d31df001e6b7dae',
  '64a5755320511a001d1b4a3e',
  '64a2737f682da700297f9d5c',
  '64a0f81beb6f7700296cfeff',
];

const getStartDate = () => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);
  return startDate;
};

const initialState = {
  chartType: 'line',
  timeFrame: 'daily',
  pollutionType: 'pm2_5',
  organizationName: 'airqo',
  chartDataRange: {
    startDate: getStartDate(),
    endDate: new Date(),
    label: 'Last 7 days',
  },
  chartSites: defaultChartSites,
  userDefaultID: null,
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
    setPollutant: (state, action) => {
      state.pollutionType = action.payload;
    },
    setOrganizationName: (state, action) => {
      state.organizationName = action.payload;
    },
    setDefaultID: (state, action) => {
      state.userDefaultID = action.payload;
    },
    resetChartStore: (state) => {
      state.chartType = 'line';
      state.timeFrame = 'Daily';
      state.pollutionType = 'pm2_5';
      state.organizationName = 'airqo';
      state.userDefaultID = null;
      state.chartDataRange = {
        startDate: getStartDate(),
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
  setPollutant,
  setOrganizationName,
  setDefaultID,
} = chartSlice.actions;

export default chartSlice.reducer;
