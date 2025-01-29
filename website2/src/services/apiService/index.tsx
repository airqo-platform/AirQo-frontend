import axios, { AxiosError, AxiosInstance } from 'axios';

import { removeTrailingSlash } from '@/utils';

// Define the base URL for the API
const API_BASE_URL = `${removeTrailingSlash(process.env.NEXT_PUBLIC_API_URL || '')}/website`;

// Create an Axios instance with default configurations
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Generic GET request handler
const getRequest = async (endpoint: string): Promise<any> => {
  try {
    const response = await apiClient.get(endpoint);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error(`Error fetching data from ${endpoint}:`, axiosError.message);
    throw axiosError;
  }
};

// Press Articles API
export const getPressArticles = async (): Promise<any> => {
  return getRequest('/press/');
};

// Impact Numbers API
export const getImpactNumbers = async (): Promise<any> => {
  return getRequest('/impact-number/');
};

// Events API
export const getAirQoEvents = async (): Promise<any> => {
  return getRequest('/events/?category=airqo');
};

export const getCleanAirEvents = async (): Promise<any> => {
  return getRequest('/events/?category=cleanair');
};

export const getEventDetails = async (id: string): Promise<any> => {
  return getRequest(`/events/${id}/`);
};

// Highlights API
export const getHighlights = async (): Promise<any> => {
  return getRequest('/highlights/');
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

// Clean Air Resources API
export const getCleanAirResources = async (): Promise<any> => {
  return getRequest('/clean-air-resources/');
};

// African Countries API
export const getAfricanCountries = async (): Promise<any> => {
  return getRequest('/african-countries/');
};
