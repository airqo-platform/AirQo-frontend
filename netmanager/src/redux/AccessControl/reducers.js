import { LOAD_ALL_USER_ROLES_SUCCESS } from './actions';

const initialState = {
  userRoles: null
};

export default function accessControlReducer(state = initialState, action) {
  switch (action.type) {
    case LOAD_ALL_USER_ROLES_SUCCESS:
      return { ...state, userRoles: action.payload };
    default:
      return state;
  }
}
