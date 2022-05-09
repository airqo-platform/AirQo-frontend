// eslint-disable-next-line import/named
import { LOAD_AIRQLOUDS_SUMMARY_SUCCESS, SET_CURRENT_AIRQLOUD_SUCCESS } from './actions';

const initialState = {
  summary: {},
  currentAirqloud: 'Uganda',
};

export default function (state = initialState, action) {
  switch (action.type) {
    case LOAD_AIRQLOUDS_SUMMARY_SUCCESS:
      return { ...state, summary: action.payload };

    case SET_CURRENT_AIRQLOUD_SUCCESS:
      return { ...state, currentAirqloud: action.payload };

    default:
      return state;
  }
}
