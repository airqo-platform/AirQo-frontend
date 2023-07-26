import axios from 'axios';
import { COLLOCATION } from '../urls/deviceMonitoring';
import { NEXT_PUBLIC_API_TOKEN } from '../../lib/envConstants';

export const resetCollocationBatch = async (data, params) =>
  await axios
    .patch(`${COLLOCATION}/reset?token=${NEXT_PUBLIC_API_TOKEN}`, data, { params })
    .then((response) => response.data);
