import axios from "axios";

import {
  GET_ERRORS,
  GET_MAINTENANCE_REQUEST,
  GET_MAINTENANCE_SUCCESS,
  GET_MAINTENANCE_FAILED,
  GET_ISSUES_FAILED,
  GET_ISSUES_SUCCESS,
  GET_ISSUES_REQUEST,
} from "./types";

import constants from "../../config/constants";

/*************************** fetching maintenance records  ********************************* */
export const fetchAlerts = () => {
  return (dispatch) => {
    dispatch(fetchAlertsRequest());
    // Returns a promise
    console.log("fetching maintenances from API.... ");
    return fetch(constants.GET_MAINTENANCE_URI).then((response) => {
      if (response.ok) {
        response.json().then((data) => {
          dispatch(fetchAlertsSuccess(data.logs, data.message));
        });
      } else {
        response.json().then((error) => {
          dispatch(fetchAlertsFailed(error));
        });
      }
    });
  };
};

export const fetchAlertsRequest = () => {
  return {
    type: GET_MAINTENANCE_REQUEST,
  };
};

export const fetchAlertsSuccess = (logs, message) => {
  console.log("sending maintenances logs to Reducer....");
  console.dir(logs);
  return {
    type: GET_MAINTENANCE_SUCCESS,
    maintenanceLogs: logs,
    message: message,
    receiveAt: Date.now,
  };
};

export const fetchAlertsFailed = (error) => {
  return {
    type: GET_MAINTENANCE_FAILED,
    error,
  };
};

/**************************** fetching issues  ****************************************/

export const fetchIssues = () => {
  return (dispatch) => {
    dispatch(fetchIssuesRequest());
    // Returns a promise
    console.log("fetching issues from API...");
    return fetch(constants.GET_ISSUES_URI).then((response) => {
      if (response.ok) {
        response.json().then((data) => {
          dispatch(fetchIssuesSuccess(data.logs, data.message));
        });
      } else {
        response.json().then((error) => {
          dispatch(fetchIssuesFailed(error));
        });
      }
    });
  };
};

export const fetchIssuesRequest = () => {
  return {
    type: GET_ISSUES_REQUEST,
  };
};

export const fetchIssuesSuccess = (logs, message) => {
  console.log("sending issues to Reducer... ");
  console.dir(logs);
  return {
    type: GET_ISSUES_SUCCESS,
    issueLogs: logs,
    message: message,
    receiveAt: Date.now,
  };
};

export const fetchIssuesFailed = (error) => {
  return {
    type: GET_ISSUES_FAILED,
    error,
  };
};
