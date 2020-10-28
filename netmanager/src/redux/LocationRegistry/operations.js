// for representing chained operations using redux-thunk
import {
    LOAD_ALL_LOCATIONS_SUCCESS,
    LOAD_ALL_LOCATIONS_FAILURE,
} from "./actions";
import { getAllLocationsApi } from "../../views/apis/location";


export const loadLocationsData = () => {
  return async (dispatch) => {
    return await getAllLocationsApi()
      .then((locationData) => {
          dispatch({
              type: LOAD_ALL_LOCATIONS_SUCCESS,
              payload: locationData,
          });
      })
      .catch((err) => {
        dispatch({
          type: LOAD_ALL_LOCATIONS_FAILURE,
          payload: err,
        });
      });
  };
};
