import { createSlice } from '@reduxjs/toolkit';

const getStartDate = () => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);
  return startDate.toISOString();
};

const defaultChartDataRange = {
  startDate: getStartDate(),
  endDate: new Date().toISOString(),
  label: 'Last 7 days',
};

const initialState = {
  chartType: 'line',
  timeFrame: 'daily',
  pollutionType: 'pm2_5',
  organizationName: 'airqo',
  chartDataRange: defaultChartDataRange,
  chartSites: [],
  userDefaultID: null,
  chartAnalyticsData: [],
  refreshChart: false,
  chartTab: 0,
  aqStandard: {
    name: 'WHO',
    value: {
      pm2_5: 15,
      pm10: 45,
      no2: 25,
    },
  },
};

const chartSlice = createSlice({
  name: 'chart',
  initialState,
  reducers: {
    setChartType: (state, action) => {
      const newChartType = action.payload;
      if (state.chartType !== newChartType) {
        state.chartType = newChartType;
      }
    },

    setChartTab: (state, action) => {
      const newChartTab = action.payload;
      if (state.chartTab !== newChartTab) {
        state.chartTab = newChartTab;
      }
    },

    setTimeFrame: (state, action) => {
      const newTimeFrame = action.payload;
      if (state.timeFrame !== newTimeFrame) {
        state.timeFrame = newTimeFrame;
      }
    },

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

    setPollutant: (state, action) => {
      const newPollutant = action.payload;
      if (state.pollutionType !== newPollutant) {
        state.pollutionType = newPollutant;
      }
    },

    setOrganizationName: (state, action) => {
      const newOrganizationName = action.payload;
      if (state.organizationName !== newOrganizationName) {
        state.organizationName = newOrganizationName;
      }
    },

    setDefaultID: (state, action) => {
      const newDefaultID = action.payload;
      if (state.userDefaultID !== newDefaultID) {
        state.userDefaultID = newDefaultID;
      }
    },

    setChartData: (state, action) => {
      state.chartAnalyticsData = action.payload;
    },

    setRefreshChart: (state, action) => {
      const newRefreshFlag = action.payload;
      if (state.refreshChart !== newRefreshFlag) {
        state.refreshChart = newRefreshFlag;
      }
    },

    resetChartStore: (state) => {
      Object.assign(state, initialState);
    },

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
          } else if (key === 'aqStandard') {
            if (
              state.aqStandard.name !== value.name ||
              state.aqStandard.value.pm2_5 !== value.value.pm2_5 ||
              state.aqStandard.value.pm10 !== value.value.pm10 ||
              state.aqStandard.value.no2 !== value.value.no2
            ) {
              state.aqStandard = value;
            }
          } else {
            if (state[key] !== value) {
              state[key] = value;
            }
          }
        }
      });
    },
    setAqStandard: (state, action) => {
      const newStandard = action.payload;
      if (
        state.aqStandard.name !== newStandard.name ||
        state.aqStandard.value.pm2_5 !== newStandard.value.pm2_5 ||
        state.aqStandard.value.pm10 !== newStandard.value.pm10 ||
        state.aqStandard.value.no2 !== newStandard.value.no2
      ) {
        state.aqStandard = newStandard;
      }
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
  setChartDataAtOnce,
  setAqStandard,
} = chartSlice.actions;

export default chartSlice.reducer;
