import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  chartType: 'line',
  timeFrame: 'Hourly',
  chartDataRange: {
    startDate: new Date(),
    endDate: new Date(),
    label: 'Today',
  },
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
