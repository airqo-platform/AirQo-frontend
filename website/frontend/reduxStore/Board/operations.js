import { isEmpty } from 'underscore';
import { getBoardMembersApi } from 'apis';
import {
  LOAD_BOARD_SUCCESS,
  LOAD_BOARD_FAILURE,
  UPDATE_BOARD_LOADER_SUCCESS,
  UPDATE_BOARD_LOADER_FAILURE
} from './actions';

export const loadBoardData = () => async (dispatch) => {
  dispatch({ type: UPDATE_BOARD_LOADER_SUCCESS, payload: { loading: true } });
  await getBoardMembersApi()
    .then((resData) => {
      if (isEmpty(resData || [])) return;
      dispatch({
        type: LOAD_BOARD_SUCCESS,
        payload: resData
      });
    })
    .catch((err) => {
      dispatch({
        type: LOAD_BOARD_FAILURE,
        payload: err && err.message
      });
    });

  dispatch({ type: UPDATE_BOARD_LOADER_SUCCESS, payload: { loading: false } });
};
