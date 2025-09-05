import axios, { AxiosError, AxiosInstance } from 'axios';

import { removeTrailingSlash } from '@/utils';

// Define the base URL for the API with proper fallback
const getApiBaseUrl = () => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) {
    console.warn('NEXT_PUBLIC_API_URL is not defined. Using fallback URL.');
    return 'https://platform.airqo.net';
  }
  return removeTrailingSlash(baseUrl);
};

const API_BASE_URL = `${getApiBaseUrl()}/website`;

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
      console.log(`Making API request to: ${config.baseURL}${config.url}`);
      return config;
    },
    (error) => {
      console.error('Request interceptor error:', error);
      return Promise.reject(error);
    },
  );

  apiClient.interceptors.response.use(
    (response) => {
      console.log(`API response from: ${response.config.url}`, response.status);
      return response;
    },
    (error) => {
      console.error(`API error from: ${error.config?.url}`, error.message);
      return Promise.reject(error);
    },
  );
}

// Generic GET request handler
const getRequest = async (endpoint: string): Promise<any> => {
  try {
    const response = await apiClient.get(endpoint);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error(`Error fetching data from ${endpoint}:`, axiosError.message);

    // In development, provide more detailed error information
    if (process.env.NODE_ENV === 'development') {
      if (axiosError.response) {
        console.error('Response data:', axiosError.response.data);
        console.error('Response status:', axiosError.response.status);
      } else if (axiosError.request) {
        console.error('Network error - no response received');
        console.error('Request config:', axiosError.config);
      }
    }

    throw axiosError;
  }
};

// Press Articles API
export const getPressArticles = async (): Promise<any> => {
  try {
    return await getRequest('/press/');
  } catch (error) {
    console.warn('Failed to fetch press articles:', error);
    return []; // Return empty array so components can show "no data" message
  }
};

// Impact Numbers API
export const getImpactNumbers = async (): Promise<any> => {
  try {
    return await getRequest('/impact-number/');
  } catch (error) {
    console.warn('Failed to fetch impact numbers:', error);
    return {}; // Return empty object so components can show "no data" message
  }
};

// Events API
export const getAirQoEvents = async (): Promise<any> => {
  try {
    return await getRequest('/events/?category=airqo');
  } catch (error) {
    console.warn('Failed to fetch AirQo events:', error);
    return []; // Return empty array so components can show "no data" message
  }
};

export const getCleanAirEvents = async (): Promise<any> => {
  try {
    return await getRequest('/events/?category=cleanair');
  } catch (error) {
    console.warn('Failed to fetch Clean Air events:', error);
    return []; // Return empty array so components can show "no data" message
  }
};

export const getEventDetails = async (id: string): Promise<any> => {
  try {
    return await getRequest(`/events/${id}/`);
  } catch (error) {
    console.warn(`Failed to fetch event ${id}:`, error);
    return null; // Return null so components can show "not found" message
  }
};

// Highlights API
export const getHighlights = async (): Promise<any> => {
  try {
    return await getRequest('/highlights/');
  } catch (error) {
    console.warn('Failed to fetch highlights:', error);
    return []; // Return empty array so components can show "no data" message
  }
};

// Careers API
export const getCareers = async (): Promise<any> => {
  return getRequest('/careers/');
};

export const getCareerDetails = async (id: string): Promise<any> => {
  return getRequest(`/careers/${id}/`);
};

// Departments API
export const getDepartments = async (): Promise<any> => {
  return getRequest('/departments/');
};

// Publications API
export const getPublications = async (): Promise<any> => {
  return getRequest('/publications/');
};

// Board Members API
export const getBoardMembers = async (): Promise<any> => {
  return getRequest('/board-members/');
};

// Team Members API
export const getTeamMembers = async (): Promise<any> => {
  return getRequest('/team/');
};

export const getExternalTeamMembers = async (): Promise<any> => {
  return getRequest('/external-team-members/');
};

// Partners API
export const getPartners = async (): Promise<any> => {
  return getRequest('/partners/');
};

export const getPartnerDetails = async (id: string): Promise<any> => {
  return getRequest(`/partners/${id}/`);
};

// Forum Events API
export const getForumEvents = async (): Promise<any> => {
  return getRequest('/forum-events/');
};

export const getForumEventDetails = async (id: string): Promise<any> => {
  return getRequest(`/forum-events/${id}/`);
};

export const getForumEventTitles = async (): Promise<any> => {
  return getRequest('/forum-event-titles/');
};

// Clean Air Resources API
export const getCleanAirResources = async (): Promise<any> => {
  return getRequest('/clean-air-resources/');
};

// African Countries API
export const getAfricanCountries = async (): Promise<any> => {
  return getRequest('/african-countries/');
};
