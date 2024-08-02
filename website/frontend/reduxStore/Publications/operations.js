import { isEmpty } from 'underscore';
import { getAllPublicationsApi } from '../../apis';
import {
  LOAD_PUBLICATIONS_REQUEST,
  LOAD_PUBLICATIONS_SUCCESS,
  LOAD_PUBLICATIONS_FAILURE,
} from './actions';

export const loadPublicationsData = () => async (dispatch, getState) => {
  const lang = getState().eventsNavTab.languageTab;

  dispatch({ type: LOAD_PUBLICATIONS_REQUEST });

  try {
    const resData = await getAllPublicationsApi(lang);
    if (isEmpty(resData || [])) return;
    dispatch({
      type: LOAD_PUBLICATIONS_SUCCESS,
      payload: resData,
    });
  } catch (err) {
    dispatch({
      type: LOAD_PUBLICATIONS_FAILURE,
      payload: err && err.message,
    });
  }
};
