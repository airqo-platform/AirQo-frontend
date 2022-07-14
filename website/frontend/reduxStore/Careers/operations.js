import { isEmpty } from 'underscore';
import { getAllCareersApi, getAllDepartmentsApi } from 'apis';
import {
  LOAD_CAREERS_SUCCESS,
  LOAD_CAREERS_FAILURE,
  UPDATE_CAREERS_LOADER_SUCCESS,
  UPDATE_CAREERS_LOADER_FAILURE,
  LOAD_DEPARTMENTS_SUCCESS,
  LOAD_DEPARTMENTS_FAILURE,
} from './actions';
import { transformArray } from '../utils';

export const loadCareersListingData = () => async (dispatch) => {
  dispatch({ type: UPDATE_CAREERS_LOADER_SUCCESS, payload: { loading: true } });
  await getAllCareersApi()
    .then((resData) => {
      if (isEmpty(resData || [])) return;
      dispatch({
        type: LOAD_CAREERS_SUCCESS,
        payload: transformArray(resData, 'unique_title'),
      });
    })
    .catch((err) => {
      dispatch({
        type: LOAD_CAREERS_FAILURE,
        payload: err && err.message,
      });
    });
  dispatch({ type: UPDATE_CAREERS_LOADER_SUCCESS, payload: { loading: false } });
};

export const loadCareersDepartmentsData = () => async (dispatch) => {
  await getAllDepartmentsApi().then((resData) => {
    if (isEmpty(resData || [])) return;
    dispatch({
      type: LOAD_DEPARTMENTS_SUCCESS,
      payload: resData,
    });
  })
    .catch((err) => {
      dispatch({
        type: LOAD_DEPARTMENTS_FAILURE,
        payload: err && err.message,
      });
    });
};
