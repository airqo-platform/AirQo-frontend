import { SET_LATITUDE_AND_LONGITUDE } from './actions';

const initialState = {
  geometry: {}
};

export default function (state = initialState, action) {
  switch (action.type) {
    case SET_LATITUDE_AND_LONGITUDE:
      return { ...state, geometry: action.payload };
    default:
      return state;
  }
}
