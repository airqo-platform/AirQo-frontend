import { isEmpty } from 'underscore';
import { getAllPartnersApi } from '../../apis';
import { LOAD_PARTNERS_FAILURE, LOAD_PARTNERS_SUCCESS } from './actions';

export const loadPartnersData = () => async (dispatch, getState) => {
  const lang = getState().eventsNavTab.languageTab;
  await getAllPartnersApi(lang)
    .then((resData) => {
      if (isEmpty(resData || [])) return;
      dispatch({
        type: LOAD_PARTNERS_SUCCESS,
        payload: resData,
      });
    })
    .catch((err) => {
      dispatch({
        type: LOAD_PARTNERS_FAILURE,
        payload: err && err.message,
      });
    });
};
