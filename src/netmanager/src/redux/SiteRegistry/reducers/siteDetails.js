import { GET_SITE_DETAILS_SUCCESS } from '../actions';

const initialState = {};

export default function (state = initialState, action) {
  switch (action.type) {
    case GET_SITE_DETAILS_SUCCESS:
      return action.payload;

    default:
      return state;
  }
}
