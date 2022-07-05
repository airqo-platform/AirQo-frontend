import { requestDataAccessApi } from 'apis';
import {
  UPDATE_EXPLORE_DATA_SUCCESS,
  UPDATE_EXPLORE_DATA_FAILURE,
  EXPLORE_DATA_REQUEST_SUCCESS,
  EXPLORE_DATA_REQUEST_FAILURE,
} from './actions';

export const postExploreDataRequest = (data) => async (dispatch) => await requestDataAccessApi(data)
  .then(() => {
    dispatch({
      type: EXPLORE_DATA_REQUEST_SUCCESS,
      payload: { ...data, success: true },
    });
  })
  .catch((err) => {
    console.log(err);
  });

export const updateExploreData = (data) => (dispatch) => {
  dispatch({
    type: UPDATE_EXPLORE_DATA_SUCCESS,
    payload: data,
  });
}
