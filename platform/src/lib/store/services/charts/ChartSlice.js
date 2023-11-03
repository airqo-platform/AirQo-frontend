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
  chartAnalyticsData: [],
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
    setChartData: (state, action) => {
      state.chartAnalyticsData = action.payload;
    },
    resetChartStore: (state) => {
      state.chartType = 'line';
      state.timeFrame = 'daily';
      state.pollutionType = 'pm2_5';
      state.organizationName = 'airqo';
      state.userDefaultID = null;
      state.chartAnalyticsData = [];
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
  setChartData,
} = chartSlice.actions;

export default chartSlice.reducer;
