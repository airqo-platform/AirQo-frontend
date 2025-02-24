import { LOAD_ACTIVE_SERVICE_SUCCESS, LOAD_LOGS_SUCCESS } from './actions';

export const setActiveService = (service) => (dispatch) => {
  return dispatch({
    type: LOAD_ACTIVE_SERVICE_SUCCESS,
    payload: service
  });
};

export const loadLogs = (services) => (dispatch) => {
  dispatch({
    type: LOAD_LOGS_SUCCESS,
    payload: services
  });
};
