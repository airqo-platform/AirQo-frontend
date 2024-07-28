import { LOAD_ACTIVITIES_SUMMARY_SUCCESS } from '../actions';

const initialState = {};

export default function (state = initialState, action) {
  switch (action.type) {
    case LOAD_ACTIVITIES_SUMMARY_SUCCESS:
      return action.payload;

    default:
      return state;
  }
}
