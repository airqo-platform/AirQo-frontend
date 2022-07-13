// eslint-disable-next-line import/named
import { LOAD_CAREERS_SUCCESS } from './actions';

const initialState = {
  listing: {},
};

export default function (state = initialState, action) {
  switch (action.type) {
    case LOAD_CAREERS_SUCCESS:
      return { ...state, listing: action.payload };

    default:
      return state;
  }
}
