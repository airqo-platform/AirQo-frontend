// for representing chained operations using redux-thunk
import { transformArray } from "../utils";

import { LOAD_SITES_SUCCESS, LOAD_SITES_FAILURE } from "./actions";
import { getSitesApi } from "views/apis/deviceRegistry";

export const loadSitesData = () => {
  return async (dispatch) => {
    return await getSitesApi()
      .then((responseData) => {
        dispatch({
          type: LOAD_SITES_SUCCESS,
          payload: transformArray(responseData.sites || [], '_id'),
        });
      })
      .catch((err) => {
        dispatch({
          type: LOAD_SITES_FAILURE,
          payload: err,
        });
      });
  };
};
