// for representing chained operations using redux-thunk
import { isEmpty } from "underscore";
import {
  GET_ALL_REPORTS_DATA_SUCCESS,
  GET_ALL_REPORTS_DATA_FAILURE,
} from "./actions";
import { getAllReportsApi } from "views/apis/analytics";

export const loadAllReports = () => async (dispatch) => {
  return await getAllReportsApi()
    .then((res) => {
      if (isEmpty(res.data)) return;
      dispatch({
        type: GET_ALL_REPORTS_DATA_SUCCESS,
        payload: res.data,
      });
    })
    .catch((err) => {
      dispatch({
        type: GET_ALL_REPORTS_DATA_FAILURE,
        payload: err,
      });
    });
};
