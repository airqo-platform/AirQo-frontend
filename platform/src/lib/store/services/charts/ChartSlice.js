import { createSlice } from '@reduxjs/toolkit';

/**
 * Parses the environment variable for default chart sites.
 * Trims each site ID to remove any leading/trailing whitespace.
 */
const defaultChartSites = process.env.NEXT_PUBLIC_DEFAULT_CHART_SITES
  ? process.env.NEXT_PUBLIC_DEFAULT_CHART_SITES.split(',').map((site) =>
      site.trim(),
    )
  : [];

/**
 * Utility function to calculate the ISO string for 7 days ago from the current date.
 * Ensures that the date is set accurately in UTC.
 */
const getStartDate = () => {
  const startDate = new Date();
  startDate.setUTCDate(startDate.getUTCDate() - 7);
  return startDate.toISOString();
};

/**
 * Default chart data range representing the last 7 days.
 */
const defaultChartDataRange = {
  startDate: getStartDate(),
  endDate: new Date().toISOString(),
  label: 'Last 7 days',
};

/**
 * Initial state for the chart slice.
 */
const initialState = {
  chartType: 'line',
  timeFrame: 'daily',
  pollutionType: 'pm2_5',
  organizationName: 'airqo',
  chartDataRange: defaultChartDataRange,
  chartSites: defaultChartSites,
  userDefaultID: null,
  chartAnalyticsData: [],
  refreshChart: false,
  chartTab: 0,
};

/**
 * Chart slice using Redux Toolkit's createSlice.
 * Manages state related to charts, including type, data range, selected sites, etc.
 */
const chartSlice = createSlice({
  name: 'chart',
  initialState,
  reducers: {
    /**
     * Sets the chart type ('line' or 'bar').
     * Only updates if the new type differs from the current state to prevent unnecessary re-renders.
     */
    setChartType: (state, action) => {
      if (state.chartType !== action.payload) {
        state.chartType = action.payload;
      }
    },

    /**
     * Sets the current chart tab index.
     * Prevents unnecessary state updates by checking for changes.
     */
    setChartTab: (state, action) => {
      if (state.chartTab !== action.payload) {
        state.chartTab = action.payload;
      }
    },

    /**
     * Sets the time frame (e.g., 'daily', 'weekly').
     * Ensures state updates only occur when necessary.
     */
    setTimeFrame: (state, action) => {
      if (state.timeFrame !== action.payload) {
        state.timeFrame = action.payload;
      }
    },

    /**
     * Sets the chart data range.
     * Expects an object with 'startDate', 'endDate', and 'label'.
     * Updates state only if any of these values change.
     */
    setChartDataRange: (state, action) => {
      const { startDate, endDate, label } = action.payload;
      if (
        state.chartDataRange.startDate !== startDate ||
        state.chartDataRange.endDate !== endDate ||
        state.chartDataRange.label !== label
      ) {
        state.chartDataRange = { startDate, endDate, label };
      }
    },

    /**
     * Sets the selected chart sites.
     * Accepts an array of site IDs.
     * Uses JSON.stringify for deep comparison to prevent unnecessary updates.
     */
    setChartSites: (state, action) => {
      if (JSON.stringify(state.chartSites) !== JSON.stringify(action.payload)) {
        state.chartSites = action.payload;
      }
    },

    /**
     * Sets the pollutant type (e.g., 'pm2_5', 'pm10').
     * Avoids redundant updates by checking current state.
     */
    setPollutant: (state, action) => {
      if (state.pollutionType !== action.payload) {
        state.pollutionType = action.payload;
      }
    },

    /**
     * Sets the organization name.
     * Ensures updates occur only when there's a change.
     */
    setOrganizationName: (state, action) => {
      if (state.organizationName !== action.payload) {
        state.organizationName = action.payload;
      }
    },

    /**
     * Sets the user's default ID.
     * Prevents unnecessary state changes by checking existing value.
     */
    setDefaultID: (state, action) => {
      if (state.userDefaultID !== action.payload) {
        state.userDefaultID = action.payload;
      }
    },

    /**
     * Sets the chart analytics data.
     * Accepts an array of data points.
     * Uses deep comparison to avoid redundant updates.
     */
    setChartData: (state, action) => {
      if (
        JSON.stringify(state.chartAnalyticsData) !==
        JSON.stringify(action.payload)
      ) {
        state.chartAnalyticsData = action.payload;
      }
    },

    /**
     * Sets the refreshChart flag.
     * Only updates if the new value differs from the current state.
     */
    setRefreshChart: (state, action) => {
      if (state.refreshChart !== action.payload) {
        state.refreshChart = action.payload;
      }
    },

    /**
     * Resets the chart store to the initial state.
     * Useful for scenarios like user logout or resetting filters.
     */
    resetChartStore: (state) => {
      Object.assign(state, initialState);
    },

    /**
     * Sets multiple chart data properties at once.
     * Accepts an object containing one or more chart slice properties.
     * Only updates allowed properties and prevents invalid state mutations.
     */
    setChartDataAtOnce: (state, action) => {
      const allowedKeys = Object.keys(initialState);
      Object.keys(action.payload).forEach((key) => {
        if (allowedKeys.includes(key)) {
          // Only update if the value is different
          if (
            JSON.stringify(state[key]) !== JSON.stringify(action.payload[key])
          ) {
            state[key] = action.payload[key];
          }
        }
      });
    },
  },
});

// Exporting actions for use in components
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
  setChartDataAtOnce,
} = chartSlice.actions;

export default chartSlice.reducer;
