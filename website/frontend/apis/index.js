import axios from 'axios';
import {
    AIRQLOUD_SUMMARY,
    NEWSLETTER_SUBSCRIPTION,
    INQUIRY_URL,
    EXPLORE_DATA_URL,
    CAREERS_URL,
    DEPARTMENTS_URL,
    TEAMS_URL,
} from 'config/urls';
import { HIGHLIGHTS_URL, TAGS_URL } from '../config/urls';

axios.defaults.headers.common.Authorization = `JWT ${process.env.REACT_APP_AUTHORIZATION_TOKEN}`;

export const getAirQloudSummaryApi = async () => await axios.get(AIRQLOUD_SUMMARY).then((response) => response.data);

export const newsletterSubscriptionApi = async (data) =>
    await axios.post(NEWSLETTER_SUBSCRIPTION, data).then((response) => response.data);

export const contactUsApi = async (data) => await axios.post(INQUIRY_URL, data).then((response) => response.data);

export const sendInquiryApi = async (data) => await axios.post(INQUIRY_URL, data).then((response) => response.data);

export const requestDataAccessApi = async (data) =>
    await axios.post(EXPLORE_DATA_URL, data).then((response) => response.data);

// Careers endpoints
export const getAllCareersApi = async () => await axios.get(CAREERS_URL).then((response) => response.data);

export const getAllDepartmentsApi = async () => await axios.get(DEPARTMENTS_URL).then((response) => response.data);

// Teams endpoints
export const getAllTeamMembersApi = async () => await axios.get(TEAMS_URL).then((response) => response.data);

// Highlights endpoints
export const getAllHighlightsApi = async () => await axios.get(HIGHLIGHTS_URL).then((response) => response.data);
export const getAllTagsApi = async () => await axios.get(TAGS_URL).then((response) => response.data);
