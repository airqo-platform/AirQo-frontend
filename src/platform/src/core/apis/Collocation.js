import { api } from '../utils/apiClient';
import { COLLOCATION } from '../urls/deviceMonitoring';

// Collocation API endpoints
export const resetCollocationBatch = (data, params) =>
  api
    .patch(`${COLLOCATION}/reset`, data, { params })
    .then((response) => response.data);

export const getCollocationBatchSummary = () =>
  api.get(`${COLLOCATION}/summary`).then((response) => response.data);

export const collocateDevicesApi = (addMonitorInput) =>
  api.post(COLLOCATION, addMonitorInput);

export const getDeviceStatusSummaryApi = () =>
  api.get(`${COLLOCATION}/summary`);

export const getCollocationResultsApi = ({ devices = '', batchId }) =>
  api.get(`${COLLOCATION}/data?devices=${devices}&batchId=${batchId}`);

export const getDataCompletenessResultsApi = ({ batchId }) =>
  api.get(`${COLLOCATION}/data-completeness?batchId=${batchId}`);

export const getIntraSensorCorrelationApi = ({ devices, batchId }) =>
  api.get(`${COLLOCATION}/intra?devices=${devices}&batchId=${batchId}`);

export const getInterSensorCorrelationApi = ({ devices, batchId }) =>
  api.get(`${COLLOCATION}/inter?devices=${devices}&batchId=${batchId}`);

export const getCollocationStatisticsApi = ({ devices = '', batchId }) =>
  api.get(`${COLLOCATION}/statistics?devices=${devices}&batchId=${batchId}`);

export const getCollocationBatchResultsApi = (batchId) =>
  api.get(`${COLLOCATION}/results?batchId=${batchId}`);
