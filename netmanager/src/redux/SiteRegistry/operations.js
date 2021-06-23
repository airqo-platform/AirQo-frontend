// for representing chained operations using redux-thunk
import { LOAD_SITES_SUCCESS, LOAD_SITES_FAILURE } from "./actions";
import { getSitesApi } from "views/apis/deviceRegistry";

export const loadSitesData = () => {
  return async (dispatch) => {
    return await getSitesApi()
      .then((responseData) => {
        dispatch({
          type: LOAD_SITES_SUCCESS,
          payload: responseData.sites || [],
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
