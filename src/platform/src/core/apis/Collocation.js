import { secureApiProxy, AUTH_TYPES } from '../utils/secureApiProxyClient';
import { COLLOCATION } from '../urls/deviceMonitoring';

export const resetCollocationBatch = (data, params) =>
  secureApiProxy
    .patch(`${COLLOCATION}/reset`, data, { params, authType: AUTH_TYPES.JWT })
    .then((response) => response.data);

export const getCollocationBatchSummary = () =>
  secureApiProxy
    .get(`${COLLOCATION}/summary`, { authType: AUTH_TYPES.JWT })
    .then((response) => response.data);

export const collocateDevicesApi = (addMonitorInput) =>
  secureApiProxy.post(COLLOCATION, addMonitorInput, {
    authType: AUTH_TYPES.JWT,
  });

export const getDeviceStatusSummaryApi = () =>
  secureApiProxy.get(`${COLLOCATION}/summary`, { authType: AUTH_TYPES.JWT });

export const getCollocationResultsApi = ({ devices = '', batchId }) =>
  secureApiProxy.get(`${COLLOCATION}/data`, {
    params: { devices, batchId },
    authType: AUTH_TYPES.JWT,
  });

export const getDataCompletenessResultsApi = ({ batchId }) =>
  secureApiProxy.get(`${COLLOCATION}/data-completeness`, {
    params: { batchId },
    authType: AUTH_TYPES.JWT,
  });

export const getIntraSensorCorrelationApi = ({ devices, batchId }) =>
  secureApiProxy.get(`${COLLOCATION}/intra`, {
    params: { devices, batchId },
    authType: AUTH_TYPES.JWT,
  });

export const getInterSensorCorrelationApi = ({ devices, batchId }) =>
  secureApiProxy.get(`${COLLOCATION}/inter`, {
    params: { devices, batchId },
    authType: AUTH_TYPES.JWT,
  });

export const getCollocationStatisticsApi = ({ devices = '', batchId }) =>
  secureApiProxy.get(`${COLLOCATION}/statistics`, {
    params: { devices, batchId },
    authType: AUTH_TYPES.JWT,
  });

export const getCollocationBatchResultsApi = (batchId) =>
  secureApiProxy.get(`${COLLOCATION}/results`, {
    params: { batchId },
    authType: AUTH_TYPES.JWT,
  });
