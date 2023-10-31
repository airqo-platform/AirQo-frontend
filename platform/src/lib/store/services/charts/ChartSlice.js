import { createSlice } from '@reduxjs/toolkit';

const startDate = new Date();
startDate.setDate(startDate.getDate() - 7);

const initialState = {
  chartType: 'line',
  timeFrame: 'Daily',
  chartDataRange: {
    startDate: startDate,
    endDate: new Date(),
    label: 'Last 7 days',
  },
  chartSites: [],
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
  },
});

export const { setChartType, setChartTab, setTimeFrame, setChartDataRange } = chartSlice.actions;

export default chartSlice.reducer;
