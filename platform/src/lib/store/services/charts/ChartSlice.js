import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  chartType: 'line',
  timeFrame: 'Hourly',
  chartDataRange: 'last 7 days',
  chartData: [],
};

export const chartSlice = createSlice({
  name: 'chart',
  initialState,
  reducers: {
    setChartType: (state, action) => {
      state.chartType = action.payload;
    },
    setChartData: (state, action) => {
      state.chartData = action.payload;
    },
    setTimeFrame: (state, action) => {
      state.timeFrame = action.payload;
    },
    setChartDataRange: (state, action) => {
      state.chartDataRange = action.payload;
    },
  },
});

export const { setChartType, setChartData, setTimeFrame, setChartDataRange } = chartSlice.actions;

export default chartSlice.reducer;
