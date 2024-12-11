import axios from 'axios';

import { removeTrailingSlash } from '@/utils';

const API_BASE_URL = `${removeTrailingSlash(process.env.NEXT_PUBLIC_API_URL || '')}/api/v2`;
const API_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN || '';

// Axios instance to include any necessary headers
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Function to subscribe a user to newsletter
export const subscribeToNewsletter = async (body: any) => {
  try {
    const response = await apiClient.post('/users/newsletter/subscribe', body);
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

// Function to post user feedback / inquiry / contact us
export const postContactUs = async (body: any) => {
  try {
    const response = await apiClient.post('/users/inquiries/register', body);
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getMaintenances = async (): Promise<any | null> => {
  try {
    const response = await apiClient.get('/users/maintenances/website');

    return response.data;
  } catch (error) {
    console.error('Error fetching maintenance data:', error);
    return null;
  }
};

// Get grids summary endpoint it uses a api_token to authenticate the request
export const getGridsSummary = async (): Promise<any | null> => {
  try {
    const response = await apiClient.get('/devices/grids/summary', {
      params: {
        token: API_TOKEN,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching grids summary data:', error);
    return null;
  }
};
