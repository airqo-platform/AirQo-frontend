import { AIRQLOUDS, REFRESH_AIRQLOUD } from '@/core/urls/deviceRegistry';

export const getAirQloudsApi = async (params) => {
  return await axios
    .get(AIRQLOUDS, { params })
    .then((response) => response.data);
};

export const refreshAirQloudApi = async (params) => {
  return await axios
    .put(REFRESH_AIRQLOUD, {}, { params })
    .then((response) => response.data);
};
