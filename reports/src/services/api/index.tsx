import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const API_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN;

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  params: {
    token: API_TOKEN,
  },
  maxContentLength: Infinity,
  maxBodyLength: Infinity,
  decompress: false,
});

export const getReportData = async (data: any) => {
  const response = await axiosInstance.post('/analytics/grid/report', data);
  return response.data;
};

export const getGridData = async () => {
  const response = await axiosInstance.get('/devices/grids/summary');
  return response.data;
};
