import {
  LOAD_ALL_AIRQLOUDS_SUCCESS,
  LOAD_ALL_AIRQLOUDS_FAILURE,
  SET_CURRENT_AIRQLOUD_SUCCESS,
  SET_CURRENT_AIRQLOUD_FAILURE,
} from "./actions";
import { isEmpty } from "underscore";
import { getAirQloudsApi } from "views/apis/deviceRegistry";
import { transformArray } from "../utils";

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
  dispatch({
    type: SET_CURRENT_AIRQLOUD_SUCCESS,
    payload: airqloud,
  });
};
