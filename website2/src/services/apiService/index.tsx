import axios from 'axios';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || '') + '/website';

// Axios instance to include any necessary headers
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Function to fetch press articles
export const getPressArticles = async () => {
  try {
    const response = await apiClient.get('/press/');
    return response.data;
  } catch (error) {
    console.error('Error fetching press articles:', error);
    throw error;
  }
};

// Function to fetch impact numbers
export const getImpactNumbers = async () => {
  try {
    const response = await apiClient.get('/impact-number/');
    return response.data;
  } catch (error) {
    console.error('Error fetching impact numbers:', error);
    throw error;
  }
};

// Function to fetch all events
export const getAirQoEvents = async () => {
  try {
    const response = await apiClient.get('/events/?category=airqo');
    return response.data;
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
};

// Function to fetch all clean air events
export const getCleanAirEvents = async () => {
  try {
    const response = await apiClient.get('/events/?category=cleanair');
    return response.data;
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
};

// Function to fetch a single event by ID
export const getEventDetails = async (id: string) => {
  try {
    const response = await apiClient.get(`/events/${id}/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching event details:', error);
    throw error;
  }
};

// Function to fetch highlights
export const getHighlights = async () => {
  try {
    const response = await apiClient.get('/highlights/');
    return response.data;
  } catch (error) {
    console.error('Error fetching highlights:', error);
    throw error;
  }
};

// Function to fetch careers
export const getCareers = async () => {
  try {
    const response = await apiClient.get('/careers/');
    return response.data;
  } catch (error) {
    console.error('Error fetching careers:', error);
    throw error;
  }
};

// Function to fetch a single career by ID
export const getCareerDetails = async (id: string) => {
  try {
    const response = await apiClient.get(`/careers/${id}/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching career details:', error);
    throw error;
  }
};

// Function to get departments
export const getDepartments = async () => {
  try {
    const response = await apiClient.get('/departments/');
    return response.data;
  } catch (error) {
    console.error('Error fetching departments:', error);
    throw error;
  }
};

// Function to get publications
export const getPublications = async () => {
  try {
    const response = await apiClient.get('/publications/');
    return response.data;
  } catch (error) {
    console.error('Error fetching publications:', error);
    throw error;
  }
};

// Function to get board members
export const getBoardMembers = async () => {
  try {
    const response = await apiClient.get('/board-members/');
    return response.data;
  } catch (error) {
    console.error('Error fetching board members:', error);
    throw error;
  }
};

// Function to get team members
export const getTeamMembers = async () => {
  try {
    const response = await apiClient.get('/team/');
    return response.data;
  } catch (error) {
    console.error('Error fetching team members:', error);
    throw error;
  }
};

// Function to get external team members
export const getExternalTeamMembers = async () => {
  try {
    const response = await apiClient.get('/external-team-members/');
    return response.data;
  } catch (error) {
    console.error('Error fetching external team members:', error);
    throw error;
  }
};

// Functiont to get partners
export const getPartners = async () => {
  try {
    const response = await apiClient.get('/partners/');
    return response.data;
  } catch (error) {
    console.error('Error fetching partners:', error);
    throw error;
  }
};

// function to get a single partner by ID

export const getPartnerDetails = async (id: string) => {
  try {
    const response = await apiClient.get(`/partners/${id}/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching partner details:', error);
    throw error;
  }
};

// Function to get Forum events
export const getForumEvents = async () => {
  try {
    const response = await apiClient.get('/forum-events/');
    return response.data;
  } catch (error) {
    console.error('Error fetching forum events:', error);
    throw error;
  }
};

// Function to get a Forum event by ID
export const getForumEventDetails = async (id: string) => {
  try {
    const response = await apiClient.get(`/forum-events/${id}/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching forum event details:', error);
    throw error;
  }
};

// Function to get clean air resources
export const getCleanAirResources = async () => {
  try {
    const response = await apiClient.get('/clean-air-resources/');
    return response.data;
  } catch (error) {
    console.error('Error fetching clean air resources:', error);
    throw error;
  }
};

// Function to get african-countries
export const getAfricanCountries = async () => {
  try {
    const response = await apiClient.get('/african-countries/');
    return response.data;
  } catch (error) {
    console.error('Error fetching african-countries:', error);
    throw error;
  }
};
