import { LOAD_PRESS_SUCCESS } from './actions';

const initialState = {
  loading: false,
  press: []
};

export default function (state = initialState, action) {
  switch (action.type) {
    case LOAD_PRESS_SUCCESS:
      return { ...state, press: action.payload };

    default:
      return state;
  }
}
