import { COLLOCATION } from '../urls/deviceMonitoring';
import createAxiosInstance from './axiosConfig';

export const resetCollocationBatch = async (data, params) =>
  await createAxiosInstance()
    .patch(`${COLLOCATION}/reset`, data, { params })
    .then((response) => response.data);
