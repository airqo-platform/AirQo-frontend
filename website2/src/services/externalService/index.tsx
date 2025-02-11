import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';

import { removeTrailingSlash } from '@/utils';

// ----------------------
// Configuration
// ----------------------

// Define the base URL for the API
const API_BASE_URL = `${removeTrailingSlash(process.env.NEXT_PUBLIC_API_URL || '')}/api/v2`;

// Retrieve the API token from environment variables
const API_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN || '';

// Create an Axios instance with default configurations
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ----------------------
// Generic Request Handlers
// ----------------------

/**
 * Generic GET request handler.
 */
const getRequest = async (
  endpoint: string,
  params?: any,
): Promise<any | null> => {
  try {
    const response: AxiosResponse<any> = await apiClient.get(endpoint, {
      params,
    });
    return response.data;
  } catch (error) {
    handleError(error, `GET ${endpoint}`);
    return null;
  }
};

/**
 * Generic POST request handler.
 */
const postRequest = async (
  endpoint: string,
  body: any,
): Promise<any | null> => {
  try {
    const response: AxiosResponse<any> = await apiClient.post(endpoint, body);
    return response.data;
  } catch (error) {
    handleError(error, `POST ${endpoint}`);
    return null;
  }
};

/**
 * Error handling function.
 */
const handleError = (error: unknown, context: string) => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    console.error(`Error in ${context}:`, axiosError.message);
    if (axiosError.response) {
      console.error('Response data:', axiosError.response.data);
      console.error('Response status:', axiosError.response.status);
    }
  } else {
    console.error(`Unexpected error in ${context}:`, error);
  }
};

/**
 * Subscribe a user to the newsletter.
 */
export const subscribeToNewsletter = async (body: any): Promise<any | null> => {
  return postRequest('/users/newsletter/subscribe', body);
};

/**
 * Post user feedback, inquiry, or contact us message.
 */
export const postContactUs = async (body: any): Promise<any | null> => {
  return postRequest('/users/inquiries/register', body);
};

/**
 * Fetch maintenance data for the website.
 */
export const getMaintenances = async (): Promise<any | null> => {
  return getRequest('/users/maintenances/website');
};

// ----------------------
// Device Services
// ----------------------

/**
 * Fetch grids summary data. Requires API token for authentication.
 */
export const getGridsSummary = async (): Promise<any | null> => {
  try {
    const response: AxiosResponse<any> = await apiClient.get(
      '/devices/grids/summary',
      {
        params: {
          token: API_TOKEN,
        },
      },
    );
    return response.data;
  } catch (error) {
    handleError(error, 'GET /devices/grids/summary');
    return null;
  }
};
