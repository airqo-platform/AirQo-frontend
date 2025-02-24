import { SET_LATITUDE_AND_LONGITUDE } from './actions';

export const setLatAndLng = (lat, lng, place_id) => (dispatch) => {
  dispatch({
    type: SET_LATITUDE_AND_LONGITUDE,
    payload: { lat, lng, place_id }
  });
};

export const clearLatAndLng = () => (dispatch) => {
  dispatch({
    type: SET_LATITUDE_AND_LONGITUDE,
    payload: {}
  });
};
