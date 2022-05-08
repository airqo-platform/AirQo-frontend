import axios from 'axios';
import { AIRQLOUD_SUMMARY } from 'config/urls';

export const getAirQloudSummaryApi = async () => await axios
  .get(AIRQLOUD_SUMMARY)
  .then((response) => response.data);
