import {
  LOAD_ACTIVITY_SUCCESS,
  LOAD_ACTIVITY_FAILURE,
  LOAD_ACTIVITY_OPTIONS_SUCCESS,
  LOAD_ACTIVITIES_SUMMARY_SUCCESS,
  LOAD_ACTIVITIES_SUMMARY_FAILURE,
  GET_ACTIVITY_DETAILS_SUCCESS,
  GET_ACTIVITY_DETAILS_FAILURE
} from './actions';
import { getActivitiesApi, getActivitiesSummaryApi } from 'views/apis/deviceRegistry';
import { transformArray } from '../utils';
import { createSiteOptions } from 'utils/sites';
import { createActivitiesOptions } from 'utils/sites';

export const loadActivitiesData = (networkID) => {
  return async (dispatch) => {
    return await getActivitiesApi({ network: networkID })
      .then((responseData) => {
        dispatch({
          type: LOAD_ACTIVITY_SUCCESS,
          payload: transformArray(responseData.site_activities || [], '_id')
        });
        dispatch({
          type: LOAD_ACTIVITY_OPTIONS_SUCCESS,
          payload: createActivitiesOptions(responseData.site_activities || [])
        });
      })
      .catch((err) => {
        dispatch({
          type: LOAD_ACTIVITY_FAILURE,
          payload: err
        });
      });
  };
};

export const loadActivitiesSummary = (networkID) => {
  return async (dispatch) => {
    return await getActivitiesSummaryApi({ network: networkID })
      .then((responseData) => {
        dispatch({
          type: LOAD_ACTIVITIES_SUMMARY_SUCCESS,
          payload: transformArray(responseData.site_activities || [], '_id')
        });
        dispatch({
          type: LOAD_ACTIVITY_OPTIONS_SUCCESS,
          payload: createActivitiesOptions(responseData.site_activities || [])
        });
      })
      .catch((err) => {
        dispatch({
          type: LOAD_ACTIVITIES_SUMMARY_FAILURE,
          payload: err
        });
      });
  };
};

// export const loadSiteDetails = (siteId, networkID) => {
//   return async (dispatch) => {
//     return await getSitesApi({ id: siteId, network: networkID })
//       .then((responseData) => {
//         const siteDetails = responseData.sites[0];
//         dispatch({
//           type: GET_ACTIVITY_DETAILS_SUCCESS,
//           payload: siteDetails
//         });
//       })
//       .catch((err) => {
//         dispatch({
//           type: GET_ACTIVITY_DETAILS_FAILURE,
//           payload: err
//         });
//       });
//   };
// };

// export const clearSiteDetails = () => {
//   return (dispatch) => {
//     dispatch({
//       type: GET_ACTIVITY_DETAILS_SUCCESS,
//       payload: {}
//     });
//   };
// };
