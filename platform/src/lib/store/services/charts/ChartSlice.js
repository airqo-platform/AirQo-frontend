import { createSlice } from '@reduxjs/toolkit';

const defaultChartSites = process.env.NEXT_PUBLIC_DEFAULT_CHART_SITES?.split(',') || [];

const getStartDate = () => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);
  return startDate.toISOString(); // convert to ISO string
};

const defaultChartTab = 0;
const defaultChartType = 'line';
const defaultTimeFrame = 'daily';
const defaultPollutionType = 'pm2_5';
const defaultOrganizationName = 'airqo';
const defaultChartDataRange = {
  startDate: getStartDate(),
  endDate: new Date().toISOString(), // convert to ISO string
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
    resetChartStore: (state) => {
      Object.assign(state, initialState);
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
} = chartSlice.actions;

export default chartSlice.reducer;
