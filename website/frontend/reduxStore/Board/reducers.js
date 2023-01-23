// eslint-disable-next-line import/named
import { LOAD_BOARD_SUCCESS, UPDATE_BOARD_LOADER_SUCCESS } from './actions';

const initialState = {
  loading: false,
  board: []
};

export default function (state = initialState, action) {
  switch (action.type) {
    case LOAD_BOARD_SUCCESS:
      return { ...state, board: action.payload };

    case UPDATE_BOARD_LOADER_SUCCESS:
      return { ...state, ...action.payload };

    default:
      return state;
  }
}
