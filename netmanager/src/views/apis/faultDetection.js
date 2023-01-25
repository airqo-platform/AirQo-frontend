import axios from 'axios';

const GET_FAULTS = `${process.env.REACT_APP_BASE_URL}get-faults`;
export const getFaultsApi = async () => {
  return await axios.get(GET_FAULTS).then((response) => response.data);
};

// export const client = axios.create({
//   baseURL: GET_FAULTS,
// });
