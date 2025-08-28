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

export const collocateDevices = createAsyncThunk(
  'collocation/collocateDevices',
  async (collocateDevices) => {
    const response = await collocateDevicesApi(collocateDevices);
    return response;
  },
);

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
    return response.data;
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
    const response = await getCollocationStatisticsApi(
      addCollocationStatisticsInput,
    );
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
    collocateDevices: {
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
      .addCase(getDeviceStatusSummary.fulfilled, (state, _action) => {
        state.collocationBatchSummary.loading = false;
        state.collocationBatchSummary.data = _action.payload.data;
      })
      .addCase(getDeviceStatusSummary.rejected, (state, _action) => {
        state.collocationBatchSummary.loading = false;
        state.collocationBatchSummary.error = _action.error.message || '';
      })
      .addCase(getCollocationResults.pending, (state) => {
        state.collocationResults.loading = true;
      })
      .addCase(getCollocationResults.fulfilled, (state, _action) => {
        state.collocationResults.loading = false;
        state.collocationResults.data = _action.payload;
      })
      .addCase(getCollocationResults.rejected, (state, _action) => {
        state.collocationResults.loading = false;
        state.collocationResults.error = _action.error.message || '';
      })
      .addCase(getDataCompletenessResults.pending, (state) => {
        state.dataCompletenessData.loading = true;
      })
      .addCase(getDataCompletenessResults.fulfilled, (state, _action) => {
        state.dataCompletenessData.loading = false;
        state.dataCompletenessData.data = _action.payload.data;
      })
      .addCase(getDataCompletenessResults.rejected, (state, _action) => {
        state.dataCompletenessData.loading = false;
        state.dataCompletenessData.error = _action.error.message || '';
      })
      .addCase(getIntraSensorCorrelation.pending, (state) => {
        state.intraSensorCorrelationData.loading = true;
      })
      .addCase(getIntraSensorCorrelation.fulfilled, (state, _action) => {
        state.intraSensorCorrelationData.loading = false;
        state.intraSensorCorrelationData.data = _action.payload.data;
      })
      .addCase(getIntraSensorCorrelation.rejected, (state, _action) => {
        state.intraSensorCorrelationData.loading = false;
        state.intraSensorCorrelationData.error = _action.error.message || '';
      })
      .addCase(getInterSensorCorrelation.pending, (state) => {
        state.interSensorCorrelationData.loading = true;
      })
      .addCase(getInterSensorCorrelation.fulfilled, (state, _action) => {
        state.interSensorCorrelationData.loading = false;
        state.interSensorCorrelationData.data = _action.payload.data;
      })
      .addCase(getInterSensorCorrelation.rejected, (state, _action) => {
        state.interSensorCorrelationData.loading = false;
        state.interSensorCorrelationData.error = _action.error.message || '';
      })
      .addCase(getCollocationStatistics.pending, (state) => {
        state.collocationStatisticsData.loading = true;
      })
      .addCase(getCollocationStatistics.fulfilled, (state, _action) => {
        state.collocationStatisticsData.loading = false;
        state.collocationStatisticsData.data = _action.payload.data;
      })
      .addCase(getCollocationStatistics.rejected, (state, _action) => {
        state.collocationStatisticsData.loading = false;
        state.collocationStatisticsData.error = _action.error.message || '';
      })
      .addCase(getCollocationBatchResults.pending, (state) => {
        state.collocationBatchResults.loading = true;
      })
      .addCase(getCollocationBatchResults.fulfilled, (state, _action) => {
        state.collocationBatchResults.loading = false;
        state.collocationBatchResults.data = _action.payload.data;
      })
      .addCase(getCollocationBatchResults.rejected, (state, _action) => {
        state.collocationBatchResults.loading = false;
        state.collocationBatchResults.error = _action.error.message || '';
      })
      .addCase(collocateDevices.pending, (state) => {
        state.collocateDevices.loading = true;
      })
      .addCase(collocateDevices.fulfilled, (state) => {
        state.collocateDevices.loading = false;
        state.collocateDevices.fulfilled = true;
      })
      .addCase(collocateDevices.rejected, (state, _action) => {
        state.collocateDevices.loading = false;
        state.collocateDevices.error = _action.error.message;
        state.collocateDevices.rejected = true;
      });
  },
});

export default collocationSlice.reducer;
