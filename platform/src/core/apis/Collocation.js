import axios from 'axios';
import { COLLOCATION } from '../urls/deviceMonitoring';

export const resetCollocationBatch = async (data, params) =>
  await axios.patch(`${COLLOCATION}/reset`, data, { params }).then((response) => response.data);
