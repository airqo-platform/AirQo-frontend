// eslint-disable-next-line import/named
import { LOAD_CAREERS_SUCCESS, UPDATE_CAREERS_LOADER_SUCCESS } from './actions';

const initialState = {
  loading: false,
  listing: {},
};

export default function (state = initialState, action) {
  switch (action.type) {
    case LOAD_CAREERS_SUCCESS:
      return { ...state, listing: action.payload };

    case UPDATE_CAREERS_LOADER_SUCCESS:
      return { ...state, ...action.payload }

    default:
      return state;
  }
}
