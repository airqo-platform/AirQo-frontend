import { isEmpty } from 'underscore';
import { getAllPressApi } from '../../apis';
import { LOAD_PRESS_FAILURE, LOAD_PRESS_SUCCESS } from './actions';

export const loadPressData = () => async (dispatch) => {
  await getAllPressApi()
    .then((resData) => {
      if (isEmpty(resData || [])) return;
      dispatch({
        type: LOAD_PRESS_SUCCESS,
        payload: resData
      });
    })
    .catch((err) => {
      dispatch({
        type: LOAD_PRESS_FAILURE,
        payload: err && err.message
      });
    });
};
