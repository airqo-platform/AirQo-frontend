import axios from 'axios';
import { AIRQLOUD_SUMMARY, NEWSLETTER_SUBSCRIPTION, INQUIRY_URL, EXPLORE_DATA_REQUEST } from 'config/urls';

export const getAirQloudSummaryApi = async () => await axios
  .get(AIRQLOUD_SUMMARY)
  .then((response) => response.data);

export const newsletterSubscriptionApi = async (data) => await axios
  .post(NEWSLETTER_SUBSCRIPTION, data)
  .then((response) => response.data);

export const contactUsApi = async (data) => await axios
  .post(INQUIRY_URL, data)
  .then((response) => response.data);

export const sendInquiryApi = async (data) => await axios
  .post(INQUIRY_URL, data)
  .then((response) => response.data);

export const requestDataAccessApi = async (data) => await axios
  .post(EXPLORE_DATA_REQUEST, data)
  .then(response => response.data);
