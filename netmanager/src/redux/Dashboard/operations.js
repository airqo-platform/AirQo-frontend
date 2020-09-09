// for representing chained operations using redux-thunk
import {
  REFRESH_FILTER_LOCATION_DATA_SUCCESS,
  REFRESH_FILTER_LOCATION_DATA_ERROR,
} from "./actions";
import constants from "../../config/constants";

export const refreshFilterLocationData = () => {
  return async (dispatch) => {
    return await fetch(constants.GET_MONITORING_SITES_LOCATIONS_URI)
      .then((res) => res.json())
      .then((filterLocationsData) => {
        dispatch({
          type: REFRESH_FILTER_LOCATION_DATA_SUCCESS,
          payload: filterLocationsData.airquality_monitoring_sites,
        });
      })
      .catch((err) => {
        dispatch({
          type: REFRESH_FILTER_LOCATION_DATA_ERROR,
          payload: err,
        });
      });
  };
};
