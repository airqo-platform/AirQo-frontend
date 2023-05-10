import {
  LOAD_SITES_SUCCESS,
  LOAD_SITES_FAILURE,
  LOAD_SITE_OPTIONS_SUCCESS,
  LOAD_SITES_SUMMARY_SUCCESS,
  LOAD_SITES_SUMMARY_FAILURE
} from './actions';
import { getSitesApi, getSitesSummaryApi } from 'views/apis/deviceRegistry';
import { transformArray } from '../utils';
import { createSiteOptions } from 'utils/sites';

export const loadSitesData = () => {
  return async (dispatch) => {
    return await getSitesApi()
      .then((responseData) => {
        dispatch({
          type: LOAD_SITES_SUCCESS,
          payload: transformArray(responseData.sites || [], '_id')
        });
        dispatch({
          type: LOAD_SITE_OPTIONS_SUCCESS,
          payload: createSiteOptions(responseData.sites || [])
        });
      })
      .catch((err) => {
        dispatch({
          type: LOAD_SITES_FAILURE,
          payload: err
        });
      });
  };
};

export const loadSitesSummary = () => {
  return async (dispatch) => {
    return await getSitesSummaryApi()
      .then((responseData) => {
        dispatch({
          type: LOAD_SITES_SUMMARY_SUCCESS,
          payload: transformArray(responseData.sites || [], '_id')
        });
        dispatch({
          type: LOAD_SITE_OPTIONS_SUCCESS,
          payload: createSiteOptions(responseData.sites || [])
        });
      })
      .catch((err) => {
        dispatch({
          type: LOAD_SITES_SUMMARY_FAILURE,
          payload: err
        });
      });
  };
};
