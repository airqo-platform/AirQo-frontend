import { createSlice } from '@reduxjs/toolkit';

const defaultChartSites = [
  '647f3a5d69df500029a2fc93',
  '6461df90dab86000293ba49f',
  '64aafb1843e5f70029a059c4',
  '6373928b7c737c001e78554f',
];

const getStartDate = () => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);
  return startDate;
};

const defaultChartTab = 0;
const defaultChartType = 'line';
const defaultTimeFrame = 'daily';
const defaultPollutionType = 'pm2_5';
const defaultOrganizationName = 'airqo';
const defaultChartDataRange = {
  startDate: getStartDate(),
  endDate: new Date(),
  label: 'Last 7 days',
};

const initialState = {
  chartType: defaultChartType,
  timeFrame: defaultTimeFrame,
  pollutionType: defaultPollutionType,
  organizationName: defaultOrganizationName,
  chartDataRange: defaultChartDataRange,
  chartSites: defaultChartSites,
  userDefaultID: null,
  chartAnalyticsData: [],
  refreshChart: false,
  chartTab: defaultChartTab,
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
    setChartData: (state, action) => {
      state.chartAnalyticsData = action.payload;
    },
    setRefreshChart: (state, action) => {
      state.refreshChart = action.payload;
    },
    clearAll: (state) => {
      state.chartType = '';
      state.timeFrame = '';
      state.pollutionType = '';
      state.organizationName = '';
      state.chartDataRange = {};
      state.chartSites = [];
      state.userDefaultID = null;
      state.chartAnalyticsData = [];
      state.refreshChart = false;
    },
    resetChartStore: (state) => {
      state.chartType = defaultChartType;
      state.timeFrame = defaultTimeFrame;
      state.pollutionType = defaultPollutionType;
      state.organizationName = defaultOrganizationName;
      state.chartDataRange = defaultChartDataRange;
      state.chartSites = defaultChartSites;
      state.userDefaultID = null;
      state.chartAnalyticsData = [];
      state.chartTab = defaultChartTab;
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
  setChartData,
  setRefreshChart,
  clearAll,
} = chartSlice.actions;

export default chartSlice.reducer;
