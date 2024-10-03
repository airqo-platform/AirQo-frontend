import axios, { AxiosInstance } from 'axios';
import { getSession } from 'next-auth/react';

import { handleApiError, getCachedData, setCachedData } from '@/utils';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const API_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN;

const createAxiosInstance = async (): Promise<AxiosInstance> => {
  const session = (await getSession()) as any;
  const accessToken = session?.accessToken;

  return axios.create({
    baseURL: BASE_URL,
    headers: {
      Authorization: `${accessToken}`,
      'Content-Type': 'application/json',
    },
    timeout: 200000, // 200 seconds
  });
};

// Get Report Data with improved error handling
export const getReportData = async (data: any): Promise<any> => {
  try {
    const response = await axios.post(
      `${BASE_URL}/analytics/grid/report`,
      data,
      {
        params: {
          token: API_TOKEN,
        },
      },
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw new Error('Failed to fetch report data. Please try again later.');
  }
};

// Get Grid Data with caching to avoid redundant API calls
export const getGridData = async (): Promise<any> => {
  const cacheKey = '/devices/grids/summary';
  const cachedData = getCachedData(cacheKey);

  if (cachedData) {
    return cachedData;
  }

  try {
    const axiosInstance = await createAxiosInstance();
    const response = await axiosInstance.get(cacheKey);
    setCachedData(cacheKey, response.data);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw new Error('Failed to fetch grid data. Please try again later.');
  }
};

// users feedback
export const sendFeedback = async (data: any): Promise<any> => {
  try {
    const axiosInstance = await createAxiosInstance();
    const response = await axiosInstance.post(
      `${BASE_URL}/users/feedback`,
      data,
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw new Error('Failed to send feedback. Please try again later.');
  }
};
