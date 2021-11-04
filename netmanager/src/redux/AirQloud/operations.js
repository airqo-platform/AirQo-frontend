import { CURRENT_AIRQLOUD_KEY } from "config/localStorageKeys";
import {
  LOAD_ALL_AIRQLOUDS_SUCCESS,
  LOAD_ALL_AIRQLOUDS_FAILURE,
  SET_CURRENT_AIRQLOUD_SUCCESS,
  SET_CURRENT_AIRQLOUD_FAILURE,
} from "./actions";
import { isEmpty } from "underscore";
import { getAirQloudsApi } from "views/apis/deviceRegistry";
import { transformArray } from "../utils";
import { createSiteOptions } from "utils/sites";

const createAirqloudSiteOptions = (airqloud) => {
  return { ...airqloud, siteOptions: createSiteOptions(airqloud.sites || []) };
};

export const loadAirQloudsData = () => async (dispatch) => {
  return await getAirQloudsApi({})
    .then((resData) => {
      if (isEmpty(resData.airqlouds || [])) return;
      dispatch({
        type: LOAD_ALL_AIRQLOUDS_SUCCESS,
        payload: transformArray(resData.airqlouds, "_id"),
      });
    })
    .catch((err) => {
      dispatch({
        type: LOAD_ALL_AIRQLOUDS_FAILURE,
        payload: err,
      });
    });
};

export const setCurrentAirQloudData = (airqloud) => (dispatch) => {
  localStorage.setItem(CURRENT_AIRQLOUD_KEY, JSON.stringify(airqloud));
  dispatch({
    type: SET_CURRENT_AIRQLOUD_SUCCESS,
    payload: createAirqloudSiteOptions(airqloud),
  });
};

export const setDefaultAirQloud = () => async (dispatch) => {
  if (localStorage[CURRENT_AIRQLOUD_KEY]) {
    dispatch({
      type: SET_CURRENT_AIRQLOUD_SUCCESS,
      payload: JSON.parse(localStorage[CURRENT_AIRQLOUD_KEY]),
    });
  } else {
    const { airqlouds } = await getAirQloudsApi({});
    if (isEmpty(airqlouds)) return;
    const current = airqlouds.filter(
      (airqloud) => airqloud.long_name === "Uganda"
    );
    dispatch(setCurrentAirQloudData((current.length > 0 && current[0]) || {}));
    dispatch({
      type: LOAD_ALL_AIRQLOUDS_SUCCESS,
      payload: transformArray(airqlouds, "_id"),
    });
  }
};
