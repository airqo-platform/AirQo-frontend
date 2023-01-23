// eslint-disable-next-line import/named
import { LOAD_TEAM_SUCCESS, UPDATE_TEAM_LOADER_SUCCESS } from './actions';

const initialState = {
  loading: false,
  team: [],
};

export default function (state = initialState, action) {
  switch (action.type) {
    case LOAD_TEAM_SUCCESS:
      return { ...state, team: action.payload };

    case UPDATE_TEAM_LOADER_SUCCESS:
      return { ...state, ...action.payload };

    default:
      return state;
  }
}
