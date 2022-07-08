import axios from 'axios';

const GET_FAULTS = 'http://127.0.0.1:4001/api/v1/get-faults';
export const getFaultsApi = async () => {
  return await axios.get(GET_FAULTS).then((response) => response.data);
};

// export const client = axios.create({
//   baseURL: GET_FAULTS,
// });
