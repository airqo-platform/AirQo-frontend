import axios from 'axios';

import { removeTrailingSlash } from '@/utils';

const API_BASE_URL = removeTrailingSlash(
  process.env.NEXT_PUBLIC_EXTERNAL_API_URL || 'http://127.0.0.1:8000/api',
);

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
