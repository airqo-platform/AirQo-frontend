import axios from 'axios';
import {
  AIRQLOUD_SUMMARY,
  NEWSLETTER_SUBSCRIPTION,
  INQUIRY_URL,
  EXPLORE_DATA_URL,
  CAREERS_URL,
  DEPARTMENTS_URL,
  TEAMS_URL,
  HIGHLIGHTS_URL,
  TAGS_URL,
  PARTNERS_URL,
  BOARD_MEMBERS_URL,
  PUBLICATIONS_URL,
  EVENTS_URL,
  CITIES_URL,
  PRESS_URL,
  IMPACT_URL,
  CLEAN_AIR_URL
} from '../config/urls';

const apiCall = async (url, method, data = null) => {
  const config = {
    method: method,
    url: url,
    data: data
  };

  try {
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

export const getAirQloudSummaryApi = () => apiCall(AIRQLOUD_SUMMARY, 'get');

export const newsletterSubscriptionApi = (data) => apiCall(NEWSLETTER_SUBSCRIPTION, 'post', data);

export const contactUsApi = (data) => apiCall(INQUIRY_URL, 'post', data);

export const sendInquiryApi = (data) => apiCall(INQUIRY_URL, 'post', data);

export const requestDataAccessApi = (data) => apiCall(EXPLORE_DATA_URL, 'post', data);

// Careers endpoints
export const getAllCareersApi = async () =>
  await axios.get(CAREERS_URL).then((response) => response.data);

export const getAllDepartmentsApi = async () =>
  await axios.get(DEPARTMENTS_URL).then((response) => response.data);

// Teams endpoints
export const getAllTeamMembersApi = async () =>
  await axios.get(TEAMS_URL).then((response) => response.data);

// Highlights endpoints
export const getAllHighlightsApi = async () =>
  await axios.get(HIGHLIGHTS_URL).then((response) => response.data);
export const getAllTagsApi = async () =>
  await axios.get(TAGS_URL).then((response) => response.data);

// Partners endpoints
export const getAllPartnersApi = async () =>
  await axios.get(PARTNERS_URL).then((response) => response.data);

// Board Members endpoints
export const getBoardMembersApi = async () =>
  await axios.get(BOARD_MEMBERS_URL).then((response) => response.data);

// Publications endpoints
export const getAllPublicationsApi = async () =>
  await axios.get(PUBLICATIONS_URL).then((response) => response.data);

// Press endpoints
export const getAllPressApi = async () =>
  await axios.get(PRESS_URL).then((response) => response.data);

// Events endpoint
export const getAllEventsApi = async () =>
  await axios.get(EVENTS_URL).then((response) => response.data);

// African Cities endpoint
export const getAllCitiesApi = async () =>
  await axios.get(CITIES_URL).then((response) => response.data);

// Impact Numbers endpoint
export const getAllImpactNumbersApi = async () =>
  await axios.get(IMPACT_URL).then((response) => response.data);

// Clean Air endpoints
export const getAllCleanAirApi = async () =>
  await axios.get(CLEAN_AIR_URL).then((response) => response.data);
