import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  collocateDevicesApi,
  getDeviceStatusSummaryApi,
  getCollocationResultsApi,
  getDataCompletenessResultsApi,
  getIntraSensorCorrelationApi,
  getInterSensorCorrelationApi,
  getCollocationBatchResultsApi,
  getCollocationStatisticsApi,
} from '@/core/apis/Collocation';

export const collocateDevices = createAsyncThunk('collocation/activeDevices', async () => {
  const response = await collocateDevicesApi();
  return response;
});

export const getDeviceStatusSummary = createAsyncThunk(
  'collocation/collocationBatchSummary',
  async () => {
    const response = await getDeviceStatusSummaryApi();
    return response.data;
  },
);

export const getCollocationResults = createAsyncThunk(
  'collocation/collocationResults',
  async ({ devices, batchId }) => {
    const response = await getCollocationResultsApi({ devices, batchId });
    return response;
  },
);

export const getDataCompletenessResults = createAsyncThunk(
  'collocation/dataCompletenessData',
  async ({ devices, batchId }) => {
    const response = await getDataCompletenessResultsApi({ devices, batchId });
    return response;
  },
);

export const getIntraSensorCorrelation = createAsyncThunk(
  'collocation/intraSensorCorrelationData',
  async (addIntraSensorInput) => {
    const response = await getIntraSensorCorrelationApi(addIntraSensorInput);
    return response;
  },
);

export const getInterSensorCorrelation = createAsyncThunk(
  'collocation/interSensorCorrelationData',
  async (addInterSensorInput) => {
    const response = await getInterSensorCorrelationApi(addInterSensorInput);
    return response;
  },
);

export const getCollocationStatistics = createAsyncThunk(
  'collocation/collocationStatisticsData',
  async (addCollocationStatisticsInput) => {
    const response = await getCollocationStatisticsApi(addCollocationStatisticsInput);
    return response;
  },
);

export const getCollocationBatchResults = createAsyncThunk(
  'collocation/collocationBatchResults',
  async (batchId) => {
    const response = await getCollocationBatchResultsApi(batchId);
    return response;
  },
);

const collocationSlice = createSlice({
  name: 'collocation',
  initialState: {
    collocationBatchSummary: {
      loading: false,
      data: null,
      error: null,
      fulfilled: false,
      rejected: false,
    },
    dataCompletenessData: {
      loading: false,
      data: null,
      error: null,
      fulfilled: false,
      rejected: false,
    },
    intraSensorCorrelationData: {
      loading: false,
      data: null,
      error: null,
      fulfilled: false,
      rejected: false,
    },
    interSensorCorrelationData: {
      loading: false,
      data: null,
      error: null,
      fulfilled: false,
      rejected: false,
    },
    collocationStatisticsData: {
      loading: false,
      data: null,
      error: null,
      fulfilled: false,
      rejected: false,
    },
    collocationBatchResults: {
      loading: false,
      data: null,
      error: null,
      fulfilled: false,
      rejected: false,
    },
    collocationResults: {
      loading: false,
      data: null,
      error: null,
      fulfilled: false,
      rejected: false,
    },
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getDeviceStatusSummary.pending, (state) => {
        state.collocationBatchSummary.loading = true;
      })
      .addCase(getDeviceStatusSummary.fulfilled, (state, action) => {
        state.collocationBatchSummary.loading = false;
        state.collocationBatchSummary.data = action.payload.data;
      })
      .addCase(getDeviceStatusSummary.rejected, (state, action) => {
        state.collocationBatchSummary.loading = false;
        state.collocationBatchSummary.error = action.error.message || '';
      })
      .addCase(getCollocationResults.pending, (state) => {
        state.collocationResults.loading = true;
      })
      .addCase(getCollocationResults.fulfilled, (state, action) => {
        state.collocationResults.loading = false;
        state.collocationResults.data = action.payload;
      })
      .addCase(getCollocationResults.rejected, (state, action) => {
        state.collocationResults.loading = false;
        state.collocationResults.error = action.error.message || '';
      })
      .addCase(getDataCompletenessResults.pending, (state) => {
        state.dataCompletenessData.loading = true;
      })
      .addCase(getDataCompletenessResults.fulfilled, (state, action) => {
        state.dataCompletenessData.loading = false;
        state.dataCompletenessData.data = action.payload;
      })
      .addCase(getDataCompletenessResults.rejected, (state, action) => {
        state.dataCompletenessData.loading = false;
        state.dataCompletenessData.error = action.error.message || '';
      })
      .addCase(getIntraSensorCorrelation.pending, (state) => {
        state.intraSensorCorrelationData.loading = true;
      })
      .addCase(getIntraSensorCorrelation.fulfilled, (state, action) => {
        state.intraSensorCorrelationData.loading = false;
        state.intraSensorCorrelationData.data = action.payload;
      })
      .addCase(getIntraSensorCorrelation.rejected, (state, action) => {
        state.intraSensorCorrelationData.loading = false;
        state.intraSensorCorrelationData.error = action.error.message || '';
      })
      .addCase(getInterSensorCorrelation.pending, (state) => {
        state.interSensorCorrelationData.loading = true;
      })
      .addCase(getInterSensorCorrelation.fulfilled, (state, action) => {
        state.interSensorCorrelationData.loading = false;
        state.interSensorCorrelationData.data = action.payload;
      })
      .addCase(getInterSensorCorrelation.rejected, (state, action) => {
        state.interSensorCorrelationData.loading = false;
        state.interSensorCorrelationData.error = action.error.message || '';
      })
      .addCase(getCollocationStatistics.pending, (state) => {
        state.collocationStatisticsData.loading = true;
      })
      .addCase(getCollocationStatistics.fulfilled, (state, action) => {
        state.collocationStatisticsData.loading = false;
        state.collocationStatisticsData.data = action.payload;
      })
      .addCase(getCollocationStatistics.rejected, (state, action) => {
        state.collocationStatisticsData.loading = false;
        state.collocationStatisticsData.error = action.error.message || '';
      })
      .addCase(getCollocationBatchResults.pending, (state) => {
        state.collocationBatchResults.loading = true;
      })
      .addCase(getCollocationBatchResults.fulfilled, (state, action) => {
        state.collocationBatchResults.loading = false;
        state.collocationBatchResults.data = action.payload;
      })
      .addCase(getCollocationBatchResults.rejected, (state, action) => {
        state.collocationBatchResults.loading = false;
        state.collocationBatchResults.error = action.error.message || '';
      });
  },
});

export default collocationSlice.reducer;
