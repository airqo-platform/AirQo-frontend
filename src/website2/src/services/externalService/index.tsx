import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';

import { removeTrailingSlash } from '@/utils';

// ----------------------
// Configuration
// ----------------------

// Define the base URL for the API
const API_BASE_URL = `${removeTrailingSlash(process.env.NEXT_PUBLIC_API_URL || '')}/api/v2`;

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

// (removed unused generic GET helper to avoid lint warnings)

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
  try {
    const response: AxiosResponse<any> = await apiClient.get(
      '/users/maintenances/website',
      {
        // keep timeout short during build to avoid long blocking delays
        timeout: 3000,
      },
    );
    return response.data;
  } catch {
    // Avoid noisy error logs during static generation/builds; caller handles nulls.
    return null;
  }
};

// ----------------------
// Device Services
// ----------------------

/**
 * Fetch grids summary data. Requires API token for authentication.
 */
export const getGridsSummary = async (): Promise<any | null> => {
  try {
    // Use server-side proxy without exposing tokens; support both SSR and CSR
    const isServer = typeof window === 'undefined';
    let url = '/api/proxy?endpoint=devices/grids/summary';
    if (isServer) {
      const origin =
        process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || '';
      if (!origin) {
        throw new Error(
          'SITE_URL or NEXT_PUBLIC_SITE_URL must be set for server-side calls to /api/proxy',
        );
      }
      url = `${origin.replace(/\/$/, '')}/api/proxy?endpoint=devices/grids/summary`;
    }

    // Add a timeout for server-side requests to avoid hanging SSG/SSR
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const proxyResponse = await fetch(url, { signal: controller.signal });
      if (!proxyResponse.ok) {
        throw new Error(`Proxy request failed: ${proxyResponse.statusText}`);
      }
      const data = await proxyResponse.json();
      return data;
    } finally {
      clearTimeout(timeout);
    }
  } catch (error) {
    handleError(error, 'GET /devices/grids/summary');
    return null;
  }
};
