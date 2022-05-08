// eslint-disable-next-line import/named
import { LOAD_AIRQLOUDS_SUMMARY_SUCCESS } from './actions';

const initialState = {
  summary: {},
};

export default function (state = initialState, action) {
  switch (action.type) {
    case LOAD_AIRQLOUDS_SUMMARY_SUCCESS:
      return { ...state, summary: action.payload };

    default:
      return state;
  }
}
