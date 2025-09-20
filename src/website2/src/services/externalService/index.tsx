import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';

// ----------------------
// Configuration
// ----------------------

// Define the base URL for the API with proper fallback
const getApiBaseUrl = () => {
  // Use our API proxy route instead of direct external API calls
  return '/api/proxy';
};

const API_BASE_URL = getApiBaseUrl();

// Create an Axios instance with default configurations
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: process.env.NODE_ENV === 'development' ? 15000 : 10000, // Longer timeout in dev
  validateStatus: (status: number) => {
    return status >= 200 && status < 300;
  },
});

// Add request interceptor for development debugging
if (process.env.NODE_ENV === 'development') {
  apiClient.interceptors.request.use(
    (config) => {
      if (process.env.NODE_ENV === 'development') {
        // Use debug level so it's easier to filter in console
        console.debug(`Making API request to: ${config.baseURL}${config.url}`);
      }
      return config;
    },
    (error) => {
      if (process.env.NODE_ENV === 'development') {
        console.error('Request interceptor error:', error);
      }
      return Promise.reject(error);
    },
  );

  apiClient.interceptors.response.use(
    (response) => {
      if (process.env.NODE_ENV === 'development') {
        console.debug(
          `API response from: ${response.config.url}`,
          response.status,
        );
      }
      return response;
    },
    (error) => {
      if (process.env.NODE_ENV === 'development') {
        console.error(`API error from: ${error.config?.url}`, error.message);
      }
      return Promise.reject(error);
    },
  );
}

// ----------------------
// Generic Request Handlers
// ----------------------

/**
 * Generic POST request handler.
 */
const postRequest = async (
  endpoint: string,
  body: any,
): Promise<any | null> => {
  try {
    const response: AxiosResponse<any> = await apiClient.post('', {
      endpoint,
      method: 'POST',
      data: body,
    });
    return response.data;
  } catch (error) {
    handleError(error, `POST ${endpoint}`);
    if (process.env.NODE_ENV === 'development') {
      // Keep a lightweight warning in development for easier debugging
      console.warn('POST request failed for endpoint:', endpoint);
    }
    return null;
  }
};

/**
 * Error handling function.
 */
const handleError = (error: unknown, context: string) => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    if (process.env.NODE_ENV === 'development') {
      console.error(`Error in ${context}:`, axiosError.message);
    }
    if (axiosError.response) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Response data:', axiosError.response.data);
        console.error('Response status:', axiosError.response.status);
      }
    } else if (axiosError.request) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Network error - no response received');
        console.error('Request config:', axiosError.config);
      }
    }
  } else {
    if (process.env.NODE_ENV === 'development') {
      console.error(`Unexpected error in ${context}:`, error);
    }
  }
};

/**
 * Subscribe a user to the newsletter.
 */
export const subscribeToNewsletter = async (body: any): Promise<any | null> => {
  return postRequest('/api/v2/users/newsletter/subscribe', body);
};

/**
 * Post user feedback, inquiry, or contact us message.
 */
export const postContactUs = async (body: any): Promise<any | null> => {
  return postRequest('/api/v2/users/inquiries/register', body);
};

// ----------------------
// Device Services
// ----------------------

/**
 * Fetch grids summary data. Uses server-side API token for authentication.
 */
export const getGridsSummary = async (): Promise<any | null> => {
  try {
    // Use our proxy route that handles authentication server-side
    const response: AxiosResponse<any> = await axios.post(
      '/api/proxy',
      { endpoint: '/api/v2/devices/grids/summary', method: 'GET' },
      { timeout: 8000 },
    );
    return response.data;
  } catch (error) {
    handleError(error, 'GET /devices/grids/summary');
    if (process.env.NODE_ENV === 'development') {
      console.warn('Failed to fetch grids summary from API');
    }
    return null; // Return null so components can show "no data" message
  }
};
