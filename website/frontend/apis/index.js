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
  CLEAN_AIR_URL,
  FORUM_EVENTS_URL
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
    return;
  }
};

const fetchData = async (url, lang) => {
  return await axios
    .get(url, {
      headers: {
        'Accept-Language': lang
      }
    })
    .then((response) => response.data);
};

export const getAirQloudSummaryApi = () => apiCall(AIRQLOUD_SUMMARY, 'get');

export const newsletterSubscriptionApi = (data) => apiCall(NEWSLETTER_SUBSCRIPTION, 'post', data);

export const contactUsApi = (data) => apiCall(INQUIRY_URL, 'post', data);

export const sendInquiryApi = (data) => apiCall(INQUIRY_URL, 'post', data);

export const requestDataAccessApi = (data) => apiCall(EXPLORE_DATA_URL, 'post', data);

// Careers endpoint
export const getAllCareersApi = async (lang) => fetchData(CAREERS_URL, lang);

// Departments endpoint
export const getAllDepartmentsApi = async (lang) => fetchData(DEPARTMENTS_URL, lang);

// Teams endpoint
export const getAllTeamMembersApi = async (lang) => fetchData(TEAMS_URL, lang);

// Highlights endpoint
export const getAllHighlightsApi = async (lang) => fetchData(HIGHLIGHTS_URL, lang);

// Tags endpoint
export const getAllTagsApi = async (lang) => fetchData(TAGS_URL, lang);

// Partners endpoint
export const getAllPartnersApi = async (lang) => fetchData(PARTNERS_URL, lang);

// Board Members endpoint
export const getBoardMembersApi = async (lang) => fetchData(BOARD_MEMBERS_URL, lang);

// Publications endpoint
export const getAllPublicationsApi = async (lang) => fetchData(PUBLICATIONS_URL, lang);

// Events endpoint
export const getAllPressApi = async (lang) => fetchData(PRESS_URL, lang);

// Events endpoint
export const getAllEventsApi = async (lang) => fetchData(EVENTS_URL, lang);

export const getEventApi = async (id, lang) => fetchData(`${EVENTS_URL}/${id}`, lang);

// Cities endpoint
export const getAllCitiesApi = async (lang) => fetchData(CITIES_URL, lang);

// Impact Numbers endpoint
export const getAllImpactNumbersApi = async () => fetchData(IMPACT_URL, null);

// Clean Air endpoint
export const getAllCleanAirApi = async (lang) => fetchData(CLEAN_AIR_URL, lang);

// clean air forum events endpoint
export const getAllCleanAirForumEventsApi = async (lang) => fetchData(FORUM_EVENTS_URL, lang);
