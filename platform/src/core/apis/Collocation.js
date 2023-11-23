import { COLLOCATION } from '../urls/deviceMonitoring';
import createAxiosInstance from './axiosConfig';

const postRequest = async (url, data) => {
  const response = await createAxiosInstance().post(url, data);
  return response;
};

const getRequest = async (url) => {
  const response = await createAxiosInstance().get(url);
  return response;
};

export const resetCollocationBatch = async (data, params) =>
  await createAxiosInstance()
    .patch(`${COLLOCATION}/reset`, data, { params })
    .then((response) => response.data);

export const getCollocationBatchSummary = async () =>
  await getRequest(`${COLLOCATION}/summary`).then((response) => response.data);

export const collocateDevicesApi = async (addMonitorInput) => {
  const response = await postRequest(`${COLLOCATION}`, addMonitorInput);
  return response;
};

export const getDeviceStatusSummaryApi = async () => {
  const response = await getRequest(`${COLLOCATION}/summary`);
  return response;
};

export const getCollocationResultsApi = async ({ devices, batchId }) => {
  const response = await getRequest(
    `${COLLOCATION}/data?devices=${devices || ''}&batchId=${batchId}`,
  );
  return response;
};

export const getDataCompletenessResultsApi = async ({ devices, batchId }) => {
  const response = await getRequest(`${COLLOCATION}/data-completeness?batchId=${batchId}`);
  return response;
};

export const getIntraSensorCorrelationApi = async (addIntraSensorInput) => {
  const response = await getRequest(
    `${COLLOCATION}/intra?devices=${addIntraSensorInput.devices}&batchId=${addIntraSensorInput.batchId}`,
  );
  return response;
};

export const getInterSensorCorrelationApi = async (addInterSensorInput) => {
  const response = await getRequest(
    `${COLLOCATION}/inter?devices=${addInterSensorInput.devices}&batchId=${addInterSensorInput.batchId}`,
  );
  return response;
};

export const getCollocationStatisticsApi = async (addCollocationStatisticsInput) => {
  const response = await getRequest(
    `${COLLOCATION}/statistics?devices=${addCollocationStatisticsInput.devices || ''}&batchId=${
      addCollocationStatisticsInput.batchId
    }`,
  );
  return response;
};

export const getCollocationBatchResultsApi = async (batchId) => {
  const response = await getRequest(`${COLLOCATION}/results?batchId=${batchId}`);
  return response;
};
