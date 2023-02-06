import axios from 'axios';
import { GET_FAULTS } from '../../config/urls/faultDetection';

export const getFaultsApi = async () => {
  return await axios.get(GET_FAULTS).then((response) => response.data);
};
