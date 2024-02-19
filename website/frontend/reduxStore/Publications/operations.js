import { isEmpty } from 'underscore';
import { getAllPublicationsApi } from '../../apis';
import { LOAD_PUBLICATIONS_FAILURE, LOAD_PUBLICATIONS_SUCCESS } from './actions';

export const loadPublicationsData = () => async (dispatch, getState) => {
  const lang = getState().eventsNavTab.languageTab;
  await getAllPublicationsApi(lang)
    .then((resData) => {
      if (isEmpty(resData || [])) return;
      dispatch({
        type: LOAD_PUBLICATIONS_SUCCESS,
        payload: resData
      });
    })
    .catch((err) => {
      dispatch({
        type: LOAD_PUBLICATIONS_FAILURE,
        payload: err && err.message
      });
    });
};
