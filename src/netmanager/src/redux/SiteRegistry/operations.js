import {
  LOAD_SITES_SUCCESS,
  LOAD_SITES_FAILURE,
  LOAD_SITE_OPTIONS_SUCCESS,
  LOAD_SITES_SUMMARY_SUCCESS,
  LOAD_SITES_SUMMARY_FAILURE,
  GET_SITE_DETAILS_SUCCESS,
  GET_SITE_DETAILS_FAILURE
} from './actions';
import { getSitesApi, getSitesSummaryApi } from 'views/apis/deviceRegistry';
import { transformArray } from '../utils';
import { createSiteOptions } from 'utils/sites';

export const loadSitesData = (networkID) => {
  return async (dispatch) => {
    return await getSitesApi({ network: networkID })
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

export const loadSitesSummary = (networkID) => {
  return async (dispatch) => {
    return await getSitesSummaryApi({ network: networkID })
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

export const loadSiteDetails = (siteId, networkID) => {
  return async (dispatch) => {
    return await getSitesApi({ id: siteId, network: networkID })
      .then((responseData) => {
        const siteDetails = responseData.sites[0];
        dispatch({
          type: GET_SITE_DETAILS_SUCCESS,
          payload: siteDetails
        });
      })
      .catch((err) => {
        dispatch({
          type: GET_SITE_DETAILS_FAILURE,
          payload: err
        });
      });
  };
};

export const clearSiteDetails = () => {
  return (dispatch) => {
    dispatch({
      type: GET_SITE_DETAILS_SUCCESS,
      payload: {}
    });
  };
};
