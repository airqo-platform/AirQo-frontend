import axios from 'axios';
import { AIRQLOUD_SUMMARY, NEWSLETTER_SUBSCRIPTION } from 'config/urls';

export const getAirQloudSummaryApi = async () => await axios
  .get(AIRQLOUD_SUMMARY)
  .then((response) => response.data);

export const newsletterSubscriptionApi = async (data) => await axios
  .post(NEWSLETTER_SUBSCRIPTION, data)
  .then((response) => response.data);
