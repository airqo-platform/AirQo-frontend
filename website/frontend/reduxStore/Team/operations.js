import { isEmpty } from 'underscore';
import { getAllTeamMembersApi } from 'apis';
import {
  LOAD_TEAM_SUCCESS,
  LOAD_TEAM_FAILURE,
  UPDATE_TEAM_LOADER_SUCCESS,
  UPDATE_TEAM_LOADER_FAILURE,
} from './actions';

export const loadTeamData = () => async (dispatch) => {
  dispatch({ type: UPDATE_TEAM_LOADER_SUCCESS, payload: { loading: true } });
  await getAllTeamMembersApi()
    .then((resData) => {
      if (isEmpty(resData || [])) return;
      dispatch({
        type: LOAD_TEAM_SUCCESS,
        payload: resData,
      });
    })
    .catch((err) => {
      dispatch({
        type: LOAD_TEAM_FAILURE,
        payload: err && err.message,
      });
    });

  dispatch({ type: UPDATE_TEAM_LOADER_SUCCESS, payload: { loading: false } });
};
