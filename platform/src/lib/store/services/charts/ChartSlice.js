import { createSlice } from '@reduxjs/toolkit';

/**
 * Calculates the ISO string for the date 7 days prior to today.
 * @returns {string} ISO string of the start date.
 */
const getStartDate = () => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);
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
  chartSites: [], // Initialize as empty array
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
     * @param {object} state - Current state.
     * @param {object} action - Action containing the new chart type.
     */
    setChartType: (state, action) => {
      const newChartType = action.payload;
      if (state.chartType !== newChartType) {
        state.chartType = newChartType;
      }
    },

    /**
     * Sets the current chart tab index.
     * Prevents unnecessary state updates by checking for changes.
     * @param {object} state - Current state.
     * @param {object} action - Action containing the new chart tab index.
     */
    setChartTab: (state, action) => {
      const newChartTab = action.payload;
      if (state.chartTab !== newChartTab) {
        state.chartTab = newChartTab;
      }
    },

    /**
     * Sets the time frame (e.g., 'daily', 'weekly').
     * Ensures state updates only occur when necessary.
     * @param {object} state - Current state.
     * @param {object} action - Action containing the new time frame.
     */
    setTimeFrame: (state, action) => {
      const newTimeFrame = action.payload;
      if (state.timeFrame !== newTimeFrame) {
        state.timeFrame = newTimeFrame;
      }
    },

    /**
     * Sets the chart data range.
     * Expects an object with 'startDate', 'endDate', and 'label'.
     * Updates state only if any of these values change.
     * @param {object} state - Current state.
     * @param {object} action - Action containing the new chart data range.
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
     * If the payload is empty or not provided, defaults to an empty array.
     * @param {object} state - Current state.
     * @param {object} action - Action containing the new chart sites array.
     */
    setChartSites: (state, action) => {
      const newChartSites = action.payload;

      if (!Array.isArray(newChartSites) || newChartSites.length === 0) {
        if (state.chartSites.length !== 0) {
          state.chartSites = [];
        }
      } else {
        const isDifferent =
          state.chartSites.length !== newChartSites.length ||
          !newChartSites.every(
            (site, index) => site === state.chartSites[index],
          );

        if (isDifferent) {
          state.chartSites = newChartSites;
        }
      }
    },

    /**
     * Sets the pollutant type (e.g., 'pm2_5', 'pm10').
     * Avoids redundant updates by checking current state.
     * @param {object} state - Current state.
     * @param {object} action - Action containing the new pollutant type.
     */
    setPollutant: (state, action) => {
      const newPollutant = action.payload;
      if (state.pollutionType !== newPollutant) {
        state.pollutionType = newPollutant;
      }
    },

    /**
     * Sets the organization name.
     * Ensures updates occur only when there's a change.
     * @param {object} state - Current state.
     * @param {object} action - Action containing the new organization name.
     */
    setOrganizationName: (state, action) => {
      const newOrganizationName = action.payload;
      if (state.organizationName !== newOrganizationName) {
        state.organizationName = newOrganizationName;
      }
    },

    /**
     * Sets the user's default ID.
     * Prevents unnecessary state changes by checking existing value.
     * @param {object} state - Current state.
     * @param {object} action - Action containing the new user default ID.
     */
    setDefaultID: (state, action) => {
      const newDefaultID = action.payload;
      if (state.userDefaultID !== newDefaultID) {
        state.userDefaultID = newDefaultID;
      }
    },

    /**
     * Sets the chart analytics data.
     * Replaces the existing data with the new payload.
     * @param {object} state - Current state.
     * @param {object} action - Action containing the new analytics data array.
     */
    setChartData: (state, action) => {
      state.chartAnalyticsData = action.payload;
    },

    /**
     * Sets the refreshChart flag.
     * Only updates if the new value differs from the current state.
     * @param {object} state - Current state.
     * @param {object} action - Action containing the new refresh flag value.
     */
    setRefreshChart: (state, action) => {
      const newRefreshFlag = action.payload;
      if (state.refreshChart !== newRefreshFlag) {
        state.refreshChart = newRefreshFlag;
      }
    },

    /**
     * Resets the chart store to the initial state.
     * Useful for scenarios like user logout or resetting filters.
     * @param {object} state - Current state.
     */
    resetChartStore: (state) => {
      Object.assign(state, initialState);
    },

    /**
     * Sets multiple chart data properties at once.
     * Accepts an object containing one or more chart slice properties.
     * Only updates allowed properties and prevents invalid state mutations.
     * @param {object} state - Current state.
     * @param {object} action - Action containing the properties to update.
     */
    setChartDataAtOnce: (state, action) => {
      const allowedKeys = Object.keys(initialState);
      Object.entries(action.payload).forEach(([key, value]) => {
        if (allowedKeys.includes(key)) {
          if (key === 'chartSites') {
            if (!Array.isArray(value) || value.length === 0) {
              if (state.chartSites.length !== 0) {
                state.chartSites = [];
              }
            } else {
              const isDifferent =
                state.chartSites.length !== value.length ||
                !value.every((site, index) => site === state.chartSites[index]);

              if (isDifferent) {
                state.chartSites = value;
              }
            }
          } else {
            if (state[key] !== value) {
              state[key] = value;
            }
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
